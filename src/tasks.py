import os
import logging
import threading
from src.database import db_update_task, db_get_task
from src.orchestrator import Orchestrator

logger = logging.getLogger(__name__)

def generate_video_background(task_id: str, image_path: str, text_prompt: str, user_config: dict):
    """Run orchestrator pipeline in the background and update task status in database."""
    # Update status to PROCESSING
    db_update_task(task_id, status="PROCESSING")

    try:
        # Load user settings into global config dynamically for thread safety
        import src.config as config
        # Bynara settings dynamic override
        config.USE_BYNARA = user_config.get("use_bynara", True)
        config.BYNARA_API_KEY = user_config.get("bynara_key", "") or os.getenv("BYNARA_API_KEY", "")
        config.BYNARA_BASE_URL = user_config.get("bynara_base_url", "https://router.bynara.id/v1")
        config.BYNARA_MODEL = user_config.get("bynara_model", "agnes-2.0-flash")
        
        # Instantiate Orchestrator and generate
        res_val = user_config.get("resolution", "Vertical (Shorts/Reels 9:16)")
        res = (1080, 1920) if res_val == "Vertical (Shorts/Reels 9:16)" else (1920, 1080)
        orchestrator = Orchestrator(resolution=res, user_config=user_config)
        video_path, storyboard = orchestrator.generate_lesson(
            image_path=image_path,
            text_prompt=text_prompt
        )
        
        # Update database with completed status and results
        db_update_task(
            task_id=task_id,
            status="COMPLETED",
            video_path=video_path,
            title=storyboard.title
        )
        logger.info(f"Background task {task_id} completed successfully.")
        
    except Exception as e:
        logger.exception(f"Background task failed for task_id {task_id}:")
        db_update_task(
            task_id=task_id,
            status="FAILED",
            error_message=str(e)
        )

def start_video_task(task_id: str, image_path: str, text_prompt: str, user_config: dict):
    """Start the video task asynchronously in a background thread to prevent UI blocks."""
    thread = threading.Thread(
        target=generate_video_background,
        args=(task_id, image_path, text_prompt, user_config)
    )
    thread.daemon = True
    thread.start()
