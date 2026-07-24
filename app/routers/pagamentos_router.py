from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Pagamento, Aluno, User, RoleEnum
from app.auth import require_role

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

class PagamentoCreate(BaseModel):
    aluno_cpf: str
    valor: float
    status: str = "Pago"

class PagamentoResponse(BaseModel):
    id: int
    aluno_id: int
    aluno_nome: str
    valor: float
    data_pagamento: datetime
    status: str
    
    class Config:
        from_attributes = True

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_pagamento(
    pagamento_in: PagamentoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    aluno = db.query(Aluno).filter(Aluno.cpf == pagamento_in.aluno_cpf).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado com esse CPF")
    
    novo_pagamento = Pagamento(
        aluno_id=aluno.id,
        valor=pagamento_in.valor,
        status=pagamento_in.status
    )
    db.add(novo_pagamento)
    # Atualiza status do aluno (exemplo: zera faturas atrasadas se pago)
    if pagamento_in.status == "Pago":
        aluno.faturas_atrasadas = 0
    
    db.commit()
    db.refresh(novo_pagamento)
    return {"message": "Pagamento registrado com sucesso!"}

@router.get("/", response_model=List[PagamentoResponse])
def list_pagamentos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    pagamentos = db.query(Pagamento).join(Aluno).all()
    # Usamos list comprehension para formatar a saída com o nome do aluno
    resultado = []
    for p in pagamentos:
        resultado.append({
            "id": p.id,
            "aluno_id": p.aluno_id,
            "aluno_nome": p.aluno.user.nome if p.aluno and p.aluno.user else "Desconhecido",
            "valor": p.valor,
            "data_pagamento": p.data_pagamento,
            "status": p.status
        })
    return resultado

@router.get("/meus", response_model=List[PagamentoResponse])
def meus_pagamentos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ALUNO]))
):
    aluno = db.query(Aluno).filter(Aluno.user_id == current_user.id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Perfil de aluno não encontrado")
    
    pagamentos = db.query(Pagamento).filter(Pagamento.aluno_id == aluno.id).all()
    resultado = []
    for p in pagamentos:
        resultado.append({
            "id": p.id,
            "aluno_id": p.aluno_id,
            "aluno_nome": current_user.nome,
            "valor": p.valor,
            "data_pagamento": p.data_pagamento,
            "status": p.status
        })
    return resultado

class LinkPagamentoRequest(BaseModel):
    aluno_cpf: str
    nome_plano: str
    valor: float

@router.post("/gerar-link")
def gerar_link_assinatura(
    req: LinkPagamentoRequest,
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    from app.mercado_pago_service import mp_service
    link = mp_service.criar_link_pagamento(req.aluno_cpf, req.nome_plano, req.valor)
    return {"link": link}
