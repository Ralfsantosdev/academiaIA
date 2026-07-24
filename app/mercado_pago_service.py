import mercadopago
from app.config import settings

class MercadoPagoService:
    def __init__(self):
        self.sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

    def criar_link_pagamento(self, aluno_cpf: str, nome_plano: str, valor: float) -> str:
        # Mock do SDK para funcionar de imediato sem chave real, mas já estruturado
        """
        Lógica real:
        preference_data = {
            "items": [{"title": f"Assinatura: {nome_plano}", "quantity": 1, "unit_price": float(valor)}],
            "payer": {"email": f"aluno_{aluno_cpf}@sandbox.com"},
            "back_urls": {"success": "http://localhost:5173/sucesso"},
            "auto_return": "approved"
        }
        response = self.sdk.preference().create(preference_data)
        return response["response"]["init_point"]
        """
        return f"https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock-assinatura-{aluno_cpf}"
        
mp_service = MercadoPagoService()
