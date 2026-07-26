import secrets
import os
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import User, Aluno, Plano, RoleEnum
from app.auth import require_role, get_password_hash
from datetime import datetime, timedelta
import io
import csv

router = APIRouter(prefix="/alunos", tags=["Gestão de Alunos"])

class AlunoCreateUpdate(BaseModel):
    nome: str
    cpf: str
    idade: int
    telefone: Optional[str] = None
    plano: Optional[str] = None
    plano_id: Optional[int] = None
    objetivo: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_aluno(
    aluno_in: AlunoCreateUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    # Verifica se já existe um aluno com esse CPF
    existing_aluno = db.query(Aluno).filter(Aluno.cpf == aluno_in.cpf, Aluno.tenant_id == current_user.tenant_id).first()
    if existing_aluno:
        raise HTTPException(status_code=400, detail="Já existe um aluno com este CPF.")
    
    # Cria o User associado ao aluno (para ele poder logar depois)
    # Usa o CPF (sem pontuação) como username padrão e "123" como senha padrão
    clean_cpf = ''.join(filter(str.isdigit, aluno_in.cpf))
    
    new_user = User(
        username=f"aluno_{clean_cpf}",
        hashed_password=get_password_hash("123"),
        nome=aluno_in.nome,
        role=RoleEnum.ALUNO,
        tenant_id=current_user.tenant_id
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
        plano_id=aluno_in.plano_id,
        objetivo=aluno_in.objetivo,
        idade=aluno_in.idade,
        frequencia_media=0.0,
        dias_ausente=0,
        meses_matricula=0,
        faturas_atrasadas=0,
        tenant_id=current_user.tenant_id
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
        (Aluno.cpf == termo) | (User.nome.ilike(f"%{termo}%")),
        Aluno.tenant_id == current_user.tenant_id
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
        "plano_id": aluno.plano_id,
        "plano_ativo": bool(aluno.plano_ativo),
        "data_expiracao_plano": aluno.data_expiracao_plano.isoformat() if aluno.data_expiracao_plano else None,
        "objetivo": aluno.objetivo,
        "frequencia_media": aluno.frequencia_media,
        "dias_ausente": aluno.dias_ausente,
        "meses_matricula": aluno.meses_matricula,
        "faturas_atrasadas": aluno.faturas_atrasadas
    }

@router.put("/{cpf}")
def update_aluno(
    cpf: str, 
    aluno_in: AlunoCreateUpdate,
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    aluno = db.query(Aluno).filter(Aluno.cpf == cpf, Aluno.tenant_id == current_user.tenant_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Atualiza dados de User
    aluno.user.nome = aluno_in.nome
    
    # Atualiza dados de Aluno
    aluno.idade = aluno_in.idade
    aluno.telefone = aluno_in.telefone
    aluno.plano = aluno_in.plano
    aluno.plano_id = aluno_in.plano_id
    aluno.objetivo = aluno_in.objetivo
    
    db.commit()
    return {"message": "Cadastro atualizado com sucesso"}

@router.get("/all")
def get_all_alunos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP, RoleEnum.PROF]))
):
    alunos = db.query(Aluno).filter(Aluno.tenant_id == current_user.tenant_id).all()
    aluno_list = []
    for aluno in alunos:
        aluno_list.append({
            "id": aluno.id,
            "nome": aluno.user.nome,
            "cpf": aluno.cpf,
            "idade": aluno.idade,
            "telefone": aluno.telefone,
            "plano": aluno.plano,
            "plano_id": aluno.plano_id,
            "plano_ativo": bool(aluno.plano_ativo),
            "data_expiracao_plano": aluno.data_expiracao_plano.isoformat() if aluno.data_expiracao_plano else None,
            "objetivo": aluno.objetivo,
            "frequencia_media": aluno.frequencia_media,
            "dias_ausente": aluno.dias_ausente,
            "meses_matricula": aluno.meses_matricula,
            "faturas_atrasadas": aluno.faturas_atrasadas
        })
    return aluno_list

class AtribuirPlanoRequest(BaseModel):
    plano_id: int

