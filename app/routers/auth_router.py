import time
from collections import defaultdict
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Tenant
from app.auth import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_current_tenant

_login_attempts = defaultdict(list)

def _check_rate_limit(ip: str):
    now = time.time()
    window = 60
    max_attempts = 5
    attempts = [t for t in _login_attempts[ip] if now - t < window]
    _login_attempts[ip] = attempts
    if len(attempts) >= max_attempts:
        raise HTTPException(status_code=429, detail="Muitas tentativas. Aguarde 60 segundos.")
    _login_attempts[ip].append(now)

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db), request: Request = None):
    _check_rate_limit(request.client.host)
    username_parts = form_data.username.split(":")
    if len(username_parts) == 2:
        subdomain, actual_username = username_parts
    else:
        subdomain = None
        actual_username = form_data.username
    if subdomain:
        tenant = db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
        if not tenant:
            raise HTTPException(status_code=401, detail="Academia não encontrada")
        tenant_id = tenant.id
    else:
        tenant_id = None
    query = db.query(User).filter(User.username == actual_username)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    user = query.first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "tenant_id": user.tenant_id},
        expires_delta=access_token_expires
    )
    tenant_info = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    is_trial = tenant_info and tenant_info.plano_assinatura == "trial"
    trial_days_left = 0
    if is_trial and tenant_info and tenant_info.trial_ends_at:
        from datetime import datetime
        trial_days_left = max((tenant_info.trial_ends_at - datetime.utcnow()).days, 0)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "nome": user.nome,
            "role": user.role,
            "tenant_id": user.tenant_id
        },
        "tenant": {
            "nome": tenant_info.nome if tenant_info else None,
            "subdomain": tenant_info.subdomain if tenant_info else None,
            "plano": tenant_info.plano_assinatura if tenant_info else None,
            "is_trial": is_trial,
            "trial_days_left": trial_days_left
        } if tenant_info else None
    }

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "nome": current_user.nome,
        "role": current_user.role,
        "tenant_id": current_user.tenant_id
    }
