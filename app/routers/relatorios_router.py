from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, RoleEnum, Pagamento, Aluno, Plano
from app.auth import require_role
from datetime import datetime

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])

@router.get("/financeiro")
def relatorio_financeiro(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    total_arrecadado = db.query(func.sum(Pagamento.valor)).filter(Pagamento.status == "Pago", Pagamento.tenant_id == current_user.tenant_id).scalar() or 0.0
    pagamentos_pendentes = db.query(func.sum(Pagamento.valor)).filter(Pagamento.status == "Pendente", Pagamento.tenant_id == current_user.tenant_id).scalar() or 0.0
    
    total_alunos = db.query(Aluno).filter(Aluno.tenant_id == current_user.tenant_id).count()
    alunos_com_plano_ativo = db.query(Aluno).filter(Aluno.plano_ativo == 1, Aluno.tenant_id == current_user.tenant_id).count()
    alunos_inadimplentes = db.query(Aluno).filter(Aluno.faturas_atrasadas > 0, Aluno.tenant_id == current_user.tenant_id).count()
    
    return {
        "total_arrecadado": total_arrecadado,
        "pagamentos_pendentes": pagamentos_pendentes,
        "total_alunos": total_alunos,
        "alunos_com_plano_ativo": alunos_com_plano_ativo,
        "alunos_inadimplentes": alunos_inadimplentes
    }

@router.get("/inadimplentes")
def listar_inadimplentes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    alunos = db.query(Aluno).join(User).filter(
        (Aluno.faturas_atrasadas > 0) | 
        ((Aluno.plano_ativo == 0) & (Aluno.data_expiracao_plano != None)),
        Aluno.tenant_id == current_user.tenant_id
    ).order_by(Aluno.faturas_atrasadas.desc()).all()
    
    resultado = []
    for a in alunos:
        dias_expirado = None
        if a.data_expiracao_plano and a.data_expiracao_plano < datetime.utcnow():
            dias_expirado = (datetime.utcnow() - a.data_expiracao_plano).days
        resultado.append({
            "id": a.id,
            "nome": a.user.nome,
            "cpf": a.cpf,
            "telefone": a.telefone,
            "plano": a.plano,
            "plano_ativo": bool(a.plano_ativo),
            "faturas_atrasadas": a.faturas_atrasadas,
            "meses_matricula": a.meses_matricula,
            "data_expiracao_plano": a.data_expiracao_plano.isoformat() if a.data_expiracao_plano else None,
            "dias_expirado": dias_expirado,
            "objetivo": a.objetivo
        })
    return resultado
