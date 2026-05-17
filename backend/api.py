import os
import time
import threading
import uuid
import tempfile
import traceback
import sqlite3
import shutil
from datetime import datetime, timezone

# ─── ตั้งค่า path เก็บโมเดล (ต้องทำ "ก่อน" import transformers) ───
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, ".."))
_PROJECT_PARENT = os.path.abspath(os.path.join(_PROJECT_ROOT, ".."))

MODEL_CACHE_DIR = os.environ.get("MODEL_CACHE_DIR") or os.path.join(_PROJECT_PARENT, "music-ai-models")
os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

os.environ.setdefault("HF_HOME", MODEL_CACHE_DIR)
os.environ.setdefault("HUGGINGFACE_HUB_CACHE", os.path.join(MODEL_CACHE_DIR, "hub"))
os.environ.setdefault("TRANSFORMERS_CACHE", os.path.join(MODEL_CACHE_DIR, "hub"))

import scipy.io.wavfile
import torch
from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from dotenv import load_dotenv
from transformers import AutoProcessor, MusicgenForConditionalGeneration, LogitsProcessor, LogitsProcessorList

load_dotenv()

# ─── ตำแหน่งเก็บข้อมูล (mount volume ได้ใน docker) ────────────────
DATA_DIR = os.environ.get("DATA_DIR") or os.path.join(_THIS_DIR, "data")
AUDIO_DIR = os.path.join(DATA_DIR, "audio")
DB_PATH = os.path.join(DATA_DIR, "music.db")
os.makedirs(AUDIO_DIR, exist_ok=True)

# ─── Public URL — ใช้สร้าง absolute audio URL ให้ browser โหลดได้ ─
# ถ้าไม่ตั้ง จะ derive จาก request.host_url ของแต่ละ request (ใช้ใน dev/docker ปกติได้)
PUBLIC_BASE_URL = (os.environ.get("PUBLIC_BASE_URL") or "").rstrip("/")

# ─── ค่าคงที่สำหรับควบคุมการทำงาน ────────────────────────────────
MAX_PROMPT_LENGTH = 400
MAX_TITLE_LENGTH = 80
DEFAULT_MAX_TOKENS = 1500
MIN_TOKENS = 500
MAX_TOKENS = 1500              # ~30 วินาที
PROGRESS_UPDATE_EVERY = 50
HISTORY_PAGE_SIZE = 10


# ─── SQLite helpers ─────────────────────────────────────────────
def _connect():
    conn = sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn


