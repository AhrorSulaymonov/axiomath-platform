import os
import logging
import ffmpeg
import asyncio
from src.utils import latin_to_cyrillic, normalize_language, replace_numbers_with_words, replace_math_variables_phonetic

logger = logging.getLogger(__name__)

# Try importing torch and transformers for local VITS fallback
HAS_TORCH = False
try:
    import torch
    import numpy as np
    from scipy.io import wavfile
    from transformers import VitsModel, AutoTokenizer
    HAS_TORCH = True
except Exception as e:
    logger.warning(
        f"MMS-TTS kutubxonalari (PyTorch/Transformers) yuklanmadi ({e}). "
        "Faqat pure-Python Edge-TTS rejimi ishlaydi."
    )

class TTSEngine:
    def __init__(self, user_config=None):
        self.user_config = user_config or {}
        self.models = {}
        self.tokenizers = {}

    def _load_model(self, lang: str):
        """ Loads local TTS model if torch is available. """
        if not HAS_TORCH:
            raise RuntimeError("Local VITS TTS is unavailable because PyTorch was blocked or not installed.")
        
        lang = normalize_language(lang)
        if lang not in self.models:
            from src.config import TTS_MODELS_DIR, TTS_MODELS
            local_path = TTS_MODELS_DIR / lang
            if local_path.exists() and any(local_path.iterdir()):
                model_source = str(local_path)
            else:
                model_source = TTS_MODELS.get(lang)
                if not model_source:
                    raise ValueError(f"Taniqsiz til: {lang}")
            
            tokenizer = AutoTokenizer.from_pretrained(model_source)
            model = VitsModel.from_pretrained(model_source).to("cpu")
            self.tokenizers[lang] = tokenizer
            self.models[lang] = model

    def generate_speech(self, text: str, lang: str, output_path: str) -> float:
        """
        Matnni audio WAV/MP3 fayliga aylantiradi va davomiyligini (sekundlarda) qaytaradi.
        """
        lang = normalize_language(lang)
        voice_type = self.user_config.get("voice_type", "Erkak")
        
        # Faqat o'zbek tili uchun fonetik va sonlarni so'zga o'girish
        if lang == "uz":
            phonetic_text = replace_math_variables_phonetic(text)
            normalized_text = replace_numbers_with_words(phonetic_text)
        else:
            normalized_text = text  # Ingliz/Rus tilida asl matn ishlatiladi
        
        # Try Edge-TTS first: premium neural voices, pure Python, zero binary/DLL issues
        try:
            import edge_tts
            logger.info(f"Edge-TTS orqali ovoz sintez qilinmoqda (lang={lang}): '{normalized_text[:50]}...'")
            
            # Map language to edge-tts voice
            if lang == "uz":
                voice = "uz-UZ-MadinaNeural" if voice_type == "Ayol" else "uz-UZ-SardorNeural"
            elif lang == "ru":
                voice = "ru-RU-SvetlanaNeural" if voice_type == "Ayol" else "ru-RU-DmitryNeural"
            else:  # en and others
                voice = "en-US-AvaNeural" if voice_type == "Ayol" else "en-US-AndrewNeural"
            
            async def _save_audio():
                communicate = edge_tts.Communicate(normalized_text, voice)
                await communicate.save(temp_mp3)
                
            temp_mp3 = output_path + ".temp.mp3"
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Run async function synchronously
            asyncio.run(_save_audio())
            
            # Convert MP3 to WAV using ffmpeg-python
            if os.path.exists(output_path):
                os.remove(output_path)
                
            (
                ffmpeg
                .input(temp_mp3)
                .output(output_path, acodec='pcm_s16le', ac=1, ar='22050')
                .overwrite_output()
                .run(quiet=True)
            )
            os.remove(temp_mp3)
            
            # Read duration using ffprobe
            duration = self._get_duration(output_path)
            logger.info(f"Edge-TTS ovoz saqlandi: {output_path} (Uzunligi: {duration:.2f} soniya)")
            return duration
            
        except Exception as ee:
            logger.warning(f"Edge-TTS sintezi xato berdi ({ee}). Local MMS-TTS rejimiga o'tilmoqda...")
            if not HAS_TORCH:
                raise RuntimeError(
                    f"Hech qaysi TTS ishlamadi. Edge-TTS xatosi: {ee}. "
                    "PyTorch esa tizim siyosati (Application Control) tomonidan bloklangan."
                )

        # Fallback to Local MMS-TTS
        self._load_model(lang)
        tokenizer = self.tokenizers[lang]
        model = self.models[lang]
        
        processed_text = latin_to_cyrillic(normalized_text) if lang == "uz" else normalized_text
        inputs = tokenizer(processed_text, return_tensors="pt")
        
        torch.manual_seed(42)
        with torch.no_grad():
            output = model(**inputs)
            waveform = output.waveform.squeeze().cpu().numpy()
            sampling_rate = model.config.sampling_rate

        import numpy as np
        from scipy.io import wavfile
        waveform = waveform / np.max(np.abs(waveform))
        waveform_int16 = (waveform * 32767).astype(np.int16)
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        wavfile.write(output_path, sampling_rate, waveform_int16)
        
        duration = len(waveform) / sampling_rate
        return duration

    def _get_duration(self, file_path: str) -> float:
        """ Read duration of audio file using ffprobe/ffmpeg. """
        try:
            probe = ffmpeg.probe(file_path)
            audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
            return float(audio_stream['duration'])
        except Exception as e:
            logger.warning(f"Audio davomiyligini aniqlashda xatolik: {e}")
            return 3.0

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    tts = TTSEngine()
    try:
        duration = tts.generate_speech("Uchburchakning perimetri yigirmaga teng.", "uz", "output/test_speech.wav")
        print(f"Test tugadi. Audio uzunligi: {duration:.2f} soniya")
    except Exception as e:
        print(f"Xatolik: {e}")
