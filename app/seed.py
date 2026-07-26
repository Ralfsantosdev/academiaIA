from app.database import engine, Base, SessionLocal
from app.models import User, Aluno, Plano, Tenant, RoleEnum
from app.auth import get_password_hash
from datetime import datetime, timedelta

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    if db.query(User).first() is None:
        print("Semeando banco de dados com usuários iniciais...")
        
        tenant = Tenant(
            nome="Academia Padrão",
            subdomain="admin",
            trial_ends_at=datetime.utcnow() + timedelta(days=30),
            max_alunos=50,
            max_usuarios=10,
            plano_assinatura="trial",
            is_active=1,
            created_at=datetime.utcnow()
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        tid = tenant.id
        
        planos = [
            Plano(tenant_id=tid, nome="Mensal", valor=120.0, duracao_meses=1),
            Plano(tenant_id=tid, nome="Trimestral", valor=300.0, duracao_meses=3),
            Plano(tenant_id=tid, nome="Anual", valor=1000.0, duracao_meses=12),
        ]
        db.add_all(planos)
        db.commit()
        for p in planos:
            db.refresh(p)
        
        users = [
            User(tenant_id=tid, username="admin", hashed_password=get_password_hash("123"), role=RoleEnum.ADMIN, nome="Admin Supremo"),
            User(tenant_id=tid, username="recepcao", hashed_password=get_password_hash("123"), role=RoleEnum.RECEP, nome="Recepção Central"),
            User(tenant_id=tid, username="professor", hashed_password=get_password_hash("123"), role=RoleEnum.PROF, nome="Prof. Fernando"),
            User(tenant_id=tid, username="aluno", hashed_password=get_password_hash("123"), role=RoleEnum.ALUNO, nome="João Aluno")
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)
        
        aluno = Aluno(
            tenant_id=tid,
            user_id=users[3].id,
            cpf="123.456.789-00",
            telefone="(11) 99999-8888",
            plano="Mensal",
            plano_id=planos[0].id,
            plano_ativo=1,
            data_inicio_plano=datetime.utcnow(),
            data_expiracao_plano=datetime.utcnow() + timedelta(days=30),
            objetivo="Hipertrofia",
            idade=28,
            frequencia_media=3.0,
            dias_ausente=2,
            meses_matricula=2,
            faturas_atrasadas=0
        )
        db.add(aluno)
        
        user_inad = User(
            tenant_id=tid,
            username="inadimplente",
            hashed_password=get_password_hash("123"),
            role=RoleEnum.ALUNO,
            nome="Carlos Inadimplente"
        )
        db.add(user_inad)
        db.flush()
        aluno_inad = Aluno(
            tenant_id=tid,
            user_id=user_inad.id,
            cpf="987.654.321-00",
            telefone="(11) 97777-6666",
            plano="Trimestral",
            plano_id=planos[1].id,
            plano_ativo=0,
            data_expiracao_plano=datetime.utcnow() - timedelta(days=15),
            objetivo="Emagrecimento",
            idade=35,
            meses_matricula=6,
            faturas_atrasadas=3
        )
        db.add(aluno_inad)
        db.commit()
        
        print("Usuários e planos criados com sucesso! (Senha padrão: '123')")
        print(f"Tenant padrão: '{tenant.subdomain}' | Login: admin:123")
    else:
        print("Banco já contém dados.")
    
    db.close()

if __name__ == "__main__":
    seed_db()
