import os
import datetime
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

# Connect MongoDB
MONGODB_URI = os.getenv("MONGODB_URI", "")
use_mongodb = True
mongo_client = None
mongo_db = None

if MONGODB_URI:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        mongo_client.server_info()
        mongo_db = mongo_client.get_database("education_ai")
        logger.info("MongoDB Atlas ma'lumotlar bazasiga muvaffaqiyatli ulanildi! 🍃")
    except Exception as e:
        logger.error(f"MongoDB Atlas-ga ulanib bo'lmadi: {e}")
        raise Exception(f"MongoDB connection failed: {e}")
else:
    logger.error("MONGODB_URI topilmadi! .env faylini tekshiring.")
    raise Exception("MONGODB_URI topilmadi! .env faylini tekshiring.")

# Helper DB methods
def db_register_user(username: str, password_hash: str) -> bool:
    try:
        users_col = mongo_db["users"]
        if users_col.find_one({"username": username}):
            return False
        users_col.insert_one({
            "username": username,
            "password_hash": password_hash,
            "plan_type": "FREE",
            "credits_left": 3,
            "settings": {
                "use_gemini": False,
                "gemini_key": "",
                "gemini_model": "gemini-2.5-flash-lite",
                "use_bynara": True,
                "bynara_key": "",
                "bynara_model": "agnes-2.0-flash",
                "bynara_base_url": "https://router.bynara.id/v1",
                "resolution": "Vertical (Shorts/Reels 9:16)",
                "voice_type": "Erkak",
                "watermark_enabled": True,
                "bg_music": "none",
                "theme_style": "light",
                "video_lang": "auto"
            }
        })
        return True
    except Exception as e:
        logger.error(f"MongoDB register failed: {e}")
        return False

def db_get_user(username: str) -> Dict[str, Any]:
    users_col = mongo_db["users"]
    user = users_col.find_one({"username": username})
    if user:
        user["_id"] = str(user["_id"])
        return user
    return None

def db_update_user_settings(username: str, settings: Dict[str, Any]) -> None:
    users_col = mongo_db["users"]
    set_payload = {}
    for k, v in settings.items():
        if k in ["use_gemini", "gemini_key", "gemini_model", "use_bynara", "bynara_key", "bynara_model", "bynara_base_url", "resolution", "voice_type", "watermark_enabled", "bg_music", "theme_style", "video_lang"]:
            set_payload[f"settings.{k}"] = v
    
    # Prevent overriding plan type through settings
    if set_payload:
        users_col.update_one(
            {"username": username},
            {"$set": set_payload}
        )

def db_update_password(username: str, new_password_hash: str) -> None:
    """Foydalanuvchining parolini yangilash."""
    users_col = mongo_db["users"]
    users_col.update_one(
        {"username": username},
        {"$set": {"password_hash": new_password_hash}}
    )

def db_deduct_credit(username: str) -> bool:
    users_col = mongo_db["users"]
    user = users_col.find_one({"username": username})
    if not user: return False
    
    if user.get("plan_type") == "PREMIUM":
        return True # Unlimited
        
    credits = user.get("credits_left", 0)
    if credits > 0:
        users_col.update_one({"username": username}, {"$inc": {"credits_left": -1}})
        return True
    return False

def db_upgrade_to_premium(username: str) -> None:
    users_col = mongo_db["users"]
    users_col.update_one(
        {"username": username},
        {"$set": {"plan_type": "PREMIUM", "settings.watermark_enabled": False}}
    )

def db_create_task(username: str, prompt: str, image_path: str = None, status: str = "PENDING", task_type: str = "video") -> str:
    timestamp_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    tasks_col = mongo_db["lesson_tasks"]
    res = tasks_col.insert_one({
        "username": username,
        "prompt": prompt,
        "image_path": image_path,
        "status": status,
        "task_type": task_type,
        "video_path": None,
        "text_content": None,
        "yt_videos": [],
        "title": "Nomsiz Dars" if task_type == "video" else "AI Tahlil",
        "error_message": None,
        "created_at": timestamp_str
    })
    return str(res.inserted_id)

def db_update_task(task_id: str, status: str, video_path: str = None, title: str = None, error_message: str = None, text_content: str = None, yt_videos: list = None) -> None:
    from bson import ObjectId
    tasks_col = mongo_db["lesson_tasks"]
    update_fields = {"status": status}
    if video_path is not None:
        update_fields["video_path"] = video_path
    if title is not None:
        update_fields["title"] = title
    if error_message is not None:
        update_fields["error_message"] = error_message
    if text_content is not None:
        update_fields["text_content"] = text_content
    if yt_videos is not None:
        update_fields["yt_videos"] = yt_videos
        
    tasks_col.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_fields}
    )

def db_get_task(task_id: str) -> Dict[str, Any]:
    from bson import ObjectId
    tasks_col = mongo_db["lesson_tasks"]
    try:
        task = tasks_col.find_one({"_id": ObjectId(task_id)})
        if task:
            task["id"] = str(task["_id"])
            return task
    except Exception:
        return None
    return None

def db_get_user_history(username: str) -> List[Dict[str, Any]]:
    tasks_col = mongo_db["lesson_tasks"]
    tasks = tasks_col.find({"username": username}).sort("_id", -1)
    history = []
    for task in tasks:
        history.append({
            "id": str(task["_id"]),
            "timestamp": task.get("created_at"),
            "title": task.get("title", "Nomsiz Dars"),
            "prompt": task.get("prompt"),
            "video_path": task.get("video_path"),
            "status": task.get("status"),
            "error_message": task.get("error_message"),
            "task_type": task.get("task_type", "video"),
            "text_content": task.get("text_content"),
            "yt_videos": task.get("yt_videos", [])
        })
    return history

def db_delete_task(task_id: str, username: str) -> bool:
    from bson import ObjectId
    tasks_col = mongo_db["lesson_tasks"]
    res = tasks_col.delete_one({"_id": ObjectId(task_id), "username": username})
    return res.deleted_count > 0
