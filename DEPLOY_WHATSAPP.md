# Deploy do WhatsApp (Evolution API) — Grátis

## Opção 1: Railway (recomendado — 1 clique, grátis)

1. Crie conta em https://railway.com
2. Acesse https://railway.com/deploy/evolution-api-whatsapp
3. Clique em **Deploy**
4. Railway cria automaticamente: Evolution API + PostgreSQL + Redis
5. Após o deploy, abra o domínio gerado (ex: `https://evolution-api.up.railway.app`)
6. Acesse `/manager` para abrir o painel
7. Clique em **Criar Instância**, dê um nome (ex: `whatsapp-academia`)
8. Escaneie o QR code com o WhatsApp da academia
9. No menu, copie a **API Key** (em Configurações → Global)

## Configurar no sistema

No Render, serviço `academia-ia-api` → **Environment Variables**:

| Variável | Valor |
|---|---|
| `WHATSAPP_API_URL` | `https://seu-evo.up.railway.app/message/sendText/whatsapp-academia` |
| `WHATSAPP_API_KEY` | A chave que copiou do manager |

Substitua `seu-evo.up.railway.app` pela URL real do Railway.

Clique **Save** e **Manual Deploy** no `academia-ia-api`.

## Opção 2: Render (precisa de Redis pago)

1. Dashboard Render → New → Web Service
2. Escolha **Docker**
3. Image: `evoapicloud/evolution-api`
4. Configurar:
   - **Port**: 8080
   - **Plan**: Free
5. Adicionar env vars:
   - `SERVER_URL` = URL do serviço no Render
   - `AUTHENTICATION_API_KEY` = uma chave secreta (mín 16 caracteres)
   - `DATABASE_ENABLED` = `true`
   - `DATABASE_PROVIDER` = `postgresql`
   - `DATABASE_URL` = string do PostgreSQL (do serviço academia-ia-db)
6. Criar Redis externo (Railway ou Upstash tem Redis grátis)
7. Após deploy, acessar `/manager`, criar instância e escanear QR code

## Testar

Depois de configurar, vá no sistema em **💰 Cobranças**, selecione um aluno e "Enviar Cobrança". A mensagem será enviada pelo WhatsApp da academia.

## Observações

- O Evolution API usa WhatsApp Web — o número precisa estar ativo no celular
- A conexão QR pode expirar se não escanear rápido
- Para manter a sessão ativa, o Railway NÃO pode hibernar (plano grátis do Railway dá $5/mês, suficiente para manter rodando)
