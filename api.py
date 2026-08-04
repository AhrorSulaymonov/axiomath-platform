import os
import shutil
import logging
import secrets
from pathlib import Path
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import jwt

from src.auth import (
    authenticate_user, register_user, get_user_settings, update_user_settings, 
    get_user_history, create_pending_task, get_user_info, deduct_credit, upgrade_user,
    update_password
)
from src.database import db_get_task, db_get_user, db_create_task, db_delete_task
from src.email_utils import generate_otp, send_verification_email
import time
from src.tasks import start_video_task
import src.config as config

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(username: str) -> str:
    payload = {
        "sub": username,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(username: str) -> str:
    payload = {
        "sub": username,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str, token_type: str = "access") -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != token_type:
            raise HTTPException(status_code=401, detail="Token turi noto'g'ri")
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token muddati tugagan")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token yaroqsiz")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Education AI API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str

class VerifyCode(BaseModel):
    username: str
    code: str
    password: str

class ForgotPassword(BaseModel):
    username: str

class ResetPassword(BaseModel):
    username: str
    code: str
    new_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserSettings(BaseModel):
    use_bynara: bool
    bynara_key: str
    bynara_base_url: str
    bynara_model: str
    resolution: str
    voice_type: str
    watermark_enabled: bool
    bg_music: str
    theme_style: str
    video_lang: str = "auto"  # 'auto', 'uz', 'en', 'ru'

