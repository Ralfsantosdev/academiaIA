from app.database import engine, Base, SessionLocal
from app.models import User, RoleEnum
from app.auth import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    if db.query(User).first() is None:
        print("Semeando banco de dados com usuários iniciais...")
        users = [
            User(username="admin", hashed_password=get_password_hash("123"), role=RoleEnum.ADMIN, nome="Admin Supremo"),
            User(username="recepcao", hashed_password=get_password_hash("123"), role=RoleEnum.RECEP, nome="Recepção Central"),
            User(username="professor", hashed_password=get_password_hash("123"), role=RoleEnum.PROF, nome="Prof. Fernando"),
            User(username="aluno", hashed_password=get_password_hash("123"), role=RoleEnum.ALUNO, nome="João Aluno")
        ]
        db.add_all(users)
        db.commit()
        print("Usuários criados com sucesso! (Senha padrão para todos: '123')")
    else:
        print("Banco já contém dados.")
    
    db.close()

if __name__ == "__main__":
    seed_db()
