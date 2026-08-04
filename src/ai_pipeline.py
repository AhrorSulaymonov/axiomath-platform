import json
import logging
import os
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

import src.config as config
from src.utils import normalize_language

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Pydantic Schemas for Structured Outputs

class ProblemAnalysis(BaseModel):
    subject: str = Field(description="O'quv fani (masalan, Matematika, Fizika, Kimyo)")
    topic: str = Field(description="Mavzu (masalan, Geometriya, Algebra, Kinematika)")
    problem_text: str = Field(description="Savolning aniq matni (OCR yoki rasm tahlilidan olingan)")
    given_variables: Dict[str, Any] = Field(description="Berilgan qiymatlar va o'zgaruvchilar (masalan: {'a': 5, 'b': 7, 'c': 8})")
    question: str = Field(description="Nimani topish so'ralganligi (savolning asosi)")
    language: str = Field(description="Savol berilgan til: 'uz' (o'zbekcha), 'ru' (ruscha), 'en' (inglizcha)")

    @field_validator('subject', 'topic', 'problem_text', 'question', 'language', mode='before')
    @classmethod
    def coerce_to_string(cls, v):
        if isinstance(v, list):
            return "; ".join(str(item) for item in v)
        return str(v) if v is not None else ""


class VisualDetails(BaseModel):
    visual_type: str = Field(default="text", description="Vizual komponent turi: 'title', 'formula', 'shape', 'coordinate_plane', 'text'")
    title: str = Field(default="", description="Slayd sarlavhasi (agar kerak bo'lsa)")
    latex_formulas: list[str] = Field(default_factory=list, description="KaTeX'da render qilinadigan formulalar ro'yxati (masalan, ['P = a + b + c', 'P = 5 + 7 + 8 = 20'])")
    shape_type: Optional[str] = Field(default=None, description="Chiziladigan shakl: 'triangle', 'circle', 'rectangle', 'square' yoki null")
    shape_labels: Dict[str, Any] = Field(default_factory=dict, description="Shakl tomonlari yoki burchaklarining qiymatlari (masalan, {'side_a': '5', 'side_b': '7', 'side_c': '8'})")
    text_content: list[str] = Field(default_factory=list, description="Ekranda chiqadigan qisqa va lo'nda matn satrlari")
    custom_svg: Optional[str] = Field(default=None, description="Geometrik masalalar uchun masalaga moslab chizilgan chiroyli va toza inline HTML5 SVG kodi. Hajmi har doim width='450' height='400' bo'lishi shart. Ranglar premium bo'lsin: fon rangsiz (fill='none'), chiziqlar oq yoki indigo (stroke='#818cf8', stroke-width='8'), matnlar Outfit shriftida (font-family='Outfit', fill='#f8fafc', font-size='34', font-weight='600'). Slaydda shakl tushunarli chiqishi uchun tomon va burchak qiymatlarini ham matn (<text>) sifatida SVG ichiga chiroyli joylashtiring.")

    @field_validator('visual_type', mode='before')
    @classmethod
    def validate_visual_type(cls, v):
        if v is None:
            return "text"
        return v


class Scene(BaseModel):
    scene_number: int = Field(description="Sahna tartib raqami (1 dan boshlab)")
    speech: str = Field(description="TTS ovoz beradigan tushuntirish matni. Bu matn juda uzun bo'lmasligi, 2-3 ta lo'nda gapdan iborat bo'likda bo'lishi kerak. Savol berilgan tilda yozilishi shart.")
    visual_details: VisualDetails = Field(default_factory=VisualDetails, description="Sahnaning vizual sozlamalari")


class Storyboard(BaseModel):
    thinking: str = Field(description="Masalani bosqichma-bosqich yechishning juda qisqa 1-2 gapdan iborat mantiqiy tahlili. Maksimal 50 ta so'z.")
    title: str = Field(description="Dars videosining umumiy qisqa sarlavhasi")
    scenes: list[Scene] = Field(description="Ketma-ket keladigan sahnalar ro'yxati (odatda 3 tadan 6 tagacha sahna)")


