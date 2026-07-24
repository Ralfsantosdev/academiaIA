class WhatsAppService:
    def enviar_mensagem(self, telefone: str, mensagem: str) -> dict:
        # Aqui conectaria com a Evolution API, Z-API, Baileys, etc.
        # Ex: requests.post("http://api-whatsapp/sendText", json={"number": telefone, "text": mensagem})
        
        # Simulação para log do servidor
        print(f"=====================================")
        print(f"[WHATSAPP ZAP-BOT] Enviando mensagem...")
        print(f"Para: {telefone}")
        print(f"Mensagem: {mensagem}")
        print(f"=====================================")
        
        return {"status": "enviado", "telefone": telefone, "simulado": True}

whatsapp_service = WhatsAppService()
