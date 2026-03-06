from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
import scipy.io.wavfile
from transformers import AutoProcessor, MusicgenForConditionalGeneration, LogitsProcessor, LogitsProcessorList
import os
import threading
import uuid

app = Flask(__name__)
# อนุญาตให้ React (หน้าบ้าน) ส่งข้อมูลเข้ามาได้
CORS(app) 

# --- 1. โหลดโมเดลรอไว้ตั้งแต่ตอนเปิด Server ---
print("⏳ กำลังโหลดสมอง MusicGen... (รอสักครู่)")
processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

device = "cuda:0" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"✅ โหลดเสร็จสมบูรณ์! พร้อมทำงานบน: {device.upper()}")

tasks = {}


class ProgressLogitsProcessor(LogitsProcessor):
    def __init__(self, task_id, max_tokens):
        self.task_id = task_id
        self.max_tokens = max_tokens
        self.step = 0

    def __call__(self, input_ids, scores):
        self.step += 1
        # คำนวณเปอร์เซ็นต์ (จำกัดไว้ไม่เกิน 99% จนกว่าจะเซฟไฟล์เสร็จ)
        progress = int((self.step / self.max_tokens) * 100)
        if progress > 99:
            progress = 99
        tasks[self.task_id]['progress'] = progress
        return scores

# 🟢 ฟังก์ชันสำหรับรัน AI แบบเบื้องหลัง 
def generate_music_thread(task_id, prompt, max_new_tokens):
    try:
        inputs = processor(text=[prompt], padding=True, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # ใส่ตัวนับความคืบหน้าเข้าไปในโมเดล
        progress_processor = ProgressLogitsProcessor(task_id, max_new_tokens)
        logits_processor = LogitsProcessorList([progress_processor])
        
        print(f"⚙️ [Task: {task_id}] กำลังประมวลผลคลื่นเสียง...")
        audio_values = model.generate(
            **inputs, 
            max_new_tokens=max_new_tokens,
            logits_processor=logits_processor
        )
        
        sampling_rate = model.config.audio_encoder.sampling_rate
        audio_data = audio_values[0, 0].cpu().numpy()
        
        output_filename = f"generated_music_{task_id}.wav"
        scipy.io.wavfile.write(output_filename, rate=sampling_rate, data=audio_data)
        
        print(f"✅ [Task: {task_id}] สร้างเสร็จสมบูรณ์!")
        tasks[task_id]['status'] = 'completed'
        tasks[task_id]['progress'] = 100
        tasks[task_id]['filename'] = output_filename
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดใน Task {task_id}: {e}")
        tasks[task_id]['status'] = 'failed'
        tasks[task_id]['error'] = str(e)


# --- 2. Endpoint: สั่งเริ่มงาน ---
@app.route('/generate-task', methods=['POST'])
def start_generation_task():
    # 🟢 บังคับอ่านข้อมูลเป็น JSON และป้องกันกรณีข้อมูลว่างเปล่า
    data = request.get_json(force=True, silent=True) or {}
    print(f"📥 ข้อมูลที่ได้รับจาก React: {data}") # ปริ้นเช็คดูว่าเข้ามาจริงไหม
    
    # ดึงค่า prompt ถ้าไม่มีให้ใช้ค่าเริ่มต้น
    prompt = data.get('prompt', 'upbeat electronic background music')
    max_new_tokens = 1500  # ปรับได้ตามต้องการ (ยิ่งมากยิ่งใช้เวลานาน) 
    
    task_id = str(uuid.uuid4())
    tasks[task_id] = {'status': 'processing', 'progress': 0}
    
    thread = threading.Thread(target=generate_music_thread, args=(task_id, prompt, max_new_tokens))
    thread.start()
    
    return jsonify({"task_id": task_id})


# --- 3. เช็คสถานะการสร้าง ---
@app.route('/status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    task = tasks.get(task_id)
    if not task:
        return jsonify({"error": "ไม่พบข้อมูลงานนี้"}), 404
    return jsonify(task)

# --- 4.โหลดไฟล์เสียง  ---
@app.route('/download/<task_id>', methods=['GET'])
def download_music(task_id):
    # กรณีที่ 1: เช็คในหน่วยความจำชั่วคราว 
    task = tasks.get(task_id)
    if task:
        if task['status'] != 'completed':
            return jsonify({"error": "งานยังไม่เสร็จสมบูรณ์"}), 400
        filename = task['filename']
    else:
        # กรณีที่ 2: รีสตาร์ทเซิร์ฟเวอร์แล้วหน่วยความจำหาย ให้เดาชื่อไฟล์หาในเครื่องตรงๆ
        filename = f"generated_music_{task_id}.wav"

    # มีอยู่จริงไหมก่อนส่ง
    if os.path.exists(filename):
        return send_file(filename, as_attachment=True, mimetype="audio/wav")
    else:
        return jsonify({"error": "ไม่พบไฟล์เสียงนี้แล้ว"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)