<div align="center">

# 🎵 AI Music Studio

**เปลี่ยนข้อความในจินตนาการของคุณ ให้เป็นเสียงดนตรีด้วยพลังของ AI**

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](#)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white)](#)
[![PyTorch](https://img.shields.io/badge/AI_Model-PyTorch-EE4C2C?logo=pytorch&logoColor=white)](#)

</div>

---

## 📌 เกี่ยวกับโปรเจกต์ (About)
AI Music Studio เป็นเว็บแอปพลิเคชันที่ให้คุณสร้างสรรค์บทเพลงง่ายๆ เพียงแค่พิมพ์ **"คำอธิบายแนวเพลง" (Prompt)** ตัวระบบจะทำงานร่วมกับโมเดล AI `MusicGen` จาก Hugging Face เพื่อสร้างไฟล์เสียงคุณภาพสูงออกมาให้คุณฟังและดาวน์โหลดได้ทันที

---

## ✨ ฟีเจอร์เด่น (Key Features)

- 🎧 **Text-to-Music:** แต่งเพลงจากข้อความได้อย่างแม่นยำ
- 🎲 **Random Title Generator:** ระบบสุ่มชื่อเพลงสุดเท่ สำหรับคนที่คิดชื่อไม่ออก
- ⏳ **Real-time Progress:** แถบแสดงสถานะการประมวลผลของ AI แบบเรียลไทม์ (0-100%)
- 📜 **Smart History:** บันทึกประวัติการสร้างเพลงลงบนเบราว์เซอร์ กลับมาฟังซ้ำหรือใช้ Prompt เดิมได้เสมอ
- 🌊 **Waveform Player:** เครื่องเล่นเพลงพร้อมแอนิเมชันคลื่นเสียงที่สวยงามตอบสนองตามจังหวะดนตรี

---

## 💻 เทคโนโลยีที่ใช้ (Tech Stack)

### 🎨 Frontend
* **React.js & Vite:** เพื่อการแสดงผลที่รวดเร็วและลื่นไหล
* **Tailwind CSS:** สำหรับจัดการ UI และตกแต่งสไตล์ให้สวยงามแบบ Dark Mode
* **Wavesurfer.js:** ไลบรารีสำหรับวาดคลื่นเสียง (Audio Waveform)

### ⚙️ Backend
* **Python & Flask:** จัดการ API และการทำงานเบื้องหลัง
* **PyTorch & Transformers:** สำหรับโหลดและรันโมเดล `facebook/musicgen-small`
* **SciPy:** สำหรับเขียนไฟล์เสียงนามสกุล `.wav`

---

## 🚀 วิธีการติดตั้งและใช้งาน (Getting Started)

การรันโปรเจกต์นี้ในเครื่องของคุณ จะแบ่งออกเป็น 2 ส่วน คือ ฝั่งเซิร์ฟเวอร์ (Backend) และ ฝั่งหน้าเว็บ (Frontend)

### 1️⃣ การเตรียมเซิร์ฟเวอร์ (Backend)

> **⚠️ หมายเหตุ:** แนะนำให้ใช้เครื่องที่มีการ์ดจอ (GPU) เพื่อให้ AI ประมวลผลสร้างเพลงได้รวดเร็วขึ้น หากใช้ CPU อาจจะใช้เวลา 5-15 นาทีต่อเพลง

เปิด Terminal แล้วพิมพ์คำสั่งตามลำดับต่อไปนี้:

```bash
# 1. เข้าไปที่โฟลเดอร์ Backend
cd backend

# 2. ติดตั้งไลบรารีที่จำเป็นทั้งหมด
pip install -r requirements.txt

# (เพิ่มเติม) หากโมเดลรันไม่ได้ ให้ติดตั้งแพ็กเกจหลักเพิ่มเติม
pip install torch transformers scipy flask-cors

# 3. เริ่มรันเซิร์ฟเวอร์ (ระบบจะรันที่พอร์ต 8000)
python api.py
```
---
### 2️⃣ การรันหน้าเว็บ (Frontend)
เปิด Terminal อีกหน้าต่างหนึ่ง (หน้าต่างใหม่) แล้วพิมพ์คำสั่งต่อไปนี้:
---

```bash
# 1. เข้าไปที่โฟลเดอร์ Frontend
cd frontend

# 2. ติดตั้งแพ็กเกจ Node.js
npm install

# 3. เริ่มต้นเซิร์ฟเวอร์จำลองสำหรับหน้าเว็บ
npm run dev
```
---
เคล็ดลับ: หากคุณต้องการรันทดสอบในเครื่องตัวเองทั้งหมด อย่าลืมเข้าไปแก้ไขไฟล์ App.jsx โดยเปลี่ยน URL ของ API จาก https://f1uke-music-ai-backend.hf.space ให้เป็น http://localhost:8000
---
