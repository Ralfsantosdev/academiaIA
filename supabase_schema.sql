-- Schema para Supabase (PostgreSQL)
-- Academia IA Engine
-- Execute no SQL Editor do Supabase

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    subdomain VARCHAR UNIQUE NOT NULL,
    trial_ends_at TIMESTAMP,
    max_alunos INTEGER DEFAULT 100,
    max_usuarios INTEGER DEFAULT 5,
    plano_assinatura VARCHAR DEFAULT 'trial',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    username VARCHAR,
    hashed_password VARCHAR,
    role VARCHAR DEFAULT 'Aluno',
    nome VARCHAR
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_username ON users(tenant_id, username);

CREATE TABLE IF NOT EXISTS planos (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    nome VARCHAR,
    valor DOUBLE PRECISION,
    duracao_meses INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_planos_tenant_nome ON planos(tenant_id, nome);

CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    cpf VARCHAR,
    telefone VARCHAR,
    plano VARCHAR,
    plano_id INTEGER REFERENCES planos(id),
    plano_ativo INTEGER DEFAULT 0,
    data_inicio_plano TIMESTAMP,
    data_expiracao_plano TIMESTAMP,
    objetivo VARCHAR,
    idade INTEGER,
    frequencia_media DOUBLE PRECISION DEFAULT 0.0,
    dias_ausente INTEGER DEFAULT 0,
    meses_matricula INTEGER DEFAULT 0,
    faturas_atrasadas INTEGER DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_alunos_tenant_cpf ON alunos(tenant_id, cpf);

CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    aluno_id INTEGER REFERENCES alunos(id),
    valor DOUBLE PRECISION,
    data_pagamento TIMESTAMP DEFAULT NOW(),
    status VARCHAR DEFAULT 'Pago'
);

-- Índices e restrições para chaves estrangeiras
CREATE INDEX IF NOT EXISTS idx_alunos_tenant ON alunos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alunos_user_id ON alunos(user_id);
CREATE INDEX IF NOT EXISTS idx_alunos_plano ON alunos(plano_id);

CREATE INDEX IF NOT EXISTS idx_pagamentos_aluno ON pagamentos(aluno_id);