@router.post("/{cpf}/ativar-plano")
def ativar_plano_aluno(
    cpf: str,
    req: AtribuirPlanoRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    aluno = db.query(Aluno).filter(Aluno.cpf == cpf, Aluno.tenant_id == current_user.tenant_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    plano = db.query(Plano).filter(Plano.id == req.plano_id, Plano.tenant_id == current_user.tenant_id).first()
    if not plano:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    
    aluno.plano_id = plano.id
    aluno.plano = plano.nome
    aluno.plano_ativo = 1
    aluno.data_inicio_plano = datetime.utcnow()
    aluno.data_expiracao_plano = datetime.utcnow() + timedelta(days=30 * plano.duracao_meses)
    
    db.commit()
    return {
        "message": f"Plano '{plano.nome}' ativado para {aluno.user.nome}",
        "validade": aluno.data_expiracao_plano.isoformat()
    }

@router.post("/{cpf}/desativar-plano")
def desativar_plano_aluno(
    cpf: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    aluno = db.query(Aluno).filter(Aluno.cpf == cpf, Aluno.tenant_id == current_user.tenant_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    aluno.plano_ativo = 0
    db.commit()
    return {"message": "Plano desativado"}

@router.post("/importar")
def importar_alunos(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    MAX_FILE_SIZE = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS = {".csv", ".xlsx"}

    if not arquivo.filename:
        raise HTTPException(status_code=400, detail="Nenhum arquivo enviado")

    ext = os.path.splitext(arquivo.filename.lower())[1] if arquivo.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Formato não permitido: {ext}. Use .csv ou .xlsx")

    arquivo.file.seek(0, 2)
    size = arquivo.file.tell()
    arquivo.file.seek(0)
    if size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"Arquivo muito grande (máx 5MB)")

    importados = 0
    erros = []
    
    try:
        conteudo = arquivo.file.read()
        filename = arquivo.filename.lower() if arquivo.filename else ""
        
        if filename.endswith(".csv"):
            decoded = conteudo.decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(decoded))
            linhas = list(reader)
        else:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(conteudo))
            ws = wb.active
            headers = [cell.value for cell in ws[1]]
            linhas = []
            for row in ws.iter_rows(min_row=2, values_only=True):
                linhas.append(dict(zip(headers, row)))
        
        for idx, row in enumerate(linhas):
            try:
                nome = (row.get("nome") or row.get("Nome") or "").strip()
                cpf = (row.get("cpf") or row.get("CPF") or "").strip()
                telefone = (row.get("telefone") or row.get("Telefone") or row.get("whatsapp") or "").strip()
                idade_str = str(row.get("idade") or row.get("Idade") or "0")
                plano_nome = (row.get("plano") or row.get("Plano") or "").strip()
                objetivo = (row.get("objetivo") or row.get("Objetivo") or "").strip()
                meses_str = str(row.get("meses_matricula") or row.get("Meses") or "0")
                faturas_str = str(row.get("faturas_atrasadas") or row.get("Atrasos") or "0")
                
                if not nome or not cpf:
                    erros.append(f"Linha {idx + 2}: nome ou CPF vazio")
                    continue
                
                clean_cpf = ''.join(filter(str.isdigit, cpf))
                if len(clean_cpf) < 3:
                    erros.append(f"Linha {idx + 2}: CPF inválido '{cpf}'")
                    continue
                
                existing = db.query(Aluno).filter(Aluno.cpf == cpf, Aluno.tenant_id == current_user.tenant_id).first()
                if existing:
                    erros.append(f"Linha {idx + 2}: CPF {cpf} já cadastrado")
                    continue
                
                idade = int(''.join(filter(str.isdigit, idade_str))) if any(c.isdigit() for c in idade_str) else 0
                meses = int(''.join(filter(str.isdigit, meses_str))) if any(c.isdigit() for c in meses_str) else 0
                faturas = int(''.join(filter(str.isdigit, faturas_str))) if any(c.isdigit() for c in faturas_str) else 0
                
                random_password = secrets.token_urlsafe(12)
                user = User(
                    username=f"aluno_{clean_cpf}",
                    hashed_password=get_password_hash(random_password),
                    nome=nome,
                    role=RoleEnum.ALUNO,
                    tenant_id=current_user.tenant_id
                )
                db.add(user)
                db.flush()
                
                plano_obj = None
                if plano_nome:
                    plano_obj = db.query(Plano).filter(Plano.nome.ilike(plano_nome), Plano.tenant_id == current_user.tenant_id).first()
                
                aluno = Aluno(
                    user_id=user.id,
                    cpf=cpf,
                    telefone=telefone if telefone else None,
                    plano=plano_nome if plano_nome else None,
                    plano_id=plano_obj.id if plano_obj else None,
                    objetivo=objetivo if objetivo else None,
                    idade=idade if idade > 0 else 25,
                    meses_matricula=meses,
                    faturas_atrasadas=faturas,
                    tenant_id=current_user.tenant_id
                )
                db.add(aluno)
                importados += 1
            except Exception as e:
                erros.append(f"Linha {idx + 2}: {str(e)}")
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao processar arquivo: {str(e)}")
    
    return {
        "importados": importados,
        "erros": erros,
        "total_linhas": len(linhas) if 'linhas' in dir() else 0,
        "senha_gerada": "Senha aleatória gerada para cada novo usuário. O aluno deve redefinir a senha no primeiro acesso."
    }

@router.get("/meus-dados")
def meus_dados_aluno(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ALUNO]))
):
    aluno = db.query(Aluno).filter(Aluno.user_id == current_user.id, Aluno.tenant_id == current_user.tenant_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Perfil de aluno não encontrado")
    
    return {
        "id": aluno.id,
        "nome": aluno.user.nome,
        "cpf": aluno.cpf,
        "idade": aluno.idade,
        "telefone": aluno.telefone,
        "plano": aluno.plano,
        "plano_id": aluno.plano_id,
        "plano_ativo": bool(aluno.plano_ativo),
        "data_expiracao_plano": aluno.data_expiracao_plano.isoformat() if aluno.data_expiracao_plano else None,
        "data_inicio_plano": aluno.data_inicio_plano.isoformat() if aluno.data_inicio_plano else None,
        "objetivo": aluno.objetivo,
        "frequencia_media": aluno.frequencia_media,
        "dias_ausente": aluno.dias_ausente,
        "meses_matricula": aluno.meses_matricula,
        "faturas_atrasadas": aluno.faturas_atrasadas
    }

@router.delete("/{cpf}")
def delete_aluno(
    cpf: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    aluno = db.query(Aluno).filter(Aluno.cpf == cpf, Aluno.tenant_id == current_user.tenant_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    # Obtém o user_id antes de excluir
    user_id = aluno.user_id

    # Deleta o aluno
    db.delete(aluno)
    db.commit()
    
    # Verifica se o user pode ser excluído (não é Admin, Recep ou Prof)
    if user_id:
        user = db.query(User).filter(User.id == user_id, User.tenant_id == current_user.tenant_id).first()
        if user and user.role == RoleEnum.ALUNO:
            # Verifica se o user tem outros registros (além do Aluno que acabamos de excluir)
            other_alunos = db.query(Aluno).filter(Aluno.user_id == user.id, Aluno.tenant_id == current_user.tenant_id).count()
            if other_alunos == 0:
                db.delete(user)
                db.commit()
    
    return {"message": "Aluno excluído com sucesso"}
