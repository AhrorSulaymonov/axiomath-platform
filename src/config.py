import os
from pathlib import Path
from dotenv import load_dotenv

# Project Root Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Output Directories
OUTPUT_DIR = BASE_DIR / "output"
MODELS_DIR = BASE_DIR / "models"
TTS_MODELS_DIR = MODELS_DIR / "tts"

# Ensure directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
TTS_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Ollama Settings
OLLAMA_BASE_URL = "http://localhost:11434"
VISION_MODEL = "qwen2.5vl:3b"
REASONING_MODEL = "qwen2.5:7b"
OLLAMA_VISION_MODEL = "qwen2.5vl:3b"
OLLAMA_REASONING_MODEL = "qwen2.5:7b"

# TTS Model Checkpoints (MMS-TTS)
TTS_MODELS = {
    "uz": "facebook/mms-tts-uzb-script_cyrillic",  # Cyrillic Uzbek works best for MMS
    "ru": "facebook/mms-tts-rus",
    "en": "facebook/mms-tts-eng"
}

# Video Resolution
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920  # Portrait (Shorts/Reels) format, perfect for mobile learning
# Or 1920, 1080 for Landscape. Let's make it configurable.
DEFAULT_RESOLUTION = (1080, 1920) 

# Bynara Router Settings
USE_BYNARA = True  # Enable Bynara by default
BYNARA_API_KEY = os.getenv("BYNARA_API_KEY", "sk-nry-NJwncvlj27WNnUmTFFxGlzHVF7aTq5ODBw7Wka1cPe4")
BYNARA_BASE_URL = os.getenv("BYNARA_BASE_URL", "https://router.bynara.id/v1")
BYNARA_MODEL = os.getenv("BYNARA_MODEL", "agnes-2.0-flash")


