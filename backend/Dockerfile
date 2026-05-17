# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────
#  Backend: Flask + MusicGen (CPU build — เปลี่ยนเป็น CUDA ดู comment)
# ─────────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/models \
    HUGGINGFACE_HUB_CACHE=/models/hub \
    TRANSFORMERS_CACHE=/models/hub \
    MODEL_CACHE_DIR=/models

# system deps: libsndfile สำหรับ scipy.io.wavfile ไม่จำเป็น แต่ ffmpeg เผื่ออนาคต
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── ติดตั้ง PyTorch CPU wheel ก่อน (ใหญ่ ~200MB cache layer แยกได้)
# ถ้าจะใช้ GPU: ลบบรรทัดนี้ แล้วเปลี่ยน base image เป็น nvidia/cuda + ติดตั้ง torch แบบปกติ
RUN pip install --no-cache-dir torch==2.4.* --index-url https://download.pytorch.org/whl/cpu

COPY requirements.docker.txt .
RUN pip install --no-cache-dir -r requirements.docker.txt

COPY api.py .

# โฟลเดอร์เก็บโมเดล + ข้อมูล user (db + audio) — mount volume ทับได้
ENV DATA_DIR=/data
RUN mkdir -p /models /data/audio
VOLUME ["/models", "/data"]

EXPOSE 8000

# gunicorn workers=1 เพราะโมเดลกินแรม + thread ใน api.py จัดการ concurrency ระดับ task อยู่แล้ว
# timeout 0 = ไม่ kill long-running request (การเจนเพลง CPU อาจ > 5 นาที)
CMD ["python", "-u", "api.py"]
