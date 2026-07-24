from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import datetime
import enum
from sqlalchemy import Enum

class RoleEnum(str, enum.Enum):
    ADMIN = "Administrador"
    RECEP = "Recepcionista"
    PROF = "Professor"
    ALUNO = "Aluno"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.ALUNO)
    nome = Column(String)
    
    # Relação 1:1 com o Aluno (se o user for aluno)
    aluno_profile = relationship("Aluno", back_populates="user", uselist=False)

class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    cpf = Column(String, unique=True, index=True, nullable=True)
    telefone = Column(String, nullable=True)
    plano = Column(String, nullable=True)
    objetivo = Column(String, nullable=True)
    
    idade = Column(Integer)
    frequencia_media = Column(Float, default=0.0)
    dias_ausente = Column(Integer, default=0)
    meses_matricula = Column(Integer, default=0)
    faturas_atrasadas = Column(Integer, default=0)
    
    user = relationship("User", back_populates="aluno_profile")
    pagamentos = relationship("Pagamento", back_populates="aluno")

class Plano(Base):
    __tablename__ = "planos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    valor = Column(Float)
    duracao_meses = Column(Integer)

class Pagamento(Base):
    __tablename__ = "pagamentos"
    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    valor = Column(Float)
    data_pagamento = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Pago")

    aluno = relationship("Aluno", back_populates="pagamentos")
