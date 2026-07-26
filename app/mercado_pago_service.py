import logging
import mercadopago
from app.config import settings

logger = logging.getLogger(__name__)

class MercadoPagoService:
    def __init__(self):
        token = settings.MERCADOPAGO_ACCESS_TOKEN
        if token and token != "seu-access-token-aqui":
            self.sdk = mercadopago.SDK(token)
            self._habilitado = True
        else:
            self.sdk = None
            self._habilitado = False

    @property
    def habilitado(self) -> bool:
        return self._habilitado

    def criar_link_pagamento(self, aluno_cpf: str, nome_plano: str, valor: float, external_reference: str = None) -> str:
        if not self._habilitado:
            return self._mock_link(aluno_cpf, nome_plano, valor)
        
        try:
            preference_data = {
                "items": [{
                    "title": f"Assinatura: {nome_plano}",
                    "quantity": 1,
                    "unit_price": float(valor),
                    "currency_id": "BRL"
                }],
                "payer": {"email": f"aluno_{aluno_cpf}@sandbox.com"},
                "back_urls": {
                    "success": f"{settings.FRONTEND_URL}/pagamento/sucesso",
                    "failure": f"{settings.FRONTEND_URL}/pagamento/erro",
                    "pending": f"{settings.FRONTEND_URL}/pagamento/pendente"
                },
                "auto_return": "approved",
                "external_reference": external_reference or aluno_cpf,
                "notification_url": f"{settings.API_BASE_URL}/api/v1/webhooks/mercadopago"
            }
            response = self.sdk.preference().create(preference_data)
            if response["status"] == 200 or response["status"] == 201:
                return response["response"]["init_point"]
        except Exception as e:
            logger.error("Erro ao criar preferência: %s", e)
        
        return self._mock_link(aluno_cpf, nome_plano, valor)
    
    def processar_notificacao(self, payment_id: int) -> dict:
        if not self._habilitado:
            return {"processado": False, "motivo": "Mercado Pago não configurado"}
        
        payment = self.sdk.payment().get(payment_id)
        if payment["status"] == 200:
            return {
                "processado": True,
                "status": payment["response"]["status"],
                "external_reference": payment["response"].get("external_reference", ""),
                "valor": payment["response"]["transaction_amount"]
            }
        return {"processado": False, "motivo": "Falha ao consultar pagamento"}
    
    def _mock_link(self, aluno_cpf: str, nome_plano: str, valor: float) -> str:
        return f"https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock-assinatura-{aluno_cpf}"

mp_service = MercadoPagoService()
