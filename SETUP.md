# 🚀 คู่มือ Setup สำหรับผู้รับโปรเจกต์

ตอนนี้โปรเจกต์ **ไม่ต้องพึ่ง cloud database แล้ว** — รัน Docker คำสั่งเดียวจบ ✨

## ความต้องการ

- Docker Desktop (Windows/Mac) หรือ Docker Engine + Compose (Linux)
- RAM ≥ 8 GB
- พื้นที่ disk ≥ 8 GB
- ⚠️ ไม่ต้องมี GPU — เจน 1 เพลง ~5–10 นาที บน CPU

## ขั้นตอน

```bash
docker compose up --build
```

ครั้งแรกใช้เวลา ~10–15 นาที (build image + download โมเดล 1.5 GB)
ครั้งถัด ๆ ไปเร็วมาก

เปิดเว็บ → <http://localhost:5173>

นั่นแหละ จบ

---

## โครงสร้างข้อมูล

ทุกอย่างอยู่ใน **Docker volumes** (ไม่ปนกับโค้ดในโปรเจกต์):

| Volume | เก็บอะไร |
|--------|---------|
| `musicai_models` | โมเดล HuggingFace (musicgen-small) |
| `musicai_appdata` | SQLite database + ไฟล์เพลงที่เจนแล้ว |

ดู volume ที่ Docker สร้าง:

```bash
docker volume ls | grep musicai
```

ล้างข้อมูลทั้งหมด (ลบ db + เพลง — โมเดลก็โดนลบด้วย):

```bash
docker compose down -v
```

## คำสั่งใช้บ่อย

```bash
docker compose up -d              # รัน background
docker compose logs -f backend    # ดู log แบบ live
docker compose down               # หยุด (ข้อมูลใน volume ยังอยู่)
docker compose restart backend
```

## ✅ Checklist

- [ ] รัน `docker compose up --build` สำเร็จ (ไม่มี error สีแดง)
- [ ] เปิด <http://localhost:8000/health> เห็น `{"status":"ok",...}`
- [ ] เปิด <http://localhost:5173> เห็นหน้าเว็บ
- [ ] ลองพิมพ์ prompt → กดสร้าง → รอ 5–10 นาที → ฟังเพลงได้

ติดปัญหาดู [DOCKER.md](DOCKER.md) หรือถามได้
