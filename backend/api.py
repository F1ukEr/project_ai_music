import os
import time
import json
import threading
import uuid
import tempfile
import scipy.io.wavfile
import torch
import urllib.parse
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from transformers import AutoProcessor, MusicgenForConditionalGeneration, LogitsProcessor, LogitsProcessorList

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# เชื่อมต่อ Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)

# โหลด Model (เหมือนเดิม)
print("⏳ กำลังโหลดสมอง MusicGen...")
processor = AutoProcessor.from_pretrained("facebook/musicgen-medium")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-medium")
device = "cuda:0" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"✅ พร้อมทำงานบน: {device.upper()}")

# --- ปรับ Progress Processor สำหรับ Supabase ---
class ProgressLogitsProcessor(LogitsProcessor):
    def __init__(self, task_id, max_tokens):
        self.task_id = task_id
        self.max_tokens = max_tokens
        self.step = 0

    def __call__(self, input_ids, scores):
        self.step += 1
        progress = int((self.step / self.max_tokens) * 100)
        if progress > 99: progress = 99
        
        # อัปเดตทุก 50 steps เพื่อไม่ให้ Database ทำงานหนักเกินไป
        if self.step % 50 == 0: 
            supabase.table('music_database').update({'progress': progress}).eq('id', self.task_id).execute()
        return scores

def generate_music_thread(task_id, prompt, max_new_tokens, title):
    start_time = time.time()
    try:
        inputs = processor(text=[prompt], padding=True, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        progress_processor = ProgressLogitsProcessor(task_id, max_new_tokens)
        logits_processor = LogitsProcessorList([progress_processor])
        
        audio_values = model.generate(
            **inputs, 
            max_new_tokens=max_new_tokens, 
            logits_processor=logits_processor
        )
        
        sampling_rate = model.config.audio_encoder.sampling_rate
        audio_data = audio_values[0, 0].cpu().numpy()

        # บันทึกไฟล์ชั่วคราวและอัปโหลดไป Supabase Storage
        temp_file = os.path.join(tempfile.gettempdir(), f"{task_id}.wav")
        scipy.io.wavfile.write(temp_file, rate=sampling_rate, data=audio_data)
        
        with open(temp_file, 'rb') as f:
            supabase.storage.from_("Music").upload(f"{task_id}.wav", f)
        
        public_url = supabase.storage.from_("Music").get_public_url(f"{task_id}.wav")
        duration = time.time() - start_time

        minutes = int(duration // 60) # แปลงวินาทีเป็นนาที
        seconds = int(duration % 60) # วินาทีที่เหลือ
        print(f"✅ เสร็จสิ้นใน {minutes} นาที {seconds} วินาที! URL: {public_url}")
        
        # 🟢 อัปเดตสถานะใน Supabase DB
        supabase.table('music_database').update({
            'status': 'completed',
            'progress': 100,
            'audio_url': public_url,
            'execution_time': round(duration, 2)
        }).eq('id', task_id).execute()

        if os.path.exists(temp_file): os.remove(temp_file)
            
    except Exception as e:
        duration = time.time() - start_time
        minutes = int(duration // 60) # แปลงวินาทีเป็นนาที
        seconds = int(duration % 60) # วินาทีที่เหลือ
        # 🟢 อัปเดตสถานะเป็นล้มเหลวใน Supabase
        print(f"❌ Error: {e} ⏱️ (ล้มเหลวหลังจากใช้เวลาไป {minutes} นาที {seconds} วินาที)")
        supabase.table('music_database').delete().eq('id', task_id).execute()


@app.route('/generate-task', methods=['POST'])
def start_generation_task():
    data = request.get_json(force=True, silent=True) or {}
    prompt = data.get('prompt', 'upbeat music')
    title = data.get('title', 'Untitled Track')
    task_id = str(uuid.uuid4())
    
    # 🟢 บันทึกลง Supabase DB ครั้งแรก
    supabase.table('music_database').insert({
        'id': task_id,
        'user_id': data.get('user_id', 'anonymous'),
        'title': title,
        'prompt': prompt,
        'status': 'processing'
    }).execute()
        
    threading.Thread(target=generate_music_thread, args=(task_id, prompt, 1500, title)).start()
    return jsonify({"task_id": task_id})

@app.route('/status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    # 🟢 ดึงข้อมูลจาก Supabase
    res = supabase.table('music_database').select('*').eq('id', task_id).execute()
    if res.data:
        return jsonify(res.data[0])
    return jsonify({"status": "failed", 
        "error": "ระบบขัดข้องระหว่างการสร้างเพลง (ข้อมูลถูกลบทิ้งแล้ว)"})

@app.route('/history', methods=['GET'])
def get_history():
    try:
        user_id = request.args.get('user_id')
        query = supabase.table('music_database').select('*').eq('status', 'completed')
        
        if user_id:
            query = query.eq('user_id', user_id)
            
        query = query.order('created_at', desc=True).limit(10)
        res = query.execute()
        
        history_list = []
        for d in res.data:
            # 🟢 ป้องกัน Error กรณีไอดีหรือชื่อเพลงหาย
            task_id_str = str(d.get("id", ""))
            title_str = d.get("title")
            if not title_str:
                title_str = f"เพลง AI ({task_id_str[:4]})"
                
            history_list.append({
                "id": task_id_str,
                "taskId": task_id_str, # React ต้องการคำนี้
                "title": title_str,
                "prompt": d.get("prompt", ""),
                "date": d.get("created_at", ""),
                "audio_url": d.get("audio_url", "")
            })
            
        return jsonify(history_list)
        
    except Exception as e:
        import traceback
        print("\n❌ เจอ Error ในหน้าประวัติ (History):")
        traceback.print_exc() # พ่น Error สีแดงลง Terminal
        # 🟢 คืนค่า Array ว่างๆ ไปก่อน หน้าเว็บ React จะได้ไม่ขึ้นหน้า Error สีแดง
        return jsonify([])

if __name__ == '__main__':
    # สำหรับ Hugging Face ใช้ Port 7860
    app.run(host='0.0.0.0', port=8000, debug=False)