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

if not settings.SECRET_KEY or settings.SECRET_KEY == "your-secret-key-change-this-in-production":
    raise ValueError(
        "SECRET_KEY não configurada. Defina uma chave segura no .env ou variável de ambiente."
    )
