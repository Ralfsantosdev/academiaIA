from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
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

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    subdomain = Column(String, unique=True, index=True, nullable=False)
    trial_ends_at = Column(DateTime, nullable=True)
    max_alunos = Column(Integer, default=100)
    max_usuarios = Column(Integer, default=5)
    plano_assinatura = Column(String, default="trial")
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="tenant")
    planos = relationship("Plano", back_populates="tenant")
    alunos = relationship("Aluno", back_populates="tenant")
    pagamentos = relationship("Pagamento", back_populates="tenant")
    produtos = relationship("Produto", back_populates="tenant")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    username = Column(String, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.ALUNO)
    nome = Column(String)
    
    __table_args__ = (UniqueConstraint("tenant_id", "username", name="uq_user_tenant"),)

    tenant = relationship("Tenant", back_populates="users")
    aluno_profile = relationship("Aluno", back_populates="user", uselist=False)

class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    cpf = Column(String, index=True, nullable=True)
    telefone = Column(String, nullable=True)
    plano = Column(String, nullable=True)
    plano_id = Column(Integer, ForeignKey("planos.id"), nullable=True)
    plano_ativo = Column(Integer, default=0)
    data_inicio_plano = Column(DateTime, nullable=True)
    data_expiracao_plano = Column(DateTime, nullable=True)
    objetivo = Column(String, nullable=True)
    
    idade = Column(Integer)
    frequencia_media = Column(Float, default=0.0)
    dias_ausente = Column(Integer, default=0)
    meses_matricula = Column(Integer, default=0)
    faturas_atrasadas = Column(Integer, default=0)
    
    __table_args__ = (UniqueConstraint("tenant_id", "cpf", name="uq_aluno_tenant_cpf"),)

    tenant = relationship("Tenant", back_populates="alunos")
    user = relationship("User", back_populates="aluno_profile")
    plano_ref = relationship("Plano")
    pagamentos = relationship("Pagamento", back_populates="aluno")

class Plano(Base):
    __tablename__ = "planos"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    nome = Column(String, index=True)
    valor = Column(Float)
    duracao_meses = Column(Integer)

    __table_args__ = (UniqueConstraint("tenant_id", "nome", name="uq_plano_tenant"),)

    tenant = relationship("Tenant", back_populates="planos")

class Pagamento(Base):
    __tablename__ = "pagamentos"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    valor = Column(Float)
    data_pagamento = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Pago")

    tenant = relationship("Tenant", back_populates="pagamentos")
    aluno = relationship("Aluno", back_populates="pagamentos")


class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    nome = Column(String, nullable=False)
    descricao = Column(String, nullable=True)
    categoria = Column(String, nullable=True)  # Ex: suplemento, camiseta, acessorio
    preco_compra = Column(Float, default=0.0)
    preco_venda = Column(Float, default=0.0)
    estoque_atual = Column(Integer, default=0)
    estoque_minimo = Column(Integer, default=5)
    unidade = Column(String, default="un")  # un, kg, l, etc
    ativo = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("tenant_id", "nome", name="uq_produto_tenant"),)

    tenant = relationship("Tenant", back_populates="produtos")
    movimentacoes = relationship("MovimentacaoEstoque", back_populates="produto")


class MovimentacaoEstoque(Base):
    __tablename__ = "movimentacoes_estoque"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    tipo = Column(String, nullable=False)  # "entrada" ou "saida"
    quantidade = Column(Integer, nullable=False)
    motivo = Column(String, nullable=True)  # Compra, venda, devolucao, ajuste, perda
    responsavel = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    produto = relationship("Produto", back_populates="movimentacoes")
