import os
import logging
from pathlib import Path
import tempfile
import time

from src.config import OUTPUT_DIR
from src.ai_pipeline import AIPipeline
from src.tts_engine import TTSEngine
from src.renderer import SceneRenderer
from src.video_composer import VideoComposer

logger = logging.getLogger(__name__)

class Orchestrator:
    def __init__(self, resolution=None, user_config=None):
        from src.config import DEFAULT_RESOLUTION
        self.user_config = user_config or {}
        video_lang = self.user_config.get("video_lang", "auto")
        self.ai_pipeline = AIPipeline(video_lang=video_lang if video_lang != "auto" else None)
        self.tts_engine = TTSEngine(user_config=self.user_config)
        res = resolution if resolution else DEFAULT_RESOLUTION
        self.renderer = SceneRenderer(resolution=res, user_config=self.user_config)
        self.composer = VideoComposer(user_config=self.user_config)

    def generate_lesson(
        self, 
        image_path: str = None, 
        text_prompt: str = None, 
        progress_callback=None
    ) -> str:
        """
        To'liq dars videosini yaratish jarayonini boshqaradi.
        
        progress_callback: Har bir qadamda foydalanuvchiga progressni bildirish uchun funksiya.
                           Masalan: progress_callback("Matn tahlil qilinmoqda...", 0.2)
        """
        def update_progress(msg, value):
            if progress_callback:
                progress_callback(msg, value)
            logger.info(f"[Progress {value*100:.0f}%] {msg}")

        start_time = time.time()
        
        # 1. Vision tahlil
        update_progress("Masala tahlil qilinmoqda (Vision Model)...", 0.1)
        problem_analysis = self.ai_pipeline.analyze_problem(image_path, text_prompt)
        
        # 2. Storyboard yaratish
        update_progress("Dars ssenariysi (Storyboard) yaratilmoqda...", 0.3)
        storyboard = self.ai_pipeline.generate_storyboard(problem_analysis)
        
        # Xavfsizlik filtri: AI ning ichki fikrlash matnini sahnalardan tozalash
        thinking_text = storyboard.thinking if storyboard.thinking else ""
        for scene in storyboard.scenes:
            # Agar speech ichida thinking matni takrorlangan bo'lsa, uni olib tashla
            if thinking_text and len(thinking_text) > 50 and thinking_text[:50] in scene.speech:
                scene.speech = scene.speech.replace(thinking_text, "").strip()
            # text_content ichidan ham thinking matnini tozala
            if scene.visual_details and scene.visual_details.text_content:
                cleaned = []
                for line in scene.visual_details.text_content:
                    # 100 belgidan uzun matnlar odatda thinking leak hisoblanadi
                    if len(line) > 150:
                        continue
                    # AI fikrlash kalitlari bor bo'lsa o'chirish
                    skip_keywords = ['Ehtimol', 'Bu noqulay', 'Keling,', 'Men hozirgi', 'foydalanuvchi', 'thinking', 'Correction needed', 'Note:']
                    if any(kw in line for kw in skip_keywords):
                        continue
                    cleaned.append(line)
                scene.visual_details.text_content = cleaned if cleaned else [""]
        
        # Vaqtinchalik fayllar uchun papka ochamiz
        with tempfile.TemporaryDirectory(dir=str(OUTPUT_DIR)) as temp_dir_str:
            temp_dir = Path(temp_dir_str)
            scenes_data = []
            
            # 3. Sahnama-sahna render va TTS ovoz chiqarish
            num_scenes = len(storyboard.scenes)
            for idx, scene in enumerate(storyboard.scenes):
                scene_num = scene.scene_number
                step_percentage = 0.4 + (idx / num_scenes) * 0.4 # 40% dan 80% gacha bo'lgan oraliq
                
                update_progress(f"{scene_num}-sahna tayyorlanmoqda...", step_percentage)
                
                # Audio va Rasm fayl yo'llarini belgilaymiz
                scene_audio_path = temp_dir / f"scene_{scene_num}.wav"
                scene_image_path = temp_dir / f"scene_{scene_num}.png"
                
                # Speech matnini tozalash: 200 belgidan uzun speech ni qisqartirish
                clean_speech = scene.speech
                if len(clean_speech) > 250:
                    # Faqat birinchi 2 gapni olish
                    sentences = clean_speech.split('.')
                    clean_speech = '. '.join(sentences[:2]).strip()
                    if not clean_speech.endswith('.'):
                        clean_speech += '.'

                # Ovoz chiqarish (TTS) - CPU'da ishlaydi
                # video_lang sozlamasi bo'lsa, u ishlatiladi; aks holda masalaning o'z tili
                tts_lang = self.user_config.get("video_lang", "auto")
                if tts_lang == "auto" or not tts_lang:
                    tts_lang = problem_analysis.language
                duration = self.tts_engine.generate_speech(
                    text=clean_speech, 
                    lang=tts_lang, 
                    output_path=str(scene_audio_path)
                )
                
                # Slayd chizish (Playwright)
                self.renderer.render_scene(
                    scene_data=scene.model_dump(), 
                    title=storyboard.title, 
                    output_path=str(scene_image_path)
                )
                
                scenes_data.append({
                    "image_path": str(scene_image_path),
                    "audio_path": str(scene_audio_path),
                    "duration": duration
                })
            
            # 4. Kliplarni FFmpeg yordamida birlashtirish
            update_progress("Sahnalar video klip ko'rinishida yig'ilmoqda (FFmpeg)...", 0.85)
            
            output_filename = f"lesson_{int(time.time())}.mp4"
            final_output_path = OUTPUT_DIR / output_filename
            
            success = self.composer.compose_video(
                scenes_data=scenes_data, 
                temp_dir=temp_dir, 
                output_video_path=str(final_output_path)
            )
            
            if not success:
                raise RuntimeError("Video yaratishda xatolik yuz berdi (FFmpeg error).")
            
            elapsed_time = time.time() - start_time
            update_progress(f"Dars videosi tayyor! (Ketgan vaqt: {elapsed_time:.1f} soniya)", 1.0)
            
            return str(final_output_path), storyboard

if __name__ == "__main__":
    # Test orchestrator
    logging.basicConfig(level=logging.INFO)
    print("Orchestrator modul tayyor.")
