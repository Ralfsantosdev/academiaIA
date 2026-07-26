from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
import re
from app.database import get_db
from app.models import Tenant, User, RoleEnum, Aluno
from app.auth import get_password_hash, get_current_user, get_current_tenant, require_role
from app.mercado_pago_service import mp_service
from app.planos_assinatura import PLANOS_ASSINATURA, get_plano_info
from datetime import datetime, timedelta

router = APIRouter()

class TenantRegister(BaseModel):
    nome_academia: str
    subdomain: str
    admin_nome: str
    admin_username: str
    admin_password: str

    @validator("subdomain")
    def validate_subdomain(cls, v):
        if not re.match(r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$', v):
            raise ValueError("Subdomínio deve conter apenas letras minúsculas, números e hífens")
        if len(v) < 3 or len(v) > 50:
            raise ValueError("Subdomínio deve ter entre 3 e 50 caracteres")
        return v

class UpgradeRequest(BaseModel):
    plano_slug: str

def _auto_downgrade_if_expired(tenant: Tenant, db: Session):
    if tenant.plano_assinatura != "trial":
        return
    if tenant.trial_ends_at and datetime.utcnow() > tenant.trial_ends_at:
        free = get_plano_info("free")
        tenant.plano_assinatura = "free"
        tenant.max_alunos = free["max_alunos"]
        tenant.max_usuarios = free["max_usuarios"]
        db.commit()

@router.post("/tenants/registrar")
def registrar_tenant(data: TenantRegister, db: Session = Depends(get_db)):
    existing = db.query(Tenant).filter(Tenant.subdomain == data.subdomain).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subdomínio já está em uso")
    now = datetime.utcnow()
    tenant = Tenant(
        nome=data.nome_academia,
        subdomain=data.subdomain,
        trial_ends_at=now + timedelta(days=30),
        max_alunos=get_plano_info("trial")["max_alunos"],
        max_usuarios=get_plano_info("trial")["max_usuarios"],
        plano_assinatura="trial",
        is_active=1,
        created_at=now
    )
    db.add(tenant)
    db.flush()
    admin_user = User(
        tenant_id=tenant.id,
        username=data.admin_username,
        hashed_password=get_password_hash(data.admin_password),
        role=RoleEnum.ADMIN,
        nome=data.admin_nome
    )
    db.add(admin_user)
    db.commit()
    db.refresh(tenant)
    return {
        "mensagem": "Conta criada com sucesso! Faça login para começar.",
        "tenant": {
            "id": tenant.id,
            "nome": tenant.nome,
            "subdomain": tenant.subdomain,
            "plano": "trial",
            "trial_ate": tenant.trial_ends_at.isoformat() if tenant.trial_ends_at else None
        }
    }

@router.get("/tenants/planos")
def listar_planos():
    return [
        {"slug": slug, **info}
        for slug, info in PLANOS_ASSINATURA.items()
    ]

@router.get("/tenants/status")
def status_tenant(
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    _auto_downgrade_if_expired(current_tenant, db)
    now = datetime.utcnow()
    plano_info = get_plano_info(current_tenant.plano_assinatura)
    is_trial = current_tenant.plano_assinatura == "trial"
    trial_days_left = 0
    if is_trial and current_tenant.trial_ends_at:
        trial_days_left = (current_tenant.trial_ends_at - now).days
    elif current_tenant.plano_assinatura == "free":
        trial_days_left = 0
    aluno_count = db.query(Aluno).filter(Aluno.tenant_id == current_tenant.id).count()
    user_count = db.query(User).filter(User.tenant_id == current_tenant.id).count()
    return {
        "tenant_id": current_tenant.id,
        "nome": current_tenant.nome,
        "plano": current_tenant.plano_assinatura,
        "plano_nome": plano_info["nome"],
        "preco_mensal": plano_info["preco_mensal"],
        "is_trial": is_trial,
        "trial_expired": is_trial and trial_days_left <= 0,
        "trial_days_left": max(trial_days_left, 0),
        "max_alunos": current_tenant.max_alunos,
        "max_usuarios": current_tenant.max_usuarios,
        "alunos_cadastrados": aluno_count,
        "usuarios_cadastrados": user_count,
        "is_active": current_tenant.is_active
    }

@router.get("/tenants/limites")
def verificar_limites(
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    _auto_downgrade_if_expired(current_tenant, db)
    aluno_count = db.query(Aluno).filter(Aluno.tenant_id == current_tenant.id).count()
    user_count = db.query(User).filter(User.tenant_id == current_tenant.id).count()
    return {
        "alunos": {"atual": aluno_count, "maximo": current_tenant.max_alunos},
        "usuarios": {"atual": user_count, "maximo": current_tenant.max_usuarios},
        "atingiu_limite_alunos": aluno_count >= current_tenant.max_alunos,
        "atingiu_limite_usuarios": user_count >= current_tenant.max_usuarios
    }

@router.post("/tenants/upgrade")
def upgrade_plano(
    data: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Só o admin pode fazer upgrade")
    if data.plano_slug not in PLANOS_ASSINATURA or data.plano_slug in ("trial", "free"):
        raise HTTPException(status_code=400, detail="Plano inválido")
    plano_info = get_plano_info(data.plano_slug)
    link = mp_service.criar_link_pagamento(
        aluno_cpf=f"tenant_{current_tenant.id}",
        nome_plano=plano_info["nome"],
        valor=plano_info["preco_mensal"],
        external_reference=f"upgrade_{current_tenant.id}_{data.plano_slug}"
    )
    return {
        "link_pagamento": link,
        "plano": data.plano_slug,
        "valor": plano_info["preco_mensal"],
        "mensagem": "Após o pagamento, o plano será ativado automaticamente."
    }

@router.post("/tenants/ativar-upgrade")
def ativar_upgrade(
    external_reference: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    if not external_reference.startswith("upgrade_"):
        raise HTTPException(status_code=400, detail="Referência inválida")
    parts = external_reference.split("_")
    if len(parts) < 3:
        raise HTTPException(status_code=400, detail="Formato inválido")
    tenant_id = int(parts[1])
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para ativar upgrade de outro tenant")
    plano_slug = "_".join(parts[2:])
    if plano_slug not in PLANOS_ASSINATURA:
        raise HTTPException(status_code=400, detail="Plano inválido")
    plano_info = get_plano_info(plano_slug)
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    tenant.plano_assinatura = plano_slug
    tenant.max_alunos = plano_info["max_alunos"]
    tenant.max_usuarios = plano_info["max_usuarios"]
    tenant.is_active = 1
    db.commit()
    return {"mensagem": f"Plano {plano_info['nome']} ativado com sucesso!"}

def verificar_bloqueio_trial(current_tenant: Tenant = Depends(get_current_tenant)):
    if current_tenant.plano_assinatura == "trial":
        if current_tenant.trial_ends_at and datetime.utcnow() > current_tenant.trial_ends_at:
            raise HTTPException(
                status_code=402,
                detail="Seu período de teste expirou. Faça upgrade para continuar usando o sistema.",
                headers={"X-Upgrade-Needed": "true"}
            )
    elif current_tenant.plano_assinatura == "free":
        pass
    return current_tenant