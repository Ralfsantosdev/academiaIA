# Deploy Vercel + Supabase - Academia IA Core

## Visão Geral

Deploy rápido do backend FastAPI + banco de dados PostgreSQL Supabase e frontend React/Vite SPA usando Vercel (frontend) + Supabase (banco de dados).<br/>
Revise as chaves de ambiente sensíveis antes de subir para produção.

---

## Configuração Rápida

1. **Crie um projeto Supabase**
   - Acesse [app.supabase.com](https://app.supabase.com)
   - Crie um novo projeto com PostgreSQL
   - Anote o `PROJECT REF`, `URL do PostgreSQL` e `ANON KEY`

2. **Execute o schema no Supabase**
   - No SQL Editor do Supabase, cole e execute `/home/ralf/projetos/academia-ia-core/supabase_schema.sql`
   - OR importe via:
     ```bash
     # Se você tiver o CLI do Supabase:
     supabase db push --file supabase_schema.sql
     ```

3. **Configure as variáveis de ambiente**

   Backend (`.env`):
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@PROJECT-REF.supabase.co:5432/postgres
   SECRET_KEY=SUA_CHAVE_SEcreta_aqui_
   TURSO_AUTH_TOKEN=
   OPENAI_API_KEY=sk-seua-chave-openai
   MERCADOPAGO_ACCESS_TOKEN=TEST-sua-chave-test-aqui
   WHATSAPP_API_KEY=sua-chave-evolution-api-aqui
   WHATSAPP_API_URL=https://evo-api.onrender.com/message/sendText/whatsapp-instance
   FRONTEND_URL=https://academia-ia-frontend.vercel.app
   API_BASE_URL=https://academiaia-core-backend.vercel.app
   ```

   Frontend (`frontend/config.js`):
   ```javascript
   export const API_BASE_URL = 'https://academiaia-core-backend.vercel.app';
   ```

4. **Deploy Frontend no Vercel**
   ```bash
   cd frontend
   npx vercel --prod
   ```

5. **Deploy Backend no Vercel (como uma função serverless)"

   JSON de vercel.json para Vercel Functions:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

   ```bash
   # Para escalar, você precisará de Vercel for AI (Functions Pro Plan)
   npx vercel --prod
   ```

6. **Configure CORS**

   Backend: Adicione o domínio Vercel à configuração de CORS:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   origins = [
       "https://academia-ia-frontend.vercel.app",
       "https://*.vercel.app"
   ]
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=origins,
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## Files Essenciais

### `supabase_schema.sql`
- Schema completo PostgreSQL para Supabase
- Inclui todas as tabelas: tenants, users, planos, alunos, pagamentos
- Usa `SERIAL` para IDs com auto incremento

### `frontend/vercel.json`
- Configuração de roteamento para React Router (SPA)
- Garante que todas as rotas não-API vão para `index.html`

### `frontend/config.js`
- URL base da API (atualize após o deploy)

### `.env` (Exemplo)
- As variáveis de ambiente ATUAIS precisam ser revisadas antes de subir para Vercel

---

## Como testar após o deploy

1. **Frontend**: https://academia-ia-frontend.vercel.app/
   - **Login**: `admin:admin` (primeiro admin)

2. **Backend**: https://academiaia-core-backend.vercel.app/api/v1/
   - **Rota de teste**: `/api/v1/health` (se você adicionar)

3. **SQL Editor do Supabase**: **PROJECT-REF.sql.supabase.co**

---

## Problemas conhecidos

1. **Portagens em segundos períodos**: PDF básico e páginas/potências binômicas<br/>
   Solução: Use um menor "chunk_size"

2. **CPF duplicados**: O Supabase pode usar diferentes buckets de região<br/>
   Solução: Adicione regras de negócios para validação

3. **Regras de CORS**: Permita apenas origens específicas<br/>
   Mantenha o list `allow_origins` específico para restringir

4. **Integração com Mercado Pago**: Precisa de endpoints webhook seguros<br/>
   Adicione segredo de webhook e URL de retorno do Mercado Pago

---

## Recursos Remanescentes do Render

1. **Evolution API WhatsApp**: Ainda na Render (suspensa)

2. **LibSQL/Turso**: Pode reutilizar do Render anterior

3. **Tempo de execução do IA (churn/workout)**: Implemente como serverless Functions

---

## TODOs após o deploy

- [ ] Adicione endpoint `/api/v1/health` para a Vercel Functions
- [ ] Crie um endpoint `/api/v1/auth/reset-password` para reset de senha seguro
- [ ] Adicione hooks de eventos do Supabase (insira/atualize) para sync de dados
- [ ] Configure webhooks do Mercado Pago para processamento assíncrono
- [ ] Implemente limites de taxa (Redis/Upstash) para as Functions

---

## Licença

Desenvolvimento Ágil, Academia IA Core