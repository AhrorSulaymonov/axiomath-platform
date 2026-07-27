import os
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def find_ffmpeg_executable() -> str:
    """
    Tizimda FFmpeg o'rnatilganligini va uning joylashuvini aniqlaydi.
    Agar u PATHda bo'lmasa, Windows WinGet o'rnatgan joydan qidiradi.
    """
    # 1. PATH'da borligini tekshiramiz
    try:
        # Windowsda subprocess.run calls shell cmd to check
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        logger.info("FFmpeg tizim PATH'idan muvaffaqiyatli topildi.")
        return "ffmpeg"
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    # 2. Windows WinGet o'rnatgan standard papkani tekshiramiz
    if os.name == 'nt':
        appdata_local = os.environ.get('LOCALAPPDATA')
        if appdata_local:
            winget_packages_dir = Path(appdata_local) / "Microsoft/WinGet/Packages"
            if winget_packages_dir.exists():
                for folder in winget_packages_dir.iterdir():
                    if "FFmpeg" in folder.name:
                        # Look inside ffmpeg-*/bin/ffmpeg.exe
                        for subfolder in folder.iterdir():
                            if subfolder.is_dir() and subfolder.name.startswith("ffmpeg-"):
                                ffmpeg_exe = subfolder / "bin/ffmpeg.exe"
                                if ffmpeg_exe.exists():
                                    logger.info(f"FFmpeg WinGet papkasidan topildi: {ffmpeg_exe}")
                                    return str(ffmpeg_exe)
                            
    # Fallback to default
    logger.warning("FFmpeg topilmadi. Tizim bo'yicha standart 'ffmpeg' ishlatiladi (muammoga olib kelishi mumkin).")
    return "ffmpeg"


class VideoComposer:
    def __init__(self, user_config=None):
        self.user_config = user_config or {}
        # Dynamically resolve FFmpeg executable path
        self.ffmpeg_path = find_ffmpeg_executable()

    def _create_scene_clip(self, image_path: str, audio_path: str, duration: float, output_clip_path: str) -> bool:
        """
        Bitta rasm va audioni birlashtirib, berilgan davomiylikdagi mp4 klip yaratadi.
        """
        logger.info(f"Klip yaratilmoqda: {image_path} + {audio_path} -> {output_clip_path} (Uzunligi: {duration:.2f}s)")
        
        # FFmpeg buyrug'i: rasm va audioni birlashtirish
        cmd = [
            self.ffmpeg_path, "-y",
            "-loop", "1", "-i", str(image_path),
            "-i", str(audio_path),
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-t", str(duration),
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-shortest",
            str(output_clip_path)
        ]
        
        try:
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg klip yaratishda xatolik yuz berdi: {e.stderr}")
            return False

    def compose_video(self, scenes_data: list, temp_dir: Path, output_video_path: str) -> bool:
        """
        Barcha sahna rasmlari va audiolardan tayyor MP4 video darslik yig'adi.
        """
        logger.info(f"Video darslik yig'ish boshlandi -> {output_video_path}")
        
        temp_clips = []
        
        # 1. Har bir sahna uchun alohida klip yaratamiz
        for i, scene in enumerate(scenes_data):
            clip_path = temp_dir / f"scene_{i}_temp.mp4"
            success = self._create_scene_clip(
                image_path=scene["image_path"],
                audio_path=scene["audio_path"],
                duration=scene["duration"],
                output_clip_path=str(clip_path)
            )
            if not success:
                logger.error("Bitta sahnani klip qilishda xatolik bo'lgani uchun video yig'ish to'xtatildi.")
                return False
            temp_clips.append(clip_path)

        # 2. Kliplarni birlashtirish uchun FFmpeg concat ro'yxatini yozamiz
        concat_file = temp_dir / "concat_list.txt"
        with open(concat_file, "w", encoding="utf-8") as f:
            for clip in temp_clips:
                normalized_path = str(clip.resolve()).replace("\\", "/")
                f.write(f"file '{normalized_path}'\n")

        # 3. Kliplarni bitta mp4ga birlashtirish
        logger.info("Barcha kliplar birlashtirilmoqda...")
        raw_concat_path = temp_dir / "raw_concat.mp4"
        cmd_concat = [
            self.ffmpeg_path, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c", "copy",
            str(raw_concat_path)
        ]
        
        try:
            subprocess.run(cmd_concat, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            
            # 4. Orqa fon musiqasini qo'shish (agar bo'lsa)
            bg_music = self.user_config.get("bg_music", "none")
            if bg_music != "none":
                logger.info(f"Orqa fon musiqasi qo'shilmoqda: {bg_music}")
                # Generate a soft synthetic ambient/brown noise since we don't have local mp3s
                # For lofi: soft brown noise with lowpass filter
                # For classical: soft sine wave chords (C major)
                if bg_music == "lofi":
                    audio_filter = "anoisesrc=c=brown:a=0.05,lowpass=f=400"
                else: # classical
                    audio_filter = "aevalsrc='0.05*sin(261.63*2*PI*t)+0.05*sin(329.63*2*PI*t)+0.05*sin(392.00*2*PI*t)'"

                cmd_mix = [
                    self.ffmpeg_path, "-y",
                    "-i", str(raw_concat_path),
                    "-f", "lavfi", "-i", audio_filter,
                    "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first[a]",
                    "-map", "0:v", "-map", "[a]",
                    "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k",
                    str(output_video_path)
                ]
                subprocess.run(cmd_mix, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            else:
                import shutil
                shutil.copy(raw_concat_path, output_video_path)
                
            logger.info(f"Video darslik muvaffaqiyatli yaratildi: {output_video_path}")
            
            # 5. Vaqtinchalik fayllarni o'chirish (tozalash)
            try:
                concat_file.unlink(missing_ok=True)
                raw_concat_path.unlink(missing_ok=True)
                for clip in temp_clips:
                    clip.unlink(missing_ok=True)
                logger.info("Vaqtinchalik fayllar tozalandi.")
            except Exception as clean_err:
                logger.warning(f"Vaqtinchalik fayllarni o'chirishda xatolik: {clean_err}")
                
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg xatolik yuz berdi: {e.stderr}")
            return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    composer = VideoComposer()
    print(f"VideoComposer yuklandi. Topilgan FFmpeg: {composer.ffmpeg_path}")
