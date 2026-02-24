from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle
from tensorflow.keras.models import load_model
from music21 import stream, note, chord, instrument
import os
import gdown

# 1. นำ File ID ที่ได้จากขั้นตอนแรกมาใส่ตรงนี้
MODEL_FILE_ID = 'https://drive.google.com/file/d/1DfgicvajU1mSKldFkYcdmG2FhHrt06eA/view?usp=drive_link'
NOTE_MAPPING_ID = 'https://drive.google.com/file/d/1ja5p7R6L088fuomIlMu8EbDHcwscFRPZ/view?usp=sharing'
DATA_NOTES_ID = 'https://drive.google.com/file/d/1RL2vx32zVRAo0ZuX4ggrFiDpgFusmkOX/view?usp=sharing'

# 2. ฟังก์ชันตรวจสอบและดาวน์โหลดไฟล์
def download_model_from_drive(file_id, output_filename):
    # ถ้ายังไม่มีไฟล์นี้ในเครื่องเซิร์ฟเวอร์ ให้ดาวน์โหลด
    if not os.path.exists(output_filename):
        print(f"กำลังดาวน์โหลด {output_filename} จาก Google Drive...")
        url = f'https://drive.google.com/uc?id={file_id}'
        gdown.download(url, output_filename, quiet=False)
        print(f"ดาวน์โหลด {output_filename} สำเร็จ!")

# 3. สั่งรันฟังก์ชันดาวน์โหลดก่อนที่ API จะเริ่มทำงาน
download_model_from_drive(MODEL_FILE_ID, 'final_model_smart.keras')
download_model_from_drive(NOTE_MAPPING_ID, 'note_mapping_smart.pkl')
download_model_from_drive(DATA_NOTES_ID, 'data_notes_smart.pkl')
app = FastAPI()

# --- ตั้งค่า CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. โหลดโมเดลใหม่ (Smart Model) ---
print("⏳ Loading Smart Model & Data...")
try:
    # ⚠️ แก้ชื่อไฟล์ให้ตรงกับอันใหม่
    model = load_model('final_model_smart.keras')
    
    with open('note_mapping_smart.pkl', 'rb') as f:
        note_to_int = pickle.load(f)
        
    with open('data_notes_smart.pkl', 'rb') as f:
        data_notes = pickle.load(f)
    
    # สร้าง Dict แปลงกลับ (ตัวเลข -> โน้ต)
    int_to_note = dict((number, note) for note, number in note_to_int.items())
    print("✅ Smart Model Loaded Successfully!")
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("ตรวจสอบว่าไฟล์ _smart.keras และ .pkl อยู่ในโฟลเดอร์เดียวกับ api.py หรือไม่")

# --- ฟังก์ชันสุ่ม (Top-K Sampling) ---
# ช่วยให้เพลงไม่เพี้ยน และไม่ซ้ำซากเกินไป
def sample_top_k(preds, temperature=1.0, k=5):
    preds = np.asarray(preds).astype('float64')
    
    # ปรับด้วย Temperature
    preds = np.log(preds + 1e-7) / temperature
    exp_preds = np.exp(preds)
    preds = exp_preds / np.sum(exp_preds)
    
    # เลือก K ตัวเลือกที่ดีที่สุด
    top_k_indices = np.argsort(preds)[-k:]
    top_k_probs = preds[top_k_indices]
    
    # ปรับสัดส่วนใหม่ให้รวมกันได้ 1
    top_k_probs = top_k_probs / np.sum(top_k_probs)
    
    # สุ่มเลือก
    chosen_index = np.random.choice(top_k_indices, p=top_k_probs)
    return chosen_index

class GenerateRequest(BaseModel):
    temperature: float = 0.6
    length: int = 50

@app.post("/generate")
def generate_music(req: GenerateRequest):
    global model, data_notes, note_to_int, int_to_note
    
    try:
        # 1. สุ่มจุดเริ่มต้น (Seed) จากเพลงจริง
        SEQUENCE_LENGTH = 100 # ต้องตรงกับที่เทรนมา
        start_index = np.random.randint(0, len(data_notes) - SEQUENCE_LENGTH - 1)
        
        # ดึงโน้ต 100 ตัวแรกมาเป็นสารตั้งต้น
        pattern = [note_to_int[char] for char in data_notes[start_index : start_index + SEQUENCE_LENGTH]]
        
        prediction_output = []
        
        # 2. เริ่มแต่งเพลง
        for i in range(req.length):
            prediction_input = np.reshape(pattern, (1, len(pattern), 1))
            
            # ให้ AI ทาย
            prediction = model.predict(prediction_input, verbose=0)
            
            # ใช้ Top-K Sampling เลือกตัวถัดไป
            index = sample_top_k(prediction[0], req.temperature, k=3)
            result = int_to_note[index]
            
            prediction_output.append(result)
            
            # ขยับหน้าต่างไปข้างหน้า
            pattern.append(index)
            pattern = pattern[1:len(pattern)]

        return {
            "status": "success",
            "notes": prediction_output
        }
        
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "error", "message": str(e)}

# วิธีรัน: uvicorn api:app --reload