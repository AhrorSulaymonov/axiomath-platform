import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import random
import asyncio
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def _send_email_sync(to_email: str, subject: str, html_body: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.error("SMTP credentials not found in environment")
        return False, "SMTP credentials not found in environment"
        
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"Education AI <{SMTP_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Connect to Gmail SMTP
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD.replace(" ", "")) # Remove spaces from app password
        
        # Send
        server.send_message(msg)
        server.quit()
        return True, None
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")
        return False, str(e)

async def send_verification_email(to_email: str, otp: str):
    subject = "Tizimga kirish uchun tasdiqlash kodi - Education AI"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a; text-align: center;">Education AI</h2>
        <p style="color: #475569; font-size: 16px;">Assalomu alaykum!</p>
        <p style="color: #475569; font-size: 16px;">Siz ro'yxatdan o'tish uchun quyidagi tasdiqlash kodini kiritishingiz kerak:</p>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 32px; letter-spacing: 5px;">{otp}</h1>
        </div>
        <p style="color: #475569; font-size: 14px;">Ushbu kod 10 daqiqa davomida yaroqli. Agar siz ro'yxatdan o'tishga harakat qilmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Education AI platformasi.</p>
    </div>
    """
    
    return await asyncio.to_thread(_send_email_sync, to_email, subject, html_body)
