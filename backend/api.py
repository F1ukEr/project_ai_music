import os
import tempfile
import threading
import time
import traceback
import uuid

import scipy.io.wavfile
import torch
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import Client, create_client
from transformers import (
    AutoProcessor,
    LogitsProcessor,
    LogitsProcessorList,
    MusicgenForConditionalGeneration,
)

load_dotenv()


class SupabaseMusicRepository:
    """Repository layer for CRUD operations on music generation tasks."""

    def __init__(self, client: Client, table_name: str = "music_database"):
        self.client = client
        self.table_name = table_name

    def create_task(self, task: dict) -> None:
        self.client.table(self.table_name).insert(task).execute()

    def update_task(self, task_id: str, payload: dict) -> None:
        self.client.table(self.table_name).update(payload).eq("id", task_id).execute()

    def delete_task(self, task_id: str) -> None:
        self.client.table(self.table_name).delete().eq("id", task_id).execute()

    def find_task(self, task_id: str):
        return self.client.table(self.table_name).select("*").eq("id", task_id).execute()

    def get_completed_history(self, user_id: str | None = None, limit: int = 10):
        query = self.client.table(self.table_name).select("*").eq("status", "completed")
        if user_id:
            query = query.eq("user_id", user_id)

        return query.order("created_at", desc=True).limit(limit).execute()


class MusicStorageService:
    """Storage abstraction for generated wav files in Supabase Storage."""

    def __init__(self, client: Client, bucket_name: str = "Music"):
        self.client = client
        self.bucket_name = bucket_name

    def upload_wav_and_get_public_url(self, task_id: str, local_file_path: str) -> str:
        with open(local_file_path, "rb") as file_obj:
            self.client.storage.from_(self.bucket_name).upload(f"{task_id}.wav", file_obj)

        return self.client.storage.from_(self.bucket_name).get_public_url(f"{task_id}.wav")


class ProgressLogitsProcessor(LogitsProcessor):
    """Hook into generation steps and periodically persist progress."""

    def __init__(self, task_id: str, max_tokens: int, repository: SupabaseMusicRepository):
        self.task_id = task_id
        self.max_tokens = max_tokens
        self.repository = repository
        self.step = 0

    def __call__(self, input_ids, scores):
        self.step += 1
        progress = min(int((self.step / self.max_tokens) * 100), 99)

        # อัปเดตทุก 50 steps เพื่อไม่ให้ Database ทำงานหนักเกินไป
        if self.step % 50 == 0:
            self.repository.update_task(self.task_id, {"progress": progress})

        return scores


