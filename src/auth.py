import hashlib
from typing import Dict, Any, List
from src.database import (
    db_register_user,
    db_get_user,
    db_update_user_settings,
    db_create_task,
    db_update_task,
    db_get_user_history,
    db_deduct_credit,
    db_upgrade_to_premium,
    db_update_password
)

def hash_password(password: str) -> str:
    """Hash password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(username: str, password: str) -> bool:
    """Register a new user in the database."""
    hashed = hash_password(password)
    return db_register_user(username, hashed)

def authenticate_user(username: str, password: str) -> bool:
    """Authenticate a user using their username and password."""
    hashed = hash_password(password)
    user = db_get_user(username)
    if not user:
        return False
    return user["password_hash"] == hashed

def update_password(username: str, new_password: str) -> None:
    """Update user's password."""
    hashed = hash_password(new_password)
    db_update_password(username, hashed)

def get_user_info(username: str) -> Dict[str, Any]:
    """Get full user info including plan."""
    return db_get_user(username)

def update_user_settings(username: str, settings: Dict[str, Any]) -> None:
    """Update settings for a specific user."""
    db_update_user_settings(username, settings)

def get_user_settings(username: str) -> Dict[str, Any]:
    """Retrieve settings for a user."""
    user = db_get_user(username)
    if user:
        return user.get("settings", {})
    return {}

def deduct_credit(username: str) -> bool:
    """Deduct credit if user is not premium."""
    return db_deduct_credit(username)

def upgrade_user(username: str) -> None:
    """Upgrade user to Premium plan."""
    db_upgrade_to_premium(username)

def create_pending_task(username: str, prompt: str, image_path: str = None) -> str:
    """Create a PENDING task in the database for asynchronous generation."""
    return db_create_task(username, prompt, image_path, status="PENDING")

def add_user_video(username: str, title: str, prompt: str, video_path: str) -> str:
    """Create a new completed task row in the database."""
    task_id = db_create_task(username, prompt, None, status="COMPLETED")
    db_update_task(task_id, status="COMPLETED", video_path=video_path, title=title)
    return task_id

def get_user_history(username: str) -> List[Dict[str, Any]]:
    """Retrieve all video tasks for a user, sorted by date."""
    return db_get_user_history(username)
