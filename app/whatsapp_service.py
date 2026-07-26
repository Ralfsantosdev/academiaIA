import requests
from app.config import settings

class WhatsAppService:
    def __init__(self):
        self.api_key = settings.WHATSAPP_API_KEY
        self.api_url = settings.WHATSAPP_API_URL

    def enviar_mensagem(self, telefone: str, mensagem: str) -> dict:
        if self.api_key and self.api_key != "sua-chave-evolution-api":
            try:
                response = requests.post(
                    self.api_url,
                    json={
                        "number": telefone,
                        "text": mensagem,
                        "delay": 1000
                    },
                    headers={"apikey": self.api_key},
                    timeout=10
                )
                if response.ok:
                    return {"status": "enviado", "telefone": telefone, "api": "evolution"}
                return {"status": "erro", "detalhe": response.text}
            except Exception as e:
                print(f"[WHATSAPP] Erro na API: {e}")
        
        # Fallback para log
        print(f"[WHATSAPP] Para: {telefone} | Mensagem: {mensagem}")
        return {"status": "simulado", "telefone": telefone, "simulado": True}

whatsapp_service = WhatsAppService()
