import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    use_gemini = Column(Boolean, default=False)
    gemini_key = Column(String, default="")
    gemini_model = Column(String, default="gemini-2.5-flash-lite")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tasks = relationship("LessonTask", back_populates="user", cascade="all, delete-orphan")

class LessonTask(Base):
    __tablename__ = "lesson_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    video_path = Column(String, nullable=True)
    title = Column(String, default="Nomsiz Dars")
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tasks")
