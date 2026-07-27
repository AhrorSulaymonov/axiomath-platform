# 🎓 Education AI MVP: Premium Video Darslik Generator

Ushbu platforma kiritilgan matematik/geometrik masalalarni yoki masala rasmini sun'iy intellekt yordamida tahlil qilib, ularni qisqa va qiziqarli **20–60 soniyalik video darslarga (.mp4)** aylantirib beruvchi zamonaviy veb-platformadir.

Loyiha arxitekturasi **"Sotiladigan SaaS mahsulot" (Production MVP)** talablariga mos ravishda, soddalashtirilgan HTTP va ma'lumotlar bazasi zaxirasi orqali to'liq asinxron rejimda ishlaydi.

---

## 🚀 Asosiy Imkoniyatlar va Xususiyatlar

1. **Premium Veb Interfeys (Next.js/React Visuals):**
   * Streamlit andozalari ustiga yozilgan maxsus **glassmorfik CSS** qatlamlari.
   * Ambient radial glow yoritish effektlari, chiroyli dizayndagi input va tab elementlari.
2. **Gibrid Ma'lumotlar Bazasi (MongoDB Atlas + SQLite):**
   * **MongoDB Atlas** bulutli bazasini qo'llab-quvvatlaydi. `.env` faylida `MONGODB_URI` kiritilsa, barcha ma'lumotlar bulutda saqlanadi.
   * Agar bulut sozlanmagan bo'lsa, tizim hech qanday xatoliksiz avtomatik ravishda local **SQLite (`education_ai.db`)** fayliga o'tib ishlayveradi (nol-sozlama).
3. **Asinxron Video Generatsiya (Background Workers):**
   * Video yaratish 2-3 daqiqa vaqt oladi. Platforma bu vaqtda qotib qolmaydi (Timeout bo'lmaydi). Topshiriq fonda (background thread) bajariladi, foydalanuvchi esa real vaqtda holatni kuzatib turadi.
4. **Xavfsiz Autentifikatsiya (Manual Auth):**
   * SHA-256 shifrlangan foydalanuvchi parollari va har bir foydalanuvchi uchun alohida sozlamalar (API Key, video formati va LLM modellari).
5. **Video Arxivi (History Tab):**
   * Avval yaratilgan barcha darslik videolarini saqlash va ularni istalgan vaqtda inline pleyerda tomosha qilish hamda yuklab olish.
6. **Uzbek Matematik TTS Normalizatori:**
   * Matematik formulalarni (masalan, `10^2` -> `o'nning kvadrati`, `π` -> `pi soni`) va fizik birliklarni o'zbek tilida to'g'ri talaffuz qilish uchun avtomatik kirill va so'z ko'rinishidagi o'girgich.

---

## 📂 Fayllar Strukturasi (Clean Code Directory)

* 🖥️ **`app.py`:** Kirish/ro'yxatdan o'tish portali, shaxsiy sozlamalar va videolar arxividan iborat boshqaruv paneli (Frontend/UI).
* 🗄️ **`src/database.py`:** Baza ulanish drayverlari (PostgreSQL / SQLite).
* 📋 **`src/models.py`:** SQL jadvallari (SQLAlchemy orqali yaratilgan users va tasks).
* ⚙️ **`src/tasks.py`:** Generatsiyani alohida thread orqali asinxron fonda ishga tushiruvchi modul.
* 🔑 **`src/auth.py`:** Foydalanuvchilar parolini tekshiruvchi va tarixni olib keluvchi yordamchi funksiyalar.
* 🧠 **`src/ai_pipeline.py`:** Masalani tahlil qiluvchi va slayd ssenariysini tuzuvchi AI boshqaruvchisi.
* 🎨 **`src/renderer.py`:** Slaydlarni andozaga joylab, Playwright orqali pixel-perfect PNG rasmlarga oluvchi modul.
* 🔊 **`src/tts_engine.py`:** Matnlarni Facebook MMS-TTS o'zbek ovozi orqali audio `.wav` ko'rinishida yozuvchi modul.
* 🎬 **`src/video_composer.py`:** Rasm va audiolarni FFmpeg orqali yig'ib yakuniy `.mp4` video yasovchi modul.

---

## 🛠️ Qanday ishga tushiriladi (How to Run)

### 1-qadam: Bog'liqliklarni o'rnatish
```bash
# Virtual muhit yarating va faollashtiring
python -m venv venv
venv\Scripts\activate  # Windows uchun
source venv/bin/activate  # Linux/Mac uchun

# Kerakli kutubxonalarni o'rnating
pip install -r requirements.txt
```

### 2-qadam: Playwright Chromium brauzerini o'rnatish
```bash
playwright install chromium
```

### 3-qadam: Atrof-muhit sozlamalari (`.env`)
Loyiha papkasida `.env` faylini yarating va quyidagilarni sozlang:
```env
GEMINI_API_KEY=Sening_Gemini_API_Studio_Kaliting

# MongoDB Atlas ulanish manzili (ixtiyoriy, bo'sh bo'lsa local SQLite ishlatiladi)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### 4-qadam: Ilovani ishga tushirish
```bash
streamlit run app.py
```

Brauzerda avtomatik ravishda `http://localhost:8501` sahifasi ochiladi. Ro'yxatdan o'ting va video darslik generatsiya qilishni boshlang!