class MusicGenerationService:
    """Domain service for music generation workflow."""

    def __init__(
        self,
        repository: SupabaseMusicRepository,
        storage_service: MusicStorageService,
        processor: AutoProcessor,
        model: MusicgenForConditionalGeneration,
        device: str,
    ):
        self.repository = repository
        self.storage_service = storage_service
        self.processor = processor
        self.model = model
        self.device = device

    def generate_music(self, task_id: str, prompt: str, max_new_tokens: int = 1500) -> None:
        start_time = time.time()
        temp_file = os.path.join(tempfile.gettempdir(), f"{task_id}.wav")

        try:
            inputs = self.processor(text=[prompt], padding=True, return_tensors="pt")
            inputs = {key: value.to(self.device) for key, value in inputs.items()}

            progress_processor = ProgressLogitsProcessor(task_id, max_new_tokens, self.repository)
            logits_processor = LogitsProcessorList([progress_processor])

            audio_values = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                logits_processor=logits_processor,
            )

            sampling_rate = self.model.config.audio_encoder.sampling_rate
            audio_data = audio_values[0, 0].cpu().numpy()
            scipy.io.wavfile.write(temp_file, rate=sampling_rate, data=audio_data)

            public_url = self.storage_service.upload_wav_and_get_public_url(task_id, temp_file)
            duration = time.time() - start_time
            minutes = int(duration // 60)
            seconds = int(duration % 60)

            print(f"✅ เสร็จสิ้นใน {minutes} นาที {seconds} วินาที! URL: {public_url}")

            self.repository.update_task(
                task_id,
                {
                    "status": "completed",
                    "progress": 100,
                    "audio_url": public_url,
                    "execution_time": round(duration, 2),
                },
            )
        except Exception as error:
            duration = time.time() - start_time
            minutes = int(duration // 60)
            seconds = int(duration % 60)
            print(
                f"❌ Error: {error} ⏱️ (ล้มเหลวหลังจากใช้เวลาไป {minutes} นาที {seconds} วินาที)"
            )
            self.repository.delete_task(task_id)
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)


class MusicGenerationController:
    """HTTP controller layer for Flask endpoints."""

    def __init__(self, repository: SupabaseMusicRepository, generation_service: MusicGenerationService):
        self.repository = repository
        self.generation_service = generation_service

    def start_generation_task(self):
        data = request.get_json(force=True, silent=True) or {}
        prompt = data.get("prompt", "upbeat music")
        title = data.get("title", "Untitled Track")
        user_id = data.get("user_id", "anonymous")
        task_id = str(uuid.uuid4())

        self.repository.create_task(
            {
                "id": task_id,
                "user_id": user_id,
                "title": title,
                "prompt": prompt,
                "status": "processing",
            }
        )

        thread = threading.Thread(
            target=self.generation_service.generate_music,
            args=(task_id, prompt, 1500),
            daemon=True,
        )
        thread.start()

        return jsonify({"task_id": task_id})

    def get_task_status(self, task_id: str):
        result = self.repository.find_task(task_id)
        if result.data:
            return jsonify(result.data[0])

        return jsonify(
            {
                "status": "failed",
                "error": "ระบบขัดข้องระหว่างการสร้างเพลง (ข้อมูลถูกลบทิ้งแล้ว)",
            }
        )

    def get_history(self):
        try:
            user_id = request.args.get("user_id")
            result = self.repository.get_completed_history(user_id=user_id, limit=10)

            history_list = []
            for row in result.data:
                task_id_str = str(row.get("id", ""))
                title = row.get("title") or f"เพลง AI ({task_id_str[:4]})"

                history_list.append(
                    {
                        "id": task_id_str,
                        "taskId": task_id_str,
                        "title": title,
                        "prompt": row.get("prompt", ""),
                        "date": row.get("created_at", ""),
                        "audio_url": row.get("audio_url", ""),
                    }
                )

            return jsonify(history_list)
        except Exception:
            print("\n❌ เจอ Error ในหน้าประวัติ (History):")
            traceback.print_exc()
            return jsonify([])


class ApplicationFactory:
    """Compose infrastructure + services + controllers and wire routes."""

    @staticmethod
    def create_app() -> Flask:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        supabase_client: Client = create_client(supabase_url, supabase_key)

        app = Flask(__name__)
        CORS(app)

        print("⏳ กำลังโหลดสมอง MusicGen...")
        processor = AutoProcessor.from_pretrained("facebook/musicgen-medium")
        model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-medium")
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        model.to(device)
        print(f"✅ พร้อมทำงานบน: {device.upper()}")

        repository = SupabaseMusicRepository(supabase_client)
        storage_service = MusicStorageService(supabase_client)
        generation_service = MusicGenerationService(
            repository=repository,
            storage_service=storage_service,
            processor=processor,
            model=model,
            device=device,
        )
        controller = MusicGenerationController(repository, generation_service)

        app.add_url_rule(
            "/generate-task",
            view_func=controller.start_generation_task,
            methods=["POST"],
        )
        app.add_url_rule(
            "/status/<task_id>",
            view_func=controller.get_task_status,
            methods=["GET"],
        )
        app.add_url_rule(
            "/history",
            view_func=controller.get_history,
            methods=["GET"],
        )

        return app


app = ApplicationFactory.create_app()

if __name__ == "__main__":
    # สำหรับ Hugging Face ใช้ Port 7860
    app.run(host="0.0.0.0", port=8000, debug=False)