class AIPipeline:
    def __init__(self, video_lang: str = None):
        self.used_ollama_fallback = False
        self.video_lang = video_lang

    def _call_gemini(self, prompt: str, image_path: Optional[str] = None, timeout: float = 90.0, json_mode: bool = True) -> str:
        import google.generativeai as genai
        import PIL.Image

        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY topilmadi! Iltimos .env faylida GEMINI_API_KEY mavjudligini tekshiring.")

        genai.configure(api_key=gemini_key)
        
        model_name = config.BYNARA_MODEL if "gemini" in config.BYNARA_MODEL.lower() else "gemini-3.5-flash-lite"
        if model_name == "gemini-1.5-flash":
            model_name = "gemini-3.5-flash-lite"
        
        gen_config = {}
        if json_mode:
            gen_config["response_mime_type"] = "application/json"
            
        model = genai.GenerativeModel(model_name, generation_config=gen_config if json_mode else None)

        contents = []
        if image_path and os.path.exists(image_path):
            img = PIL.Image.open(image_path)
            contents.append(img)
        contents.append(prompt)

        logger.info(f"Gemini API so'rov yuborilmoqda ({model_name})...")
        response = model.generate_content(contents)
        text_response = response.text.strip()

        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
        text_response = text_response.strip()

        return text_response

    def _call_llm(self, prompt: str, image_path: Optional[str] = None, timeout: float = 90.0, json_mode: bool = True) -> str:
        model = getattr(config, "BYNARA_MODEL", "")
        if "gemini" in model.lower():
            return self._call_gemini(prompt, image_path, timeout, json_mode)
        else:
            return self._call_bynara(prompt, image_path, timeout, json_mode)




    def _call_bynara(self, prompt: str, image_path: Optional[str] = None, timeout: float = 30.0, json_mode: bool = True) -> str:
        import httpx
        import base64
        import mimetypes

        api_key = config.BYNARA_API_KEY.strip() if config.BYNARA_API_KEY else ""
        base_url = config.BYNARA_BASE_URL.strip() if config.BYNARA_BASE_URL else ""
        model = config.BYNARA_MODEL.strip() if config.BYNARA_MODEL else ""

        if not api_key:
            raise ValueError("Bynara API Key kiritilmagan! Iltimos, sozlamalardan API kalitni kiriting.")

        url = f"{base_url.rstrip('/')}/chat/completions"

        # Construct payload messages block (OpenAI vision layout compatible)
        content_list = [{"type": "text", "text": prompt}]
        
        if image_path and os.path.exists(image_path):
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode("utf-8")
            mime_type, _ = mimetypes.guess_type(image_path)
            if not mime_type:
                mime_type = "image/png"
            content_list.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime_type};base64,{image_data}"
                }
            })

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": content_list if (image_path and os.path.exists(image_path)) else prompt
                }
            ],
            "temperature": 0.2
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        import time
        max_retries = 2
        retry_delay = 3.0

        for attempt in range(max_retries):
            try:
                logger.info(f"Bynara API so'rov yuborilmoqda ({model}) - urinish {attempt+1}/{max_retries}...")
                with httpx.Client(timeout=timeout) as client:
                    response = client.post(url, json=payload, headers=headers)
                    
                    if response.status_code in [429, 503] and attempt < max_retries - 1:
                        logger.warning(f"Bynara API {response.status_code} qaytardi. {retry_delay} soniyadan keyin qayta urinib ko'ramiz...")
                        time.sleep(retry_delay)
                        retry_delay *= 2.0
                        continue
                        
                    response.raise_for_status()
                    response_json = response.json()
                    
                    try:
                        text_response = response_json["choices"][0]["message"]["content"]
                        logger.info(f"Bynara raw response: {text_response}")
                        
                        # Clean and format response string
                        text_response = text_response.strip()
                        if text_response.startswith("```json"):
                            text_response = text_response[7:]
                        if text_response.endswith("```"):
                            text_response = text_response[:-3]
                        text_response = text_response.strip()
                        
                        return text_response
                    except (KeyError, IndexError) as e:
                        logger.error(f"Bynara javobini o'qishda xatolik: {response_json}")
                        raise RuntimeError("Bynara API kutilmagan javob qaytardi.") from e
            except httpx.HTTPStatusError as e:
                # If it's a client error (e.g. 402 Payment Required, 400 Bad Request, 403, 404), fail immediately
                status_code = e.response.status_code
                if status_code not in [429, 502, 503, 504]:
                    logger.error(f"Bynara API xatolik qaytardi ({status_code}). Qayta urinish bekor qilindi.")
                    if status_code == 402:
                        raise RuntimeError("Bynara API xatosi: 402 Payment Required (Hisobingizda mablag' yetarli emas!)") from e
                    elif status_code == 401:
                        raise RuntimeError("Bynara API xatosi: 401 Unauthorized (API kalitingiz noto'g'ri!)") from e
                    raise e
                
                # For 429 or 5xx, retry if we have attempts remaining
                if attempt == max_retries - 1:
                    raise e
                logger.warning(f"Bynara API {status_code} qaytardi. {retry_delay} soniyadan keyin qayta urinib ko'ramiz...")
                time.sleep(retry_delay)
                retry_delay *= 2.0
            except httpx.RequestError as e:
                # Retry on connection/request errors
                if attempt == max_retries - 1:
                    raise e
                logger.warning(f"Tarmoq ulanish xatoligi yuz berdi: {e}. {retry_delay} soniyadan keyin qayta urinib ko'ramiz...")
                time.sleep(retry_delay)
                retry_delay *= 2.0


    def analyze_problem(self, image_path: Optional[str] = None, text_prompt: Optional[str] = None) -> ProblemAnalysis:
        """
        Vision model yordamida rasm yoki matnli masalani tahlil qiladi va tizimlashtirilgan JSON qaytaradi.
        """
        if not image_path and not text_prompt:
            raise ValueError("Kamida image_path yoki text_prompt berilishi kerak.")

        prompt = (
            "Berilgan matematika yoki fizika masalasini (rasm yoki matnli) diqqat bilan o'rgan. "
            "Uning fani, mavzusi, berilgan qiymatlari va nimani topish kerakligini aniq ajratib ber.\n\n"
            "Siz quyidagi ko'rinishdagi JSON formatida javob berishingiz SHART (masalaning haqiqiy qiymatlaridan kelib chiqib to'ldiring):\n"
            "{\n"
            "  \"subject\": \"Matematika\",\n"
            "  \"topic\": \"Arifmetika\",\n"
            "  \"problem_text\": \"23 + 45 - 12 = ?\",\n"
            "  \"given_variables\": {},\n"
            "  \"question\": \"Natijani hisoblang\",\n"
            "  \"language\": \"uz\"\n"
            "}\n"
        )

        if text_prompt:
            prompt += f"\n\nMasala matni:\n{text_prompt}"

        result_json = None

        if config.USE_BYNARA:
            logger.info(f"LLM API orqali masalani tahlil qilish boshlandi ({config.BYNARA_MODEL})...")
            try:
                result_json = self._call_llm(prompt, image_path)
            except Exception as e:
                logger.error(f"LLM API orqali tahlil qilishda xatolik yuz berdi: {e}")
                raise RuntimeError(f"LLM API xatosi: {e}")

        if not result_json:
            raise RuntimeError("Bynara API faol emas yoki API kalitlar noto'g'ri sozlangan!")

        analysis = ProblemAnalysis.model_validate_json(result_json)
        analysis.language = normalize_language(analysis.language)
        return analysis

    def generate_storyboard(self, problem: ProblemAnalysis) -> Storyboard:
        """
        Reasoning model yordamida masalaning storyboard rejasini (JSON) tuzadi.
        """
        logger.info("Reasoning model orqali Storyboard generatsiyasi boshlandi...")

        # Video tili: user_config dan olish yoki masala tiliga mos qilish
        lang_map = {
            "uz": "UZBEK",
            "en": "ENGLISH",
            "ru": "RUSSIAN"
        }

        if self.video_lang and self.video_lang != "auto":
            target_lang_name = lang_map.get(self.video_lang, "ENGLISH")
            lang_block = (
                f"🚨 MANDATORY LANGUAGE RULE — READ THIS FIRST AND NEVER VIOLATE 🚨\n"
                f"You MUST write ALL 'speech' fields ONLY in {target_lang_name}.\n"
                f"Do NOT write speeches in Uzbek or any other language.\n"
                f"Even if the problem is written in Uzbek, translate ALL speech to {target_lang_name}.\n"
                f"This is the highest priority rule. Ignore the problem's original language for speeches.\n\n"
            )
        else:
            detected = lang_map.get(problem.language, "UZBEK")
            lang_block = (
                f"🚨 MANDATORY LANGUAGE RULE — READ THIS FIRST 🚨\n"
                f"Problem language detected: {detected}.\n"
                f"You MUST write ALL 'speech' fields in {detected} language only.\n\n"
            )

        prompt = (
            lang_block +
            f"Create a 30-90 second video lesson storyboard for the following problem.\n"
            f"Problem details:\n"
            f"Subject: {problem.subject}\n"
            f"Topic: {problem.topic}\n"
            f"Text: {problem.problem_text}\n"
            f"Given: {json.dumps(problem.given_variables, ensure_ascii=False)}\n"
            f"Question: {problem.question}\n\n"
            f"Video ketma-ketligi QAT'IY ravishda quyidagi tartibda bo'lishi SHART:\n"
            f"  1-SAHNA: FORMULA VA QOIDA — Masalani yechish uchun qanday formula/qoida ishlatilishini ko'rsating.\n"
            f"  2...N SAHNALAR: QADAM-BA-QADAM YECHIM — Har bir qadamda NATIJA va NIMA UCHUN aynan shu ish qilinganini tushuntiring.\n"
            f"  OXIRIDAN OLDINGI SAHNA: UMUMIY XATOLAR — O'quvchilar bu masalada qanday xato qilishini tushuntiring.\n"
            f"  OXIRGI SAHNA: HAYOTIY TATBIQI — Bu bilim real hayotda qayerda ishlatilishiga 1 ta qisqa misol keltiring.\n\n"
        )
        
        target_lang = lang_map.get(self.video_lang, "UZBEK") if self.video_lang and self.video_lang != "auto" else lang_map.get(problem.language, "UZBEK")
        ex_sp1 = "Bu masalani yechish uchun noma'lum sonni iks deb belgilab, tenglama tuzamiz." if target_lang == "UZBEK" else ("[Write speech here in " + target_lang + "]")
        ex_sp2 = "Birinchi qadam. Qavslarni ochib, o'xshash hadlarni ixchamlaymiz. Natijada uch iks minus yigirma uch teng yuz o'n ikki hosil bo'ladi." if target_lang == "UZBEK" else ("[Write speech here in " + target_lang + "]")
        ex_sp3 = "Ikkinchi qadam. Yigirma uchni o'ng tomonga o'tkazib qo'shamiz va iks ni topamiz. Uch iks teng yuz o'ttiz besh, demak iks teng qirq besh bo'ladi." if target_lang == "UZBEK" else ("[Write speech here in " + target_lang + "]")
        ex_sp4 = "Xulosa qilib aytganda, birinchi qutida qirq besh ta olma bor ekan. Bu javobimiz." if target_lang == "UZBEK" else ("[Write speech here in " + target_lang + "]")
        ex_sp5 = "O'quvchilar ko'pincha ikkinchi qutini yozayotganda plyus o'rniga minus qo'yishda xato qilishadi. Bunga ehtiyot bo'ling." if target_lang == "UZBEK" else ("[Write speech here in " + target_lang + "]")
        ex_sp6 = "Bu kabi tenglamalar real hayotda omborxonalardagi mahsulotlarni taqsimlashda va savdo logistikasida juda asqotadi." if target_lang == "UZBEK" else ("[Write speech here in " + target_lang + "]")

        prompt += (
            f"Siz quyidagi JSON formatida javob berishingiz SHART:\n"
            f"{{\n"
            f"  \"thinking\": \"[Brief explanation of the logic in {target_lang}]\",\n"
            f"  \"title\": \"[Title of the lesson in {target_lang}]\",\n"
            f"  \"scenes\": [\n"
            f"    {{\n"
            f"      \"scene_number\": 1,\n"
            f"      \"speech\": \"{ex_sp1}\",\n"
            f"      \"visual_details\": {{\n"
            f"        \"visual_type\": \"title\",\n"
            f"        \"title\": \"[Formula/Rule Title]\",\n"
            f"        \"latex_formulas\": [\"...\"],\n"
            f"        \"shape_type\": null,\n"
            f"        \"shape_labels\": {{}},\n"
            f"        \"text_content\": [\"...\"],\n"
            f"      }}\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"scene_number\": 2,\n"
            f"      \"speech\": \"{ex_sp2}\",\n"
            f"      \"visual_details\": {{\n"
            f"        \"visual_type\": \"text_content\",\n"
            f"        \"title\": \"[Step 1 Title]\",\n"
            f"        \"latex_formulas\": [\"...\"],\n"
            f"        \"shape_type\": null,\n"
            f"        \"shape_labels\": {{}},\n"
            f"        \"text_content\": [\"...\"]\n"
            f"      }}\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"scene_number\": 3,\n"
            f"      \"speech\": \"{ex_sp3}\",\n"
            f"      \"visual_details\": {{\n"
            f"        \"visual_type\": \"text_content\",\n"
            f"        \"title\": \"[Step 2 Title]\",\n"
            f"        \"latex_formulas\": [\"...\"],\n"
            f"        \"shape_type\": null,\n"
            f"        \"shape_labels\": {{}},\n"
            f"        \"text_content\": [\"...\"]\n"
            f"      }}\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"scene_number\": 4,\n"
            f"      \"speech\": \"{ex_sp4}\",\n"
            f"      \"visual_details\": {{\n"
            f"        \"visual_type\": \"title\",\n"
            f"        \"title\": \"[Conclusion Title]\",\n"
            f"        \"latex_formulas\": [\"...\"],\n"
            f"        \"shape_type\": null,\n"
            f"        \"shape_labels\": {{}},\n"
            f"        \"text_content\": [\"...\"]\n"
            f"      }}\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"scene_number\": 5,\n"
            f"      \"speech\": \"{ex_sp5}\",\n"
            f"      \"visual_details\": {{\n"
            f"        \"visual_type\": \"title\",\n"
            f"        \"title\": \"[Common Mistakes Title]\",\n"
            f"        \"latex_formulas\": [],\n"
            f"        \"shape_type\": null,\n"
            f"        \"shape_labels\": {{}},\n"
            f"        \"text_content\": [\"...\"]\n"
            f"      }}\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"scene_number\": 6,\n"
            f"      \"speech\": \"{ex_sp6}\",\n"
            f"      \"visual_details\": {{\n"
            f"        \"visual_type\": \"title\",\n"
            f"        \"title\": \"[Real-World Use Title]\",\n"
            f"        \"latex_formulas\": [],\n"
            f"        \"shape_type\": null,\n"
            f"        \"shape_labels\": {{}},\n"
            f"        \"text_content\": [\"...\"]\n"
            f"      }}\n"
            f"    }}\n"
            f"  ]\n"
            f"}}\n\n"
            f"YOKI agar masala geometriyaga doir bo'lsa, \"visual_type\": \"shape\" va chizmalar bilan ssenariy yarating.\n\n"
            f"IMPORTANT RULES:\n"
            f"1. Solve the problem step-by-step first. The solution must be 100% mathematically correct!\n"
            f"2. 'thinking' field: max 1-2 sentences (under 50 words), brief solution logic only.\n"
            f"3. Number of scenes: 4 to 7. Each scene = one clear math step, not just showing a number.\n"
        )

        # Language-specific speech rules
        if self.video_lang and self.video_lang != "auto" and self.video_lang != "uz":
            target_lang_name = lang_map.get(self.video_lang, "ENGLISH")
            prompt += (
                f"4. speech fields: Write numbers as words in {target_lang_name} (e.g. '45' → 'forty-five' in English, 'сорок пять' in Russian). Do NOT write math symbols (+,-,=) in speech — say them as words.\n"
                f"5. Each speech: 1-2 sentences, 15-25 words.\n"
                f"6. text_content: No LaTeX backslashes. Formulas only in latex_formulas.\n"
                f"7. Every scene MUST have complete visual_details.\n"
                f"8. For geometry problems: use visual_type='shape' with custom_svg in the first scene.\n\n"
                f"🔴 FINAL REMINDER — THIS IS THE MOST IMPORTANT RULE:\n"
                f"Every single 'speech' field in the JSON MUST be written in {target_lang_name}.\n"
                f"If any speech field contains Uzbek or other language text, your response is WRONG.\n"
                f"Translate everything. Do NOT use Uzbek words in any speech field.\n"
            )
        else:
            prompt += (
                f"4. Nutq (speech): matematik o'zgaruvchilarni og'zaki yozing: x→'iks', y→'igrek', z→'zet'. Matematik belgilar (+,-,=,%) yozmang — og'zaki so'z bilan ifodalang.\n"
                f"5. Har bir sahna nutqi 1-2 gap, 15-25 so'z.\n"
                f"6. text_content ichida LaTeX belgilarini yozmang. Formulalar faqat latex_formulas ichida.\n"
                f"7. HAR BIR SAHNADA visual_details to'liq bo'lsin.\n"
                f"8. GEOMETRIK MASALALAR: birinchi sahnada visual_type='shape' va custom_svg bilan chizma yarating.\n"
            )

        result_json = None

        if config.USE_BYNARA:
            logger.info(f"LLM API orqali Storyboard generatsiyasi boshlandi ({config.BYNARA_MODEL})...")
            try:
                result_json = self._call_llm(prompt, timeout=90.0)
            except Exception as e:
                logger.error(f"LLM API Storyboard generatsiyasida xatolik yuz berdi: {e}")
                raise RuntimeError(f"LLM API Storyboard xatosi: {e}")

        if not result_json:
            raise RuntimeError("Bynara API faol emas yoki API kalitlar noto'g'ri sozlangan!")

        logger.info(f"Storyboard JSON: {result_json}")
        logger.info("Storyboard muvaffaqiyatli yaratildi.")
        
        try:
            storyboard = Storyboard.model_validate_json(result_json)
        except Exception as e:
            logger.warning(f"Initial Storyboard validation failed: {e}. Trying robust fallback parser...")
            try:
                data = json.loads(result_json)
                if "thinking" not in data:
                    data["thinking"] = "Masala yechimi mantiqi."
                if "title" not in data:
                    data["title"] = "Darslik"
                
                # Check if scenes is missing or empty, but thinking has the content
                if ("scenes" not in data or not data["scenes"]) and "thinking" in data:
                    thinking_text = data["thinking"]
                    logger.info("Extracting scenes from 'thinking' text...")
                    
                    # Split thinking text into lines
                    lines = thinking_text.split("\n")
                    scenes_list = []
                    current_scene = None
                    scene_counter = 1
                    
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                        
                        # Match something like "1-sahna", "Sahna 1", "🎬 1", "1. Kirish"
                        import re
                        is_new_scene = (
                            re.search(r'(?:sahna|\bscene\b|🎬)\s*\d+', line, re.IGNORECASE) or 
                            re.match(r'^\d+\.\s+\w+', line) or
                            line.startswith("Kirish:") or line.startswith("Javob:")
                        )
                        
                        if is_new_scene:
                            if current_scene:
                                scenes_list.append(current_scene)
                            
                            # Clean the scene label
                            clean_line = re.sub(r'^(?:🎬|sahna|\bscene\b|\d+\.|\s)+', '', line, flags=re.IGNORECASE).strip()
                            current_scene = {
                                "scene_number": scene_counter,
                                "speech": clean_line,
                                "visual_details": {
                                    "visual_type": "text",
                                    "title": "",
                                    "latex_formulas": [],
                                    "text_content": [clean_line[:100]]
                                }
                            }
                            scene_counter += 1
                        else:
                            if current_scene:
                                # Append to previous speech
                                current_scene["speech"] += " " + line
                                current_scene["visual_details"]["text_content"] = [current_scene["speech"][:100]]
                            else:
                                # Create initial scene if text starts without a clear scene header
                                current_scene = {
                                    "scene_number": scene_counter,
                                    "speech": line,
                                    "visual_details": {
                                        "visual_type": "text",
                                        "title": "",
                                        "latex_formulas": [],
                                        "text_content": [line[:100]]
                                    }
                                }
                                scene_counter += 1
                                
                    if current_scene:
                        scenes_list.append(current_scene)
                        
                    if len(scenes_list) > 0:
                        data["scenes"] = scenes_list
                    else:
                        # Hard fallback to a single scene
                        data["scenes"] = [{
                            "scene_number": 1,
                            "speech": thinking_text[:300],
                            "visual_details": {
                                "visual_type": "text",
                                "title": "Dars",
                                "latex_formulas": [],
                                "text_content": [thinking_text[:100]]
                            }
                        }]
                
                storyboard = Storyboard.model_validate(data)
                logger.info("Successfully recovered storyboard using fallback parser!")
            except Exception as e2:
                logger.error(f"Fallback storyboard parsing also failed: {e2}")
                raise e
        
        # Post-process storyboard to ensure visual_details is never empty or missing
        for scene in storyboard.scenes:
            if scene.visual_details is None:
                scene.visual_details = VisualDetails(
                    visual_type="title" if scene.scene_number in [1, len(storyboard.scenes)] else "text",
                    title="",
                    latex_formulas=[],
                    text_content=[scene.speech]
                )
            else:
                tc = scene.visual_details.text_content or []
                # Remove spacing to compare
                joined_tc = "".join(tc).replace(" ", "")
                formulas_joined = "".join(scene.visual_details.latex_formulas or []).replace(" ", "")
                
                # Check if text_content is just arithmetic symbols/equation characters
                is_formula_chars = False
                if tc:
                    import re
                    is_formula_chars = all(re.match(r'^[\d\+\-\*\/\=\?·•\s]$', item.strip()) for item in tc if item.strip())
                
                # If text_content duplicates the formula or is just formula characters, reset it to speech
                if tc and (joined_tc == formulas_joined or is_formula_chars):
                    scene.visual_details.text_content = []
                
                # Fallback to explanation speech if text_content is empty
                if not scene.visual_details.text_content:
                    scene.visual_details.text_content = [scene.speech]
                    
        return storyboard

    def generate_text_analysis(self, prompt: str, image_path=None, messages_list=None):
        system_prompt = (
            "Act as an expert math/science teacher. Solve the provided problem step-by-step. "
            "CRITICAL RULE: Detect the language of the user's question and respond ENTIRELY in that same language. "
            "If the question is in English, answer in English. If in Russian, answer in Russian. If in Uzbek, answer in Uzbek. "
            "Do NOT include internal thoughts or self-corrections. Provide ONLY the final, correct, clean output.\n"
            "Format your output EXACTLY like this structure (translate the section headers to match the detected language):\n\n"
            "📐 [TITLE: Problem Analysis in detected language]\n"
            "✅ 1. [ANSWER: Short final answer]\n"
            "📐 2. [FORMULA/RULE: Relevant formulas or rules]\n"
            "📝 3. [STEP-BY-STEP SOLUTION: Each step on its own line]\n"
            "💡 4. [VISUAL EXPLANATION: Describe the process in plain text]\n"
            "📖 5. [COMMON MISTAKES: Typical student errors for this type]\n"
            "🚀 6. [SIMILAR EXAMPLE: A similar problem with short solution]\n"
            "📌 7. [TIP: A short helpful tip]\n"
            "📌 8. [REAL-WORLD USE: Where this is used in real life]\n"
            "🔍 9. SEARCH_QUERY: [Provide a 2-4 word specific math or science topic name for searching YouTube. Do NOT translate the word 'SEARCH_QUERY:'. Provide only the core topic in the detected language (e.g. 'Kvadrat tenglamalar yechish', 'Linear equations explained')]\n\n"
            "IMPORTANT RULES:\n"
            "1. Output exactly those 9 sections with emojis. No introductory text.\n"
            "2. DO NOT use LaTeX formatting like $x$ or \\frac. Write math normally in plain text (e.g. x, a/b, 3/4).\n"
            "3. DO NOT output your thought process. Give the final answer directly.\n\n"
            "User Input/Problem:\n"
        )
        
        history_text = ""
        if messages_list:
            history_text = "PREVIOUS CONVERSATION CONTEXT:\n"
            for msg in messages_list:
                role = "User" if msg.get("role") == "user" else "Assistant"
                content = msg.get("content", "")
                history_text += f"{role}: {content}\n\n"
            history_text += "NEW QUESTION:\n"
            
        full_prompt = system_prompt + history_text + prompt
        
        logger.info("Bynara API orqali text tahlil qilish boshlandi...")
        try:
            result = self._call_bynara(full_prompt, image_path=image_path, timeout=60.0, json_mode=False)
            
            # Extract Search Query safely
            search_query = None
            import re
            match = re.search(r'🔍\s*9\.[^:]*:\s*(.+)', result, re.IGNORECASE)
            if match:
                raw_query = match.group(1).strip()
                # Remove brackets, quotes, and asterisks
                search_query = re.sub(r'[\[\]\*\'\"]', '', raw_query).strip()
                # If LLM still added 'SEARCH_QUERY' inside, strip it
                search_query = search_query.replace('SEARCH_QUERY', '').replace(':', '').strip()
            
            # Clean the output (remove the SEARCH_QUERY line from user output)
            result = re.sub(r'🔍\s*9\..*', '', result, flags=re.IGNORECASE).strip()

            yt_videos = []
            if search_query:
                try:
                    from youtube_search import YoutubeSearch
                    # Append 'math' or 'matematika' to the query if it's too generic, but usually topic is enough.
                    search_term = search_query
                    logger.info(f"YouTube'dan izlanmoqda: {search_term}")
                    yt_videos = YoutubeSearch(search_term, max_results=3).to_dict()
                except Exception as ex:
                    logger.warning(f"YouTube izlashda xatolik: {ex}")

            return result, yt_videos
        except Exception as e:
            logger.error(f"Bynara API orqali text tahlil qilishda xatolik yuz berdi: {e}")
            raise RuntimeError(f"Bynara API xatosi: {e}")

# Test qilish uchun skript
if __name__ == "__main__":
    pipeline = AIPipeline()
    dummy_problem = ProblemAnalysis(
        subject="Matematika",
        topic="Geometriya",
        problem_text="Uchburchakning tomonlari 5, 7 va 8. Perimetrini toping.",
        given_variables={"a": 5, "b": 7, "c": 8},
        question="Uchburchakning perimetri",
        language="uz"
    )
    storyboard = pipeline.generate_storyboard(dummy_problem)
    print(storyboard.model_dump_json(indent=2))
