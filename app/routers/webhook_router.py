from fastapi import APIRouter, Request, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.whatsapp_service import whatsapp_service
from pydantic import BaseModel

router = APIRouter(prefix="/webhooks", tags=["Integrações"])

@router.post("/mercadopago")
async def mercadopago_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Simula recebimento de webhook do Mercado Pago de pagamento aprovado
    try:
        payload = await request.json()
    except:
        payload = {}
        
    print(f"[WEBHOOK MP] Atualização de pagamento recebida: {payload}")
    # Lógica real: processar o ID do pagamento, atualizar a tabela Pagamento para 'Pago'
    
    return {"status": "recebido", "message": "Pagamento processado em background"}

class ZapRequest(BaseModel):
    telefone: str
    mensagem: str

@router.post("/whatsapp/disparar")
def disparar_whatsapp(payload: ZapRequest):
    # Endpoint para disparar mensagem de retenção / cobrança
    resultado = whatsapp_service.enviar_mensagem(payload.telefone, payload.mensagem)
    return resultado
