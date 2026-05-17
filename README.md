<div align="center">

# 🎵 AI Music Studio

**เปลี่ยนข้อความในจินตนาการของคุณ ให้เป็นเสียงดนตรีด้วยพลังของ AI**

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](#)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white)](#)
[![PyTorch](https://img.shields.io/badge/AI_Model-PyTorch-EE4C2C?logo=pytorch&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?logo=docker&logoColor=white)](#)

</div>

---

## 📌 เกี่ยวกับโปรเจกต์

AI Music Studio เป็นเว็บแอปที่ให้คุณสร้างสรรค์บทเพลงเพียงแค่พิมพ์ **"คำอธิบายแนวเพลง" (Prompt)** ระบบจะทำงานร่วมกับโมเดล `facebook/musicgen-small` จาก Hugging Face เพื่อสร้างไฟล์เสียงคุณภาพให้คุณฟังและดาวน์โหลดได้ทันที

> 💾 ใช้ **SQLite + ไฟล์ local** เก็บข้อมูล — ไม่ต้องสมัคร cloud database ใดๆ

---

## ✨ ฟีเจอร์เด่น

- 🎧 **Text-to-Music** — แต่งเพลงจากข้อความได้อย่างแม่นยำ
- 🟢 **Basic / Advanced Mode** — เลือกแนวเพลงสำเร็จรูป หรือเขียน prompt เอง
- ⏱️ **Duration Control** — เลือกความยาวเพลง (10s / 20s / 30s)
- 🎲 **Random Title Generator** — สุ่มชื่อเพลงสำหรับคนที่คิดชื่อไม่ออก
- ⏳ **Real-time Progress** — แถบแสดง progress การประมวลผลของ AI แบบ live
- 📜 **Smart History** — บันทึกประวัติการสร้างเพลง พร้อมเล่นซ้ำหรือใช้ prompt เดิมได้
- 🌊 **Waveform Player** — เครื่องเล่นเพลงพร้อมแอนิเมชันคลื่นเสียงสวยงาม
- 🟢 **Live API Status** — เช็คสถานะ backend แบบ realtime บนหน้าเว็บ

---

## 🚀 Quick Start (แนะนำ — Docker)

วิธีที่ง่ายที่สุดสำหรับคนรับโปรเจกต์ไปใช้ต่อ — **คำสั่งเดียวจบ**

### ความต้องการ
- Docker Desktop (Windows/Mac) หรือ Docker Engine + Compose (Linux)
- RAM ≥ 8 GB
- พื้นที่ disk ≥ 8 GB
- ⚠️ **ไม่ต้องมี GPU** — Dockerfile ใช้ PyTorch CPU build (เจน 1 เพลง ~5–10 นาที)

### รัน

```bash
git clone <repo-url>
cd music-ai-project
docker compose up --build
```

ครั้งแรกใช้เวลา ~10–15 นาที (build image + download model 1.5 GB)
ครั้งถัดไปเร็วมาก เพราะ cache แล้ว

### เปิดใช้งาน
| Service | URL |
|---------|-----|
| 🎨 Frontend (เว็บ) | <http://localhost:5173> |
| ⚙️ Backend health | <http://localhost:8000/health> |

### ✅ Checklist หลัง start
- [ ] `docker compose up --build` ผ่านโดยไม่มี error สีแดง
- [ ] เปิด <http://localhost:8000/health> เห็น `{"status":"ok",...}`
- [ ] เปิด <http://localhost:5173> เห็นหน้าเว็บ และ badge **API online** มุมขวาบน
- [ ] พิมพ์ prompt → กด "สร้างเพลง" → รอ 5–10 นาที → ฟังเพลงได้

---

## 🐳 Docker — คำสั่งใช้บ่อย

```bash
docker compose up -d              # รัน background
docker compose logs -f backend    # ดู log แบบ live
docker compose down               # หยุด (เก็บ volume ไว้)
docker compose down -v            # หยุด + ลบทุก volume (โมเดล + db)
docker compose restart backend    # restart เฉพาะ backend
```

### โครงสร้างข้อมูล (Docker volumes)

| Volume | เก็บอะไร |
|--------|---------|
| `musicai_models` | โมเดล HuggingFace (download ครั้งเดียว reuse ได้) |
| `musicai_appdata` | SQLite db + ไฟล์เพลงที่ generate แล้ว |

backup data:
```bash
docker run --rm -v musicai_appdata:/data -v ${PWD}:/backup alpine \
  tar czf /backup/musicai-backup.tar.gz -C /data .
```

ดูรายละเอียดเพิ่มเติมที่ [DOCKER.md](DOCKER.md) และ [SETUP.md](SETUP.md)

---

## 💻 Development Setup (ถ้าอยากแก้โค้ดเอง)

แบ่งเป็น 2 ฝั่ง — Backend และ Frontend (เปิด terminal คนละหน้าต่าง)

### 1️⃣ Backend (Python + Flask)

```bash
cd backend
pip install -r requirements.txt
python api.py            # รันที่พอร์ต 8000
```

> 💡 ถ้าใช้ GPU: ติดตั้ง torch แบบ CUDA — เร็วกว่า CPU ~10 เท่า

### 2️⃣ Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev              # รันที่พอร์ต 5173
```

ตั้งค่า API endpoint ผ่าน env (optional):

```bash
# frontend/.env.local
VITE_API_BASE=http://localhost:8000
```

---

## 🏗️ โครงสร้างโปรเจกต์

```
music-ai-project/
├── README.md
├── DOCKER.md                    ← deep dive Docker
├── SETUP.md                     ← คู่มือสั้นสำหรับผู้รับโปรเจกต์
├── docker-compose.yml           ← orchestration
├── backend/
│   ├── api.py                   ← Flask API + MusicGen pipeline
│   ├── requirements.txt         ← deps สำหรับ dev
│   ├── requirements.docker.txt  ← deps แบบ slim สำหรับ Docker
│   ├── Dockerfile               ← Python 3.11 + PyTorch CPU
│   └── .dockerignore
└── frontend/
    ├── src/
    │   ├── App.jsx              ← root + layout
    │   ├── components/
    │   │   ├── Promt.jsx        ← prompt + mode selector
    │   │   ├── MusicPlayer.jsx  ← waveform player
    │   │   └── HistoryList.jsx  ← ประวัติเพลง
    │   ├── data/genrePrompts.js ← preset prompts ต่อแนวเพลง
    │   └── index.css            ← global styles + Tailwind
    ├── tailwind.config.js
    ├── nginx.conf               ← SPA fallback + gzip (production)
    └── Dockerfile               ← Vite build → nginx
```

---

## 🌐 Production Deploy

ถ้าจะ deploy บน server จริง (มี domain):

1. **Frontend** — set `VITE_API_BASE` ตอน build:
   ```bash
   VITE_API_BASE=https://api.example.com docker compose build frontend
   ```
2. **Backend** — set `PUBLIC_BASE_URL` ใน `docker-compose.yml`:
   ```yaml
   backend:
     environment:
       PUBLIC_BASE_URL: https://api.example.com
   ```
3. ใส่ reverse proxy (Caddy / nginx / Traefik) ด้านหน้า + HTTPS

---

## 💻 เทคโนโลยีที่ใช้

### 🎨 Frontend
- **React 19 + Vite** — UI framework + bundler ที่เร็วและเบา
- **Tailwind CSS** — utility-first styling
- **Wavesurfer.js** — render audio waveform
- **Inter + JetBrains Mono** — typography ระดับ production

### ⚙️ Backend
- **Python 3.11 + Flask** — REST API server
- **PyTorch + Transformers** — โหลดและรัน `facebook/musicgen-small`
- **SciPy** — เขียนไฟล์เสียง `.wav`
- **SQLite** — เก็บประวัติ task และ metadata

### 🐳 Infra
- **Docker + Compose** — packaging ทั้ง stack
- **nginx** — static serving + SPA fallback สำหรับ frontend

---

## 🛠️ Troubleshooting

**`docker compose up` ค้างที่ "กำลังโหลดสมอง MusicGen..."**
ปกติ — กำลัง download โมเดล 1.5 GB ครั้งแรก รอ ~5 นาที
ดู progress ด้วย `docker compose logs -f backend`

**Frontend เปิดได้แต่ badge แสดง "API offline"**
- เช็ค backend ขึ้นรึยัง: `docker compose ps`
- ถ้า browser เรียก API จากเครื่อง user → ต้องใช้ `http://localhost:8000` ตามค่า default

**RAM ไม่พอ / OOM killed**
musicgen-small ใช้ RAM ~2 GB + PyTorch overhead → ต้องการ free RAM ≥ 4 GB
ปิดโปรแกรมอื่นก่อน หรือเพิ่ม RAM ให้ Docker

**Generate ช้ามาก (>15 นาที/เพลง)**
ใช้ CPU mode อยู่ — เปลี่ยนเป็น GPU ดูใน [DOCKER.md](DOCKER.md#เปลี่ยนไปใช้-gpu)

---

<div align="center">

Made with 🎵 by AI Music Studio team
Powered by **MusicGen** from Meta AI

</div>
