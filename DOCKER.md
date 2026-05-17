# 🐳 Docker Deployment

วิธีรันโปรเจกต์ทั้งหมดผ่าน Docker — ไม่ต้องลง Python / Node / PyTorch บนเครื่องเอง

## ความต้องการ

- Docker Desktop (Windows/Mac) หรือ Docker Engine + Compose plugin (Linux)
- RAM ≥ 8 GB (musicgen-small โหลดเข้า RAM ~2 GB)
- พื้นที่ disk ≥ 8 GB (image + model cache)
- ⚠️ **ไม่ต้องมี GPU** — Dockerfile ใช้ PyTorch CPU build
  - การเจน 1 เพลง ~30 วิ จะใช้เวลา **5–10 นาที** บน CPU (ปกติ)

## ขั้นตอน

### Build + รัน

```bash
docker compose up --build
```

> ✨ **ไม่ต้อง config อะไรเพิ่ม** — SQLite + local file storage สร้างให้อัตโนมัติใน docker volume
> ถ้าจะ deploy หลัง domain จริง ดู section "Production deploy" ด้านล่าง

ครั้งแรกจะใช้เวลา ~10–15 นาที (download dependencies + model)
ครั้งถัดไปจะเร็วมากเพราะ cache แล้ว

### เปิดใช้งาน

- Frontend: <http://localhost:5173>
- Backend health: <http://localhost:8000/health>

## คำสั่งใช้บ่อย

```bash
docker compose up -d              # รัน background
docker compose logs -f backend    # ดู log แบบ live
docker compose down               # หยุดทั้งหมด (ยังเก็บ volume)
docker compose down -v            # หยุด + ลบโมเดลใน volume (จะ download ใหม่)
docker compose restart backend    # restart เฉพาะ backend
```

## โครงสร้าง

```
.
├── docker-compose.yml          ← orchestration
├── backend/
│   ├── Dockerfile              ← Python 3.11 + PyTorch CPU + MusicGen
│   ├── requirements.docker.txt ← deps แบบ slim (ตัด TF/firebase ทิ้ง)
│   └── .dockerignore
└── frontend/
    ├── Dockerfile              ← Vite build → nginx
    ├── nginx.conf              ← SPA fallback + gzip
    └── .dockerignore
```

## เปลี่ยนไปใช้ GPU

แก้ `backend/Dockerfile`:

```dockerfile
# เปลี่ยน base image
FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04 AS base

# ติดตั้ง python 3.11 เอง (เพราะ cuda image ไม่มี python)
RUN apt-get update && apt-get install -y python3.11 python3-pip ...

# ลบบรรทัด --index-url cpu ออก แล้วใช้:
RUN pip install --no-cache-dir torch==2.4.*
```

แล้วเพิ่มใน `docker-compose.yml` ใต้ `backend:`:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## ปัญหาที่พบบ่อย

**`docker compose up` ค้างที่ "กำลังโหลดสมอง MusicGen..."**
ปกติ — กำลัง download โมเดล 1.5 GB ครั้งแรก รอ ~5 นาที (ดู progress: `docker compose logs -f backend`)

**Frontend เปิดได้แต่เรียก backend ไม่เจอ**
Browser เรียก API จากเครื่อง user (ไม่ใช่จาก network ภายใน docker) → ต้องใช้ `http://localhost:8000` ตามค่า default ใน compose

## Production deploy

ถ้าจะ deploy บน server จริง (มี domain):

1. **Frontend** — set `VITE_API_BASE` ตอน build:
   ```bash
   VITE_API_BASE=https://api.example.com docker compose build frontend
   ```
2. **Backend** — set `PUBLIC_BASE_URL` ใน compose เพื่อให้ audio URL ถูกต้อง:
   ```yaml
   backend:
     environment:
       PUBLIC_BASE_URL: https://api.example.com
   ```
3. ใส่ reverse proxy (Caddy/nginx) ด้านหน้า + HTTPS

## ข้อมูลถูกเก็บที่ไหน?

ทั้งหมดอยู่ใน Docker named volumes:

- `musicai_models` — โมเดล HuggingFace (download ครั้งเดียว reuse ได้)
- `musicai_appdata` — SQLite db (`music.db`) + ไฟล์เสียงในโฟลเดอร์ `audio/`

backup ทำได้ด้วย:
```bash
docker run --rm -v musicai_appdata:/data -v $PWD:/backup alpine \
  tar czf /backup/musicai-backup.tar.gz -C /data .
```

**RAM ไม่พอ / OOM killed**
musicgen-small ใช้ RAM ~2 GB ตอน inference + PyTorch overhead → ต้องการ free RAM ≥ 4 GB ปิดโปรแกรมอื่นก่อน
