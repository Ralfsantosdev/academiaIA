from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User, RoleEnum
from app.auth import require_role, get_password_hash

router = APIRouter(prefix="/users", tags=["Gestão de Usuários"])

# DTO para criação de usuários
class UserCreate(BaseModel):
    username: str
    password: str
    nome: str
    role: RoleEnum

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role([RoleEnum.ADMIN])) # Apenas ADMIN pode criar usuários livremente
):
    # Verifica se o username já está em uso
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username já está em uso por outra pessoa")
    
    # Cria o novo usuário
    new_user = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        nome=user_in.nome,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Usuário cadastrado com sucesso!", 
        "id": new_user.id,
        "username": new_user.username,
        "role": new_user.role
    }

@router.get("/")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "nome": u.nome, "role": u.role} for u in users]

class UserUpdatePassword(BaseModel):
    password: str

@router.put("/{user_id}/password")
def update_user_password(
    user_id: int,
    user_in: UserUpdatePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.hashed_password = get_password_hash(user_in.password)
    db.commit()
    return {"message": "Senha atualizada com sucesso"}

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir a si mesmo")
    
    db.delete(user)
    db.commit()
    return {"message": "Usuário excluído com sucesso"}