def init_db():
    conn = _connect()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS music_database (
                id              TEXT PRIMARY KEY,
                user_id         TEXT NOT NULL,
                title           TEXT,
                prompt          TEXT NOT NULL,
                status          TEXT NOT NULL DEFAULT 'processing',
                progress        INTEGER NOT NULL DEFAULT 0,
                audio_url       TEXT,
                execution_time  REAL,
                mode            TEXT,
                genre           TEXT,
                duration_tokens INTEGER,
                error_message   TEXT,
                created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            );

            CREATE INDEX IF NOT EXISTS idx_music_created_at
                ON music_database (created_at DESC);

            CREATE INDEX IF NOT EXISTS idx_music_user_status
                ON music_database (user_id, status, created_at DESC);
        """)
        conn.commit()
    finally:
        conn.close()


def db_insert(payload: dict):
    cols = ", ".join(payload.keys())
    placeholders = ", ".join("?" for _ in payload)
    conn = _connect()
    try:
        conn.execute(
            f"INSERT INTO music_database ({cols}) VALUES ({placeholders})",
            list(payload.values()),
        )
        conn.commit()
    finally:
        conn.close()


def db_update(task_id: str, fields: dict):
    if not fields:
        return
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    conn = _connect()
    try:
        conn.execute(
            f"UPDATE music_database SET {set_clause} WHERE id = ?",
            [*fields.values(), task_id],
        )
        conn.commit()
    finally:
        conn.close()


def db_delete(task_id: str):
    conn = _connect()
    try:
        conn.execute("DELETE FROM music_database WHERE id = ?", (task_id,))
        conn.commit()
    finally:
        conn.close()


def db_get(task_id: str):
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT * FROM music_database WHERE id = ?", (task_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def db_history(user_id: str | None, last_date: str | None):
    sql = "SELECT * FROM music_database WHERE status = 'completed'"
    params: list = []
    if user_id:
        sql += " AND user_id = ?"
        params.append(user_id)
    if last_date:
        sql += " AND created_at < ?"
        params.append(last_date)
    sql += " ORDER BY created_at DESC LIMIT ?"
    params.append(HISTORY_PAGE_SIZE)

    conn = _connect()
    try:
        return [dict(r) for r in conn.execute(sql, params).fetchall()]
    finally:
        conn.close()


# ─── เริ่มต้น Flask + DB ─────────────────────────────────────────
init_db()

app = Flask(__name__)
CORS(app)

# โหลด Model
print(f"📂 Model cache dir: {MODEL_CACHE_DIR}")
print(f"💾 Data dir: {DATA_DIR}")
print("⏳ กำลังโหลดสมอง MusicGen...")
MUSICGEN_MODEL_ID = os.environ.get("MUSICGEN_MODEL_ID", "facebook/musicgen-small")
print(f"🎼 Model: {MUSICGEN_MODEL_ID}")
processor = AutoProcessor.from_pretrained(MUSICGEN_MODEL_ID, cache_dir=MODEL_CACHE_DIR)
model = MusicgenForConditionalGeneration.from_pretrained(MUSICGEN_MODEL_ID, cache_dir=MODEL_CACHE_DIR)
device = "cuda:0" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"✅ พร้อมทำงานบน: {device.upper()}")

# ── Clamp MAX_TOKENS ตามขีดจำกัดจริงของโมเดล (กัน IndexError ที่ embed_positions)
try:
    _model_max_pos = int(model.decoder.config.max_position_embeddings)
    _safe_cap = max(MIN_TOKENS, _model_max_pos - 48)
    if MAX_TOKENS > _safe_cap:
        print(f"⚠️ ลด MAX_TOKENS จาก {MAX_TOKENS} → {_safe_cap} (โมเดลรับได้สูงสุด {_model_max_pos})")
        MAX_TOKENS = _safe_cap
except Exception as _e:
    print(f"⚠️ ไม่สามารถอ่าน max_position_embeddings: {_e}")


# ─── Progress Logits Processor ──────────────────────────────────
class ProgressLogitsProcessor(LogitsProcessor):
    def __init__(self, task_id, max_tokens):
        self.task_id = task_id
        self.max_tokens = max(1, max_tokens)
        self.step = 0
        self.last_reported = -1

    def __call__(self, input_ids, scores):
        self.step += 1
        progress = int((self.step / self.max_tokens) * 100)
        if progress > 99:
            progress = 99

        if self.step % PROGRESS_UPDATE_EVERY == 0 and progress != self.last_reported:
            try:
                db_update(self.task_id, {"progress": progress})
                self.last_reported = progress
            except Exception as e:
                print(f"⚠️ อัปเดต progress ไม่สำเร็จ: {e}")
        return scores


def _fmt_duration(seconds: float) -> str:
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes} นาที {secs} วินาที"


def _build_audio_url(filename: str) -> str:
    """สร้าง URL ที่ browser โหลดได้ — ใช้ PUBLIC_BASE_URL ถ้าตั้ง,
    ไม่งั้น derive จาก request context."""
    if PUBLIC_BASE_URL:
        return f"{PUBLIC_BASE_URL}/audio/{filename}"
    # ตอน background thread ไม่มี request context — ใช้ relative path
    # frontend ต้องรู้จัก prepend API base เอง (โค้ดเดิมรับ absolute เท่านั้น)
    # → ดังนั้น default ให้เป็น relative ผ่าน host header ถ้ามี
    try:
        return url_for("serve_audio", filename=filename, _external=True)
    except RuntimeError:
        return f"/audio/{filename}"


def generate_music_thread(task_id, prompt, max_new_tokens, title, public_base):
    start_time = time.time()
    temp_file = os.path.join(tempfile.gettempdir(), f"{task_id}.wav")
    final_path = os.path.join(AUDIO_DIR, f"{task_id}.wav")

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

        scipy.io.wavfile.write(temp_file, rate=sampling_rate, data=audio_data)

        # ย้ายไฟล์เข้า DATA_DIR (persistent volume)
        shutil.move(temp_file, final_path)

        # ประกอบ URL — ถ้ามี PUBLIC_BASE_URL ใช้เลย ไม่งั้นใช้ host ของ request ที่สั่งเริ่ม
        if PUBLIC_BASE_URL:
            audio_url = f"{PUBLIC_BASE_URL}/audio/{task_id}.wav"
        else:
            audio_url = f"{public_base.rstrip('/')}/audio/{task_id}.wav"

        duration = time.time() - start_time
        print(f"✅ เสร็จสิ้นใน {_fmt_duration(duration)}! URL: {audio_url}")

        db_update(task_id, {
            "status": "completed",
            "progress": 100,
            "audio_url": audio_url,
            "execution_time": round(duration, 2),
        })

    except Exception as e:
        duration = time.time() - start_time
        err_msg = str(e) or "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
        print(f"❌ Error: {err_msg} ⏱️ (ล้มเหลวหลังจากใช้เวลา {_fmt_duration(duration)})")
        traceback.print_exc()

        try:
            db_update(task_id, {
                "status": "failed",
                "progress": 0,
                "error_message": err_msg[:500],
                "execution_time": round(duration, 2),
            })
        except Exception as inner:
            print(f"⚠️ ไม่สามารถ mark failed: {inner} → ลบ row ทิ้ง")
            try:
                db_delete(task_id)
            except Exception:
                pass

    finally:
        try:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        except Exception as cleanup_err:
            print(f"⚠️ ลบไฟล์ชั่วคราวไม่สำเร็จ: {cleanup_err}")


# ─── API Endpoints ──────────────────────────────────────────────

@app.route('/generate-task', methods=['POST'])
def start_generation_task():
    data = request.get_json(force=True, silent=True) or {}

    prompt = (data.get('prompt') or '').strip()
    title = (data.get('title') or '').strip() or 'Untitled Track'
    user_id = (data.get('user_id') or 'anonymous').strip() or 'anonymous'
    mode = (data.get('mode') or 'advanced').strip().lower()
    genre = (data.get('genre') or '').strip() or None

    try:
        duration_tokens = int(data.get('duration_tokens') or DEFAULT_MAX_TOKENS)
    except (TypeError, ValueError):
        duration_tokens = DEFAULT_MAX_TOKENS
    duration_tokens = max(MIN_TOKENS, min(MAX_TOKENS, duration_tokens))

    if not prompt:
        return jsonify({"error": "กรุณาระบุ prompt"}), 400
    if len(prompt) > MAX_PROMPT_LENGTH:
        return jsonify({"error": f"prompt ยาวเกิน {MAX_PROMPT_LENGTH} ตัวอักษร"}), 400
    if len(title) > MAX_TITLE_LENGTH:
        title = title[:MAX_TITLE_LENGTH]
    if mode not in ('basic', 'advanced'):
        mode = 'advanced'

    task_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ')

    payload = {
        "id": task_id,
        "user_id": user_id,
        "title": title,
        "prompt": prompt,
        "status": "processing",
        "progress": 0,
        "mode": mode,
        "duration_tokens": duration_tokens,
        "created_at": now_iso,
    }
    if genre:
        payload["genre"] = genre

    try:
        db_insert(payload)
    except Exception as e:
        print(f"❌ insert row ไม่สำเร็จ: {e}")
        return jsonify({"error": "ไม่สามารถเริ่มงานได้"}), 500

    # capture host จาก request นี้ เพื่อให้ background thread สร้าง audio URL ได้
    public_base = request.host_url

    threading.Thread(
        target=generate_music_thread,
        args=(task_id, prompt, duration_tokens, title, public_base),
        daemon=True
    ).start()

    return jsonify({"task_id": task_id})


@app.route('/status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    try:
        row = db_get(task_id)
        if row:
            if row.get('status') == 'failed' and not row.get('error'):
                row['error'] = row.get('error_message') or 'สร้างเพลงล้มเหลว'
            return jsonify(row)
    except Exception as e:
        print(f"❌ get_task_status error: {e}")

    return jsonify({
        "status": "failed",
        "error": "ระบบขัดข้องระหว่างการสร้างเพลง (ข้อมูลถูกลบทิ้งแล้ว)"
    })


@app.route('/history', methods=['GET'])
def get_history():
    try:
        user_id = request.args.get('user_id')
        last_date = request.args.get('last_date')

        rows = db_history(user_id, last_date)

        history_list = []
        for d in rows:
            task_id_str = str(d.get("id", ""))
            title_str = d.get("title")
            if not title_str:
                title_str = f"เพลง AI ({task_id_str[:4]})"

            history_list.append({
                "id": task_id_str,
                "taskId": task_id_str,
                "title": title_str,
                "prompt": d.get("prompt", ""),
                "date": d.get("created_at", ""),
                "audio_url": d.get("audio_url", ""),
                "mode": d.get("mode", ""),
                "genre": d.get("genre", ""),
            })

        return jsonify(history_list)

    except Exception:
        print("\n❌ เจอ Error ในหน้าประวัติ (History):")
        traceback.print_exc()
        return jsonify([])


@app.route('/audio/<path:filename>', methods=['GET'])
def serve_audio(filename):
    """เสิร์ฟไฟล์เสียงที่เจนแล้ว — แทน Supabase Storage"""
    return send_from_directory(AUDIO_DIR, filename, mimetype='audio/wav')


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "device": device,
        "model": MUSICGEN_MODEL_ID,
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
