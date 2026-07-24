from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import User, Aluno, RoleEnum
from app.auth import require_role, get_password_hash

router = APIRouter(prefix="/alunos", tags=["Gestão de Alunos"])

class AlunoCreateUpdate(BaseModel):
    nome: str
    cpf: str
    idade: int
    telefone: Optional[str] = None
    plano: Optional[str] = None
    objetivo: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_aluno(
    aluno_in: AlunoCreateUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    # Verifica se já existe um aluno com esse CPF
    existing_aluno = db.query(Aluno).filter(Aluno.cpf == aluno_in.cpf).first()
    if existing_aluno:
        raise HTTPException(status_code=400, detail="Já existe um aluno com este CPF.")
    
    # Cria o User associado ao aluno (para ele poder logar depois)
    # Usa o CPF (sem pontuação) como username padrão e "123" como senha padrão
    clean_cpf = ''.join(filter(str.isdigit, aluno_in.cpf))
    
    new_user = User(
        username=f"aluno_{clean_cpf}",
        hashed_password=get_password_hash("123"),
        nome=aluno_in.nome,
        role=RoleEnum.ALUNO
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Cria o Perfil de Aluno
    new_aluno = Aluno(
        user_id=new_user.id,
        cpf=aluno_in.cpf,
        telefone=aluno_in.telefone,
        plano=aluno_in.plano,
        objetivo=aluno_in.objetivo,
        idade=aluno_in.idade,
        frequencia_media=0.0,
        dias_ausente=0,
        meses_matricula=0,
        faturas_atrasadas=0
    )
    db.add(new_aluno)
    db.commit()
    db.refresh(new_aluno)
    
    return {"message": "Aluno cadastrado com sucesso", "aluno_id": new_aluno.id}

@router.get("/busca/{termo}")
def get_aluno(
    termo: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP, RoleEnum.PROF]))
):
    # Tenta buscar por CPF exato ou por parte do Nome
    aluno = db.query(Aluno).join(User).filter(
        (Aluno.cpf == termo) | (User.nome.ilike(f"%{termo}%"))
    ).first()
    
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    return {
        "id": aluno.id,
        "nome": aluno.user.nome,
        "cpf": aluno.cpf,
        "idade": aluno.idade,
        "telefone": aluno.telefone,
        "plano": aluno.plano,
        "objetivo": aluno.objetivo
    }

@router.put("/{cpf}")
def update_aluno(
    cpf: str, 
    aluno_in: AlunoCreateUpdate,
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    aluno = db.query(Aluno).filter(Aluno.cpf == cpf).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Atualiza dados de User
    aluno.user.nome = aluno_in.nome
    
    # Atualiza dados de Aluno
    aluno.idade = aluno_in.idade
    aluno.telefone = aluno_in.telefone
    aluno.plano = aluno_in.plano
    aluno.objetivo = aluno_in.objetivo
    
    db.commit()
    return {"message": "Cadastro atualizado com sucesso"}

@router.get("/all")
def get_all_alunos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP, RoleEnum.PROF]))
):
    alunos = db.query(Aluno).all()
    aluno_list = []
    for aluno in alunos:
        aluno_list.append({
            "id": aluno.id,
            "nome": aluno.user.nome,
            "cpf": aluno.cpf,
            "idade": aluno.idade,
            "telefone": aluno.telefone,
            "plano": aluno.plano,
            "objetivo": aluno.objetivo,
            "frequencia_media": aluno.frequencia_media,
            "dias_ausente": aluno.dias_ausente,
            "meses_matricula": aluno.meses_matricula,
            "faturas_atrasadas": aluno.faturas_atrasadas
        })
    return aluno_list

@router.delete("/{cpf}")
def delete_aluno(
    cpf: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    aluno = db.query(Aluno).filter(Aluno.cpf == cpf).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    # Obtém o user_id antes de excluir
    user_id = aluno.user_id

    # Deleta o aluno
    db.delete(aluno)
    db.commit()
    
    # Verifica se o user pode ser excluído (não é Admin, Recep ou Prof)
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.role == RoleEnum.ALUNO:
            # Verifica se o user tem outros registros (além do Aluno que acabamos de excluir)
            other_alunos = db.query(Aluno).filter(Aluno.user_id == user.id).count()
            if other_alunos == 0:
                db.delete(user)
                db.commit()
    
    return {"message": "Aluno excluído com sucesso"}
