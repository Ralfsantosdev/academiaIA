import logging
from fastapi import APIRouter, Request, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Aluno, Pagamento, Plano, Tenant, User, RoleEnum
from app.mercado_pago_service import mp_service
from app.whatsapp_service import whatsapp_service
from app.auth import require_role
from app.planos_assinatura import PLANOS_ASSINATURA, get_plano_info
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Integrações"])

@router.post("/mercadopago")
async def mercadopago_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        payload = await request.json()
    except:
        payload = {}
    
    client_ip = request.client.host if request.client else "desconhecido"
    logger.info("Notificação recebida de %s", client_ip)
    
    action = payload.get("action")
    payment_id = payload.get("data", {}).get("id")
    
    if action not in ("payment.created", "payment.updated"):
        logger.warning("Ação ignorada: %s", action)
        return {"status": "ignorado", "message": f"Ação não processada: {action}"}

    if not payment_id:
        return {"status": "ignorado", "message": "Sem payment_id"}

    result = mp_service.processar_notificacao(payment_id)

    if result["processado"] and result["status"] == "approved":
        external_ref = result.get("external_reference", "")
        valor = result.get("valor", 0)

        if external_ref.startswith("upgrade_"):
            parts = external_ref.split("_")
            if len(parts) >= 3:
                tenant_id = int(parts[1])
                plano_slug = "_".join(parts[2:])
                if plano_slug in PLANOS_ASSINATURA:
                    plano_info = get_plano_info(plano_slug)
                    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
                    if tenant:
                        tenant.plano_assinatura = plano_slug
                        tenant.max_alunos = plano_info["max_alunos"]
                        tenant.max_usuarios = plano_info["max_usuarios"]
                        tenant.is_active = 1
                        db.commit()
                        logger.info("Upgrade ativado: tenant %d -> %s", tenant_id, plano_slug)
        elif external_ref.startswith("payment_"):
            parts = external_ref.split("_", 2)
            if len(parts) == 3:
                _, tenant_id_str, aluno_cpf = parts
                try:
                    tenant_id = int(tenant_id_str)
                except ValueError:
                    logger.warning("tenant_id invalido em external_ref: %s", external_ref)
                    return {"status": "recebido", "message": "external_ref invalido"}

                aluno = db.query(Aluno).filter(
                    Aluno.cpf == aluno_cpf, Aluno.tenant_id == tenant_id
                ).first()
                if aluno:
                    pagamento = Pagamento(
                        aluno_id=aluno.id,
                        valor=valor,
                        status="Pago",
                        data_pagamento=datetime.utcnow(),
                        tenant_id=tenant_id,
                    )
                    db.add(pagamento)

                    aluno.faturas_atrasadas = 0
                    aluno.plano_ativo = 1
                    aluno.data_inicio_plano = datetime.utcnow()

                    if aluno.plano_id:
                        plano = db.query(Plano).filter(
                            Plano.id == aluno.plano_id, Plano.tenant_id == tenant_id
                        ).first()
                        if plano:
                            aluno.data_expiracao_plano = datetime.utcnow() + timedelta(days=30 * plano.duracao_meses)

                    db.commit()
                    logger.info("Plano ativado para aluno %s (tenant %d)", aluno_cpf, tenant_id)

    return {"status": "recebido", "message": "Pagamento processado em background"}

class ZapRequest(BaseModel):
    telefone: str
    mensagem: str

@router.post("/whatsapp/disparar")
def disparar_whatsapp(
    payload: ZapRequest,
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    resultado = whatsapp_service.enviar_mensagem(payload.telefone, payload.mensagem)
    return resultado

class CobrancaLoteRequest(BaseModel):
    alunos_ids: List[int]
    mensagem_personalizada: str = ""

@router.post("/whatsapp/cobranca-lote")
def cobranca_lote(
    payload: CobrancaLoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    alunos = db.query(Aluno).filter(Aluno.id.in_(payload.alunos_ids), Aluno.tenant_id == current_user.tenant_id).all()
    if not alunos:
        raise HTTPException(status_code=404, detail="Nenhum aluno encontrado")
    
    resultados = []
    for aluno in alunos:
        if not aluno.telefone:
            resultados.append({"id": aluno.id, "nome": aluno.user.nome, "status": "sem_telefone"})
            continue
        
        nome = aluno.user.nome.split()[0] if aluno.user.nome else "Aluno"
        
        if payload.mensagem_personalizada:
            mensagem = payload.mensagem_personalizada.replace("{nome}", nome).replace("{plano}", aluno.plano or "Seu plano")
        else:
            data_venc = aluno.data_expiracao_plano
            parte_venc = ""
            if data_venc:
                parte_venc = f"Seu plano venceu em {data_venc.strftime('%d/%m/%Y')}."
            mensagem = (
                f"Olá {nome}! ⏰\n"
                f"Identificamos que seu plano ({aluno.plano or 'Academia'}) está com pagamento pendente. "
                f"{parte_venc}\n"
                f"Para regularizar, entre em contato ou utilize o link de pagamento.\n"
                f"Não deixe seu treino para depois! 💪"
            )
        
        resultado = whatsapp_service.enviar_mensagem(aluno.telefone, mensagem)
        resultados.append({
            "id": aluno.id,
            "nome": aluno.user.nome,
            "telefone": aluno.telefone,
            "status": resultado.get("status")
        })
    
    return {
        "total_envios": len(resultados),
        "enviados": sum(1 for r in resultados if r["status"] in ("enviado", "simulado")),
        "sem_telefone": sum(1 for r in resultados if r["status"] == "sem_telefone"),
        "resultados": resultados
    }