@app.post("/api/auth/login")
def login(user: UserLogin):
    if authenticate_user(user.username, user.password):
        access_token = create_access_token(user.username)
        refresh_token = create_refresh_token(user.username)
        return {
            "success": True,
            "username": user.username,
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")


otp_cache = {}

@app.post("/api/auth/send-code")
async def send_code(user: UserRegister):
    # Validating if it's an email format (simple check)
    if "@" not in user.username:
        raise HTTPException(status_code=400, detail="Iltimos, yaroqli email manzilini kiriting!")
        
    # Check if user already exists
    from src.database import db_get_user
    if db_get_user(user.username):
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")
        
    otp = generate_otp()
    otp_cache[user.username] = {
        "code": otp,
        "expires": time.time() + 600 # 10 minutes
    }
    
    success, err_msg = await send_verification_email(user.username, otp)
    if success:
        return {"success": True, "message": "Tasdiqlash kodi yuborildi"}
    else:
        raise HTTPException(status_code=500, detail=f"Xat yuborishda xatolik yuz berdi: {err_msg}")

@app.post("/api/auth/verify-code")
def verify_code(data: VerifyCode):
    record = otp_cache.get(data.username)
    if not record:
        raise HTTPException(status_code=400, detail="Tasdiqlash kodi topilmadi yoki muddati tugagan")
        
    if time.time() > record["expires"]:
        del otp_cache[data.username]
        raise HTTPException(status_code=400, detail="Tasdiqlash kodining muddati tugagan")
        
    if record["code"] != data.code:
        raise HTTPException(status_code=400, detail="Tasdiqlash kodi noto'g'ri")
        
    # Register the user since code is correct
    if register_user(data.username, data.password):
        del otp_cache[data.username]
        access_token = create_access_token(data.username)
        refresh_token = create_refresh_token(data.username)
        return {
            "success": True,
            "username": data.username,
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    else:
        raise HTTPException(status_code=400, detail="Xatolik yuz berdi")

@app.post("/api/auth/forgot-password")
async def forgot_password(data: ForgotPassword):
    """Parolni tiklash uchun emailga OTP yuborish."""
    if "@" not in data.username:
        raise HTTPException(status_code=400, detail="Iltimos, yaroqli email manzilini kiriting!")
    user = db_get_user(data.username)
    if not user:
        raise HTTPException(status_code=404, detail="Bu email ro'yxatdan o'tmagan")
    otp = generate_otp()
    otp_cache[data.username] = {
        "code": otp,
        "expires": time.time() + 600,
        "type": "reset"
    }
    success, err_msg = await send_verification_email(data.username, otp)
    if success:
        return {"success": True, "message": "Parolni tiklash kodi emailga yuborildi"}
    raise HTTPException(status_code=500, detail=f"Email yuborishda xatolik: {err_msg}")

@app.post("/api/auth/reset-password")
def reset_password(data: ResetPassword):
    """OTP kodini tekshirib, parolni yangilash."""
    record = otp_cache.get(data.username)
    if not record or record.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Tiklash kodi topilmadi yoki muddati tugagan")
    if time.time() > record["expires"]:
        del otp_cache[data.username]
        raise HTTPException(status_code=400, detail="Tiklash kodining muddati tugagan")
    if record["code"] != data.code:
        raise HTTPException(status_code=400, detail="Tiklash kodi noto'g'ri")
    update_password(data.username, data.new_password)
    del otp_cache[data.username]
    return {"success": True, "message": "Parolingiz muvaffaqiyatli yangilandi!"}

@app.post("/api/auth/refresh")
def refresh_access_token(data: RefreshTokenRequest):
    """Refresh token orqali yangi access token olish."""
    username = verify_token(data.refresh_token, token_type="refresh")
    new_access_token = create_access_token(username)
    return {"success": True, "access_token": new_access_token}

@app.post("/api/auth/register")
def register(user: UserRegister):
    if register_user(user.username, user.password):
        return {"success": True, "username": user.username}
    raise HTTPException(status_code=400, detail="Username already taken")

@app.get("/api/users/{username}/info")
def get_info(username: str):
    info = get_user_info(username)
    if not info:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "username": info.get("username"),
        "plan_type": info.get("plan_type"),
        "credits_left": info.get("credits_left"),
        "settings": info.get("settings", {})
    }

@app.get("/api/users/{username}/settings")
def get_settings(username: str):
    return get_user_settings(username)

@app.put("/api/users/{username}/settings")
def update_settings(username: str, settings: UserSettings):
    update_user_settings(username, settings.model_dump())
    return {"success": True}

@app.post("/api/users/{username}/upgrade")
def upgrade_to_premium(username: str):
    upgrade_user(username)
    return {"success": True}

@app.get("/api/users/{username}/history")
def get_history(username: str):
    history = get_user_history(username)
    formatted = []
    for item in history:
        video_base64 = None
        if item.get("status") == "COMPLETED" and item.get("video_path") and os.path.exists(item["video_path"]):
            try:
                import base64
                with open(item["video_path"], "rb") as f:
                    video_base64 = base64.b64encode(f.read()).decode("utf-8")
            except Exception as e:
                logger.error(f"Error encoding video: {e}")
        
        formatted.append({
            "id": item.get("id"),
            "title": item.get("title", "Nomsiz Dars"),
            "timestamp": item.get("timestamp"),
            "prompt": item.get("prompt"),
            "status": item.get("status"),
            "error_message": item.get("error_message"),
            "video_base64": video_base64,
            "task_type": item.get("task_type", "video"),
            "text_content": item.get("text_content"),
            "messages": item.get("messages")
        })
    return formatted

@app.post("/api/tasks/generate")
async def generate_video(
    username: str = Form(...),
    prompt: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    voice_type: Optional[str] = Form(None),
    video_lang: Optional[str] = Form(None),
    resolution: Optional[str] = Form(None),
    theme_style: Optional[str] = Form(None),
    bynara_model: Optional[str] = Form(None)
):
    # Check subscription limits
    if not deduct_credit(username):
        raise HTTPException(
            status_code=403, 
            detail="Limit tugadi! Videolar yaratishda davom etish uchun Premium planni yoqing."
        )

    settings = get_user_settings(username)
    
    final_res = resolution if resolution else settings.get("resolution", "Vertical (Shorts/Reels 9:16)")
    config.DEFAULT_RESOLUTION = (1080, 1920) if final_res == "Vertical (Shorts/Reels 9:16)" else (1920, 1080)
    config.USE_BYNARA = settings.get("use_bynara", True)
    
    saved_key = settings.get("bynara_key", "")
    config.BYNARA_API_KEY = saved_key if saved_key.strip() else os.getenv("BYNARA_API_KEY", "")
    config.BYNARA_BASE_URL = settings.get("bynara_base_url", "https://router.bynara.id/v1")
    
    final_model = bynara_model if bynara_model else settings.get("bynara_model", "agnes-2.0-flash")
    if final_model == "gemini-1.5-flash":
        final_model = "gemini-3.5-flash-lite"
    config.BYNARA_MODEL = final_model

    temp_image_path = None
    if image:
        temp_dir = Path("output/temp")
        temp_dir.mkdir(parents=True, exist_ok=True)
        temp_image_path = str(temp_dir / image.filename)
        with open(temp_image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    final_prompt = prompt.strip() if prompt and prompt.strip() else "Rasm orqali kiritilgan masala"
    
    task_id = create_pending_task(
        username=username,
        prompt=final_prompt,
        image_path=temp_image_path
    )

    if not task_id:
        raise HTTPException(status_code=500, detail="Failed to create task")

    user_config = {
        "use_bynara": config.USE_BYNARA,
        "bynara_key": config.BYNARA_API_KEY,
        "bynara_base_url": config.BYNARA_BASE_URL,
        "bynara_model": final_model,
        "resolution": final_res,
        "voice_type": voice_type if voice_type else settings.get("voice_type", "Erkak"),
        "watermark_enabled": settings.get("watermark_enabled", True),
        "theme_style": theme_style if theme_style else settings.get("theme_style", "light"),
        "bg_music": settings.get("bg_music", "none"),
        "video_lang": video_lang if video_lang else settings.get("video_lang", "auto"),
    }

    start_video_task(task_id, temp_image_path, final_prompt, user_config)
    
    return {"success": True, "task_id": task_id}

@app.post("/api/tasks/analyze-text")
async def analyze_text(
    username: str = Form(...),
    prompt: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    task_id: Optional[str] = Form(None),
    history: Optional[str] = Form(None)
):
    from src.ai_pipeline import AIPipeline
    if not deduct_credit(username):
        raise HTTPException(
            status_code=403, 
            detail="Limit tugadi! Videolar yoki tahlillar yaratishda davom etish uchun Premium planni yoqing."
        )

    settings = get_user_settings(username)
    config.USE_BYNARA = settings.get("use_bynara", True)
    saved_key = settings.get("bynara_key", "")
    config.BYNARA_API_KEY = saved_key if saved_key.strip() else os.getenv("BYNARA_API_KEY", "")
    config.BYNARA_BASE_URL = settings.get("bynara_base_url", "https://router.bynara.id/v1")
    config.BYNARA_MODEL = settings.get("bynara_model", "agnes-2.0-flash")

    temp_image_path = None
    if image:
        temp_dir = Path("output/temp")
        temp_dir.mkdir(parents=True, exist_ok=True)
        temp_image_path = str(temp_dir / image.filename)
        with open(temp_image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    final_prompt = prompt.strip() if prompt and prompt.strip() else "Rasm orqali kiritilgan masala"
    
    import json
    messages_list = []
    if history:
        try:
            messages_list = json.loads(history)
        except Exception:
            pass
            
    try:
        pipeline = AIPipeline()
        text_result, yt_videos = pipeline.generate_text_analysis(final_prompt, temp_image_path, messages_list)
        
        # Append new interaction to messages_list
        messages_list.append({"role": "user", "content": final_prompt})
        messages_list.append({"role": "assistant", "content": text_result, "yt_videos": yt_videos})
        
        # Save to history
        from src.database import db_update_task, db_get_task
        is_existing = False
        if task_id and len(task_id) == 24:
            existing = db_get_task(task_id)
            if existing and existing.get("username") == username:
                is_existing = True
                
        if not is_existing:
            task_id = db_create_task(
                username=username,
                prompt=final_prompt,
                image_path=temp_image_path,
                status="COMPLETED",
                task_type="text"
            )
        
        db_update_task(task_id, "COMPLETED", text_content=text_result, title="AI Tahlil", yt_videos=yt_videos, messages=messages_list)
        
        return {"success": True, "task_id": task_id, "text": text_result, "yt_videos": yt_videos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, username: str):
    success = db_delete_task(task_id, username)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")
    return {"success": True}

@app.get("/api/tasks/{task_id}")
def get_task_status(task_id: str):
    task = db_get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    response = {
        "id": task["id"],
        "status": task["status"],
        "title": task.get("title"),
        "error_message": task.get("error_message"),
        "video_base64": None
    }
    
    if task["status"] == "COMPLETED" and task.get("video_path") and os.path.exists(task["video_path"]):
        import base64
        with open(task["video_path"], "rb") as f:
            response["video_base64"] = base64.b64encode(f.read()).decode("utf-8")
            
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
