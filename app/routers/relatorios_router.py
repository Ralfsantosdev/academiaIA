from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, RoleEnum, Pagamento, Aluno
from app.auth import require_role

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])

@router.get("/financeiro")
def relatorio_financeiro(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    total_arrecadado = db.query(func.sum(Pagamento.valor)).filter(Pagamento.status == "Pago").scalar() or 0.0
    pagamentos_pendentes = db.query(func.sum(Pagamento.valor)).filter(Pagamento.status == "Pendente").scalar() or 0.0
    
    total_alunos = db.query(Aluno).count()
    
    return {
        "total_arrecadado": total_arrecadado,
        "pagamentos_pendentes": pagamentos_pendentes,
        "total_alunos": total_alunos
    }
