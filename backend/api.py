import os
import time
from turtle import title # 🟢 นำเข้าโมดูลจับเวลา
local_path = "E:/Project/music-ai-project/hf_cache"
if os.path.exists(local_path):
    os.environ["HF_HOME"] = local_path
    print(f"🏠 Running on Local: Using cache at {local_path}")
else:
    print("☁️ Running on Hugging Face: Using default cache location")
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
import scipy.io.wavfile
from transformers import AutoProcessor, MusicgenForConditionalGeneration, LogitsProcessor, LogitsProcessorList
import threading
import uuid
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# --- 1. ตั้งค่าและเชื่อมต่อ Firebase แบบรองรับ Cloud ---
try:
    # 🟢 1. ลองหาตัวแปรลับ (Secrets) จาก Environment ก่อน (สำหรับบน Hugging Face)
    firebase_secrets = os.environ.get('FIREBASE_CREDENTIALS')
    
    if firebase_secrets:
        # ถ้ามีข้อมูลลับ ให้แปลงกลับเป็น Dictionary
        cred_dict = json.loads(firebase_secrets)
        cred = credentials.Certificate(cred_dict)
        print("✅ เชื่อมต่อ Firebase สำเร็จ (ผ่าน Environment Variables)")
    else:
        # 🟢 2. ถ้าไม่มีตัวแปรลับ ให้หาไฟล์ .json ในเครื่อง (สำหรับรัน Local)
        # เช็คด้วยว่ามีไฟล์อยู่จริงไหมก่อนเรียกใช้
        if os.path.exists("serviceKey.json"):
            cred = credentials.Certificate("serviceKey.json")
            print("✅ เชื่อมต่อ Firebase สำเร็จ (ผ่านไฟล์ serviceKey.json)")
        else:
            raise FileNotFoundError("ไม่พบข้อมูลรับรอง Firebase!")

    # สั่งเชื่อมต่อ
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    
except Exception as e:
    print(f"❌ ระบบไม่สามารถเชื่อมต่อ Firebase ได้: {e}")
    # ในกรณีจริง ถ้าระบบเชื่อม DB ไม่ได้ อาจจะต้องปิด Server ทิ้ง
    # exit(1)

app = Flask(__name__)
CORS(app) 

print("⏳ กำลังโหลดสมอง MusicGen... (รอสักครู่)")
processor = AutoProcessor.from_pretrained("facebook/musicgen-medium")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-medium")
device = "cuda:0" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"✅ โหลดเสร็จสมบูรณ์! พร้อมทำงานบน: {device.upper()}")

class ProgressLogitsProcessor(LogitsProcessor):
    def __init__(self, task_id, max_tokens):
        self.task_id = task_id
        self.max_tokens = max_tokens
        self.step = 0
        self.doc_ref = db.collection('tasks').document(self.task_id)

    def __call__(self, input_ids, scores):
        self.step += 1
        progress = int((self.step / self.max_tokens) * 100)
        if progress > 99: progress = 99
        
        if self.step % 20 == 0: 
            self.doc_ref.update({'progress': progress})
        return scores

def generate_music_thread(task_id, prompt, max_new_tokens):
    start_time = time.time() # 🟢 เริ่มจับเวลา!
    doc_ref = db.collection('tasks').document(task_id)
    try:
        inputs = processor(text=[prompt], padding=True, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
                
        progress_processor = ProgressLogitsProcessor(task_id, max_new_tokens)
        logits_processor = LogitsProcessorList([progress_processor])
                
        print(f"⚙️ [Task: {task_id[:6]}] กำลังแต่งเพลง '{title}'...")
        audio_values = model.generate(
            **inputs, 
            max_new_tokens=max_new_tokens, 
            logits_processor=logits_processor
        )
                
        sampling_rate = model.config.audio_encoder.sampling_rate
        audio_data = audio_values[0, 0].cpu().numpy()
                
        output_filename = f"{title.replace(' ', '_')}.wav"
        scipy.io.wavfile.write(output_filename, rate=sampling_rate, data=audio_data)
        
        end_time = time.time() # 🟢 สิ้นสุดการจับเวลา
        duration = end_time - start_time # 🟢 คำนวณเวลาที่ใช้ไป
        
        # 🟢 แสดงเวลาใน Console
        print(f"✅ [Task: {task_id[:6]}] เสร็จสมบูรณ์! ⏱️ ใช้เวลาไปทั้งหมด: {duration:.2f} วินาที")
        
        doc_ref.update({
            'status': 'completed',
            'progress': 100,
            'filename': output_filename,
            'execution_time': round(duration, 2) # 🟢 บันทึกเวลาลง Firebase ด้วย
        })
            
    except Exception as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"❌ Error: {e} ⏱️ (ล้มเหลวหลังจากใช้เวลาไป {duration:.2f} วินาที)")
        doc_ref.update({
            'status': 'failed',
            'error': str(e),
            'execution_time': round(duration, 2)
        })

@app.route('/generate-task', methods=['POST'])
def start_generation_task():
    data = request.get_json(force=True, silent=True) or {}
    prompt = data.get('prompt', 'upbeat music')
    
    # 🟢 รับชื่อเพลงมาจาก React (ถ้าไม่ส่งมาให้ใช้ชื่อ Default)
    title = data.get('title', 'Untitled Track') 
    
    max_new_tokens = 1500 
    task_id = str(uuid.uuid4())
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    db.collection('tasks').document(task_id).set({
        'id': task_id,
        'title': title, # 🟢 บันทึกชื่อเพลงลงฐานข้อมูล
        'prompt': prompt,
        'status': 'processing',
        'progress': 0,
        'filename': '',
        'error': '',
        'execution_time': 0,
        'created_at': created_at
    })
        
    threading.Thread(target=generate_music_thread, args=(task_id, prompt, max_new_tokens, title)).start()
    return jsonify({"task_id": task_id})

@app.route('/status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    doc = db.collection('tasks').document(task_id).get()
    if doc.exists:
        return jsonify(doc.to_dict())
    else:
        return jsonify({"error": "ไม่พบข้อมูลงานนี้"}), 404

@app.route('/download/<task_id>', methods=['GET'])
def download_music(task_id):
    doc = db.collection('tasks').document(task_id).get()
    if doc.exists:
        task_data = doc.to_dict()
        if task_data['status'] == 'completed' and os.path.exists(task_data['filename']):
            return send_file(task_data['filename'], as_attachment=True, mimetype="audio/wav")
    return jsonify({"error": "File not found"}), 404

@app.route('/history', methods=['GET'])
def get_history():
    last_date = request.args.get('last_date')
    limit = 10 # จำนวนรายการที่ต้องการดึงเพิ่ม
    query = db.collection('tasks')\
             .where('status', '==', 'completed')\
             .order_by('created_at', direction=firestore.Query.DESCENDING)\
             .limit(limit)
    if last_date:
        query = query.start_after({'created_at': last_date})
    docs = query.stream()
    
    history_list = []
    for doc in docs:
        d = doc.to_dict()
        history_list.append({
            "id": d["id"],
            "taskId": d["id"],
            "title": d.get("title", f"เพลง AI ({d['id'][:4]})"), # 🟢 ดึงชื่อเพลงของจริงมาโชว์
            "prompt": d["prompt"],
            "date": d.get("created_at", "")
        })
        
    return jsonify(history_list)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)