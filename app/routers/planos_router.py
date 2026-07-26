from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models import Plano, User, RoleEnum
from app.auth import require_role

router = APIRouter(prefix="/planos", tags=["Planos"])

class PlanoCreate(BaseModel):
    nome: str
    valor: float
    duracao_meses: int

class PlanoResponse(BaseModel):
    id: int
    nome: str
    valor: float
    duracao_meses: int
    
    class Config:
        from_attributes = True

@router.post("/", response_model=PlanoResponse, status_code=status.HTTP_201_CREATED)
def create_plano(
    plano_in: PlanoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    plano_existente = db.query(Plano).filter(Plano.nome == plano_in.nome, Plano.tenant_id == current_user.tenant_id).first()
    if plano_existente:
        raise HTTPException(status_code=400, detail="Plano já existe")
    
    novo_plano = Plano(**plano_in.model_dump(), tenant_id=current_user.tenant_id)
    db.add(novo_plano)
    db.commit()
    db.refresh(novo_plano)
    return novo_plano

@router.get("/", response_model=List[PlanoResponse])
def list_planos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP, RoleEnum.ALUNO]))
):
    return db.query(Plano).filter(Plano.tenant_id == current_user.tenant_id).all()

@router.delete("/{plano_id}")
def delete_plano(
    plano_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    plano = db.query(Plano).filter(Plano.id == plano_id, Plano.tenant_id == current_user.tenant_id).first()
    if not plano:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    
    db.delete(plano)
    db.commit()
    return {"message": "Plano excluído com sucesso"}
