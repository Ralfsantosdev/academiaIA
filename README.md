# Academia IA Core

Sistema de gestão acadêmica com inteligência artificial para academias. Inclui predição de risco de evasão (churn), geração de treinos personalizados via OpenAI, gestão de alunos, planos, pagamentos e integração com Mercado Pago e WhatsApp.

## Stack

- **Backend**: Python + FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + Vite
- **IA**: Scikit-learn (churn) + OpenAI API (geração de treinos)
- **Pagamentos**: Mercado Pago
- **Comunicação**: WhatsApp (Evolution API)

## Funcionalidades

- Autenticação JWT com 4 perfis: Administrador, Recepcionista, Professor, Aluno
- CRUD de alunos, planos e pagamentos
- Predição de churn (risco de evasão) com modelo treinado em scikit-learn
- Geração de fichas de treino personalizadas via OpenAI GPT
- Relatório financeiro em tempo real
- Integração com Mercado Pago para assinaturas
- Disparo de lembretes via WhatsApp

## Como Rodar

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse o frontend em `http://localhost:5173` e a API em `http://localhost:8000/docs`.

## Usuários de Teste

| Usuário | Senha | Perfil |
|---------|-------|--------|
| admin | *** | Administrador |
| recepcao | *** | Recepcionista |
| professor | *** | Professor |
| aluno | 123 | Aluno |

## Ambiente

Copie o `.env.example` para `.env` e configure as chaves:

```env
OPENAI_API_KEY="sk-sua-chave-aqui"
MERCADOPAGO_ACCESS_TOKEN="seu-token-aqui"
SECRET_KEY="sua-chave-secreta-jwt"
```

## Estrutura

```
app/              # Backend FastAPI
  main.py         # Rotas e configuração
  auth.py         # JWT e autenticação
  models.py       # Modelos SQLAlchemy
  routers/        # Endpoints por módulo
  seed.py         # Dados iniciais
frontend/         # React + Vite
  src/
    App.jsx       # Interface principal
    services/     # Serviços de API
docs/             # Documentação
```
