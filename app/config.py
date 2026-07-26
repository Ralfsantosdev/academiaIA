import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Academia IA Engine"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Chaves de API do .env
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MERCADOPAGO_ACCESS_TOKEN: str = os.getenv("MERCADOPAGO_ACCESS_TOKEN", "")
    WHATSAPP_API_KEY: str = os.getenv("WHATSAPP_API_KEY", "")
    WHATSAPP_API_URL: str = os.getenv("WHATSAPP_API_URL", "http://localhost:8080")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    
    # URLs do sistema
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")

settings = Settings()

_weak_keys = [
    "your-secret-key-change-this-in-production",
    "sua-chave-secreta-jwt-aqui",
    "nova-chave-secreta-jwt-super-segura-12345",
]
if not settings.SECRET_KEY or settings.SECRET_KEY in _weak_keys or len(settings.SECRET_KEY) < 16:
    raise ValueError(
        "SECRET_KEY fraca ou não configurada. Defina uma chave segura (mín. 16 caracteres) "
        "no .env ou nas variáveis de ambiente."
    )
