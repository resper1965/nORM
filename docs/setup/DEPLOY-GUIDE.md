# 🚀 Guia Completo de Deploy - nORM

Este guia cobre o deploy completo do nORM na Vercel + Supabase.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- ✅ Conta no [Vercel](https://vercel.com) (grátis ou Pro)
- ✅ Conta no [Supabase](https://supabase.com) (grátis ou Pro)
- ✅ Chave de API do [OpenAI](https://platform.openai.com/api-keys)
- ✅ Chave de API do [SerpAPI](https://serpapi.com/) (opcional, mas recomendado)
- ✅ Chave de API do [Resend](https://resend.com/) (para emails)
- ✅ Repositório Git (GitHub, GitLab, ou Bitbucket)

### Custos Estimados

| Serviço | Tier | Custo Mensal |
|---------|------|--------------|
| Vercel | Pro | $20 |
| Supabase | Free/Pro | $0-25 |
| OpenAI GPT-4 | Pay-as-you-go | $200-300 |
| SerpAPI | Standard | $50 |
| Resend | Free | $0 |
| **TOTAL** | | **$270-395/mês** |

---

## 🗄️ Parte 1: Setup do Supabase

### 1.1 Criar Projeto

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click em "New Project"
3. Configure:
   - **Name**: `nORM Production` (ou nome de sua preferência)
   - **Database Password**: Gere uma senha forte e guarde
   - **Region**: `East US` (ou mais próxima do Brasil: `South America (São Paulo)` se disponível)
   - **Pricing Plan**: Free (para testar) ou Pro ($25/mês)

### 1.2 Executar Migrations

1. Abra o SQL Editor no Supabase
2. Execute os arquivos SQL na ordem:

```bash
# Ordem de execução das migrations:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_reputation_monitoring.sql
3. supabase/migrations/003_social_media.sql
4. supabase/migrations/004_content_generation.sql
5. supabase/migrations/005_reputation_scores.sql
6. supabase/migrations/006_audit_logs.sql
7. supabase/migrations/007_rls_policies.sql
8. supabase/migrations/008_client_domains.sql
```

**Dica**: Copie e cole o conteúdo de cada arquivo no SQL Editor e clique em "Run".

### 1.3 Obter Credenciais

Vá em **Settings > API** e copie:
- `Project URL` → será seu `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → será seu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → será seu `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRETO!)

### 1.4 Configurar Storage (Opcional)

Se você planeja armazenar screenshots de Instagram Stories:

1. Vá em **Storage**
2. Crie um bucket chamado `instagram-stories`
3. Configure políticas de acesso (RLS)

---

## ☁️ Parte 2: Deploy na Vercel

### 2.1 Conectar Repositório

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click em "Add New..." > "Project"
3. Importe seu repositório Git
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.2 Configurar Variáveis de Ambiente

Na aba **Environment Variables**, adicione TODAS as variáveis abaixo:

#### Supabase (Obrigatório)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (⚠️ SECRETO)
```

#### OpenAI (Obrigatório)
```bash
OPENAI_API_KEY=sk-proj-... (⚠️ SECRETO)
```

#### SerpAPI (Obrigatório para SERP tracking)
```bash
SERPAPI_API_KEY=sua-chave-serpapi
```

#### Email (Obrigatório para alertas)
```bash
RESEND_API_KEY=re_... (⚠️ SECRETO)
```

#### Aplicação
```bash
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
NODE_ENV=production
```

#### Segurança
```bash
JWT_SECRET=gere-uma-string-aleatoria-de-32-caracteres
ENCRYPTION_KEY=gere-outra-string-aleatoria-de-32-caracteres
```

**Gerar strings aleatórias**:
```bash
# Linux/Mac
openssl rand -base64 32

# Ou use: https://generate-secret.vercel.app/32
```

#### APIs Opcionais (para features completas)

**Social Media**:
```bash
# Instagram/Facebook (Meta Graph API)
FACEBOOK_APP_ID=seu-app-id
FACEBOOK_APP_SECRET=seu-app-secret
INSTAGRAM_ACCESS_TOKEN=seu-token

# LinkedIn
LINKEDIN_CLIENT_ID=seu-client-id
LINKEDIN_CLIENT_SECRET=seu-client-secret
```

**Monitoring & Analytics**:
```bash
# Sentry (error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### Feature Flags
```bash
ENABLE_AI_CONTENT_GENERATION=true
ENABLE_SOCIAL_MONITORING=true
ENABLE_MEDIA_SCRAPING=true
ENABLE_AUTO_PUBLISHING=false
```

#### Budget & Limits
```bash
MONTHLY_API_BUDGET=500
MAX_OPENAI_REQUESTS_PER_HOUR=100
MAX_SCRAPING_REQUESTS_PER_HOUR=500
```

### 2.3 Deploy!

1. Click em "Deploy"
2. Aguarde o build (~2-5 minutos)
3. ✅ Seu app estará disponível em `https://seu-projeto.vercel.app`

---

## 🔄 Parte 3: Configurar Cron Jobs

Os cron jobs já estão configurados no `vercel.json`, mas você precisa do **Vercel Pro Plan** ($20/mês).

### Cron Jobs Configurados

```json
{
  "crons": [
    {
      "path": "/api/cron/calculate-reputation",
      "schedule": "0 0 * * *"  // Diariamente à meia-noite
    },
    {
      "path": "/api/cron/sync-social",
      "schedule": "0 */6 * * *"  // A cada 6 horas
    },
    {
      "path": "/api/cron/check-serp",
      "schedule": "0 */6 * * *"  // A cada 6 horas
    },
    {
      "path": "/api/cron/scrape-news",
      "schedule": "0 8 * * *"  // Diariamente às 8h
    },
    {
      "path": "/api/cron/send-alerts",
      "schedule": "*/15 * * * *"  // A cada 15 minutos
    },
    {
      "path": "/api/cron/auto-generate-content",
      "schedule": "0 10 * * *"  // Diariamente às 10h
    }
  ]
}
```

### Verificar Cron Jobs

1. Vá em **Settings > Cron Jobs** no dashboard da Vercel
2. Verifique se todos os 6 jobs estão listados
3. Monitore a execução em **Deployments > Functions**

---

## ✅ Parte 4: Verificação Pós-Deploy

### 4.1 Health Check

Acesse `https://seu-app.vercel.app/api/health`

Você deve ver:
```json
{
  "status": "ok",
  "timestamp": "2025-12-30T...",
  "services": {
    "database": "connected",
    "openai": "available"
  }
}
```

### 4.2 Testar Login

1. Acesse `https://seu-app.vercel.app/pt/login`
2. Crie uma conta
3. Faça login
4. Deve redirecionar para o dashboard

### 4.3 Criar Primeiro Cliente

1. Vá em "Clientes" > "Novo Cliente"
2. Preencha:
   - Nome: "Minha Empresa"
   - Domínio: "minhaempresa.com.br"
3. Adicione 3-5 palavras-chave
4. Salve

### 4.4 Testar Cron Jobs Manualmente

Execute manualmente para testar:

```bash
# Check SERP
curl -X POST https://seu-app.vercel.app/api/cron/check-serp

# Sync Social
curl -X POST https://seu-app.vercel.app/api/cron/sync-social

# Calculate Reputation
curl -X POST https://seu-app.vercel.app/api/cron/calculate-reputation
```

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"
- ✅ Verifique se as migrations foram executadas
- ✅ Confira as credenciais do Supabase
- ✅ Teste conexão no Supabase SQL Editor

### Erro: "OpenAI API error"
- ✅ Verifique se `OPENAI_API_KEY` está configurado
- ✅ Teste a chave em https://platform.openai.com/playground
- ✅ Confirme que tem créditos na conta OpenAI

### Cron Jobs não executam
- ✅ Confirme que tem Vercel Pro Plan
- ✅ Verifique em Settings > Cron Jobs
- ✅ Check logs em Deployments > Functions

### Build falha
- ✅ Execute `npm run build` localmente primeiro
- ✅ Verifique erros de TypeScript
- ✅ Confirme que todas as dependências estão no `package.json`

### Alertas não chegam por email
- ✅ Verifique `RESEND_API_KEY`
- ✅ Configure domínio verificado no Resend
- ✅ Check logs em Resend Dashboard

---

## 📊 Monitoramento

### Logs

**Vercel Logs**:
```bash
vercel logs https://seu-app.vercel.app --follow
```

**Supabase Logs**:
- Dashboard > Logs > API/Postgres/Realtime

### Métricas

- **Vercel Analytics**: Dashboard > Analytics
- **Supabase**: Dashboard > Reports
- **OpenAI**: https://platform.openai.com/usage
- **SerpAPI**: https://serpapi.com/dashboard

### Alertas de Budget

O sistema enviará alertas automáticos quando atingir:
- 50% do budget mensal
- 80% do budget mensal
- 95% do budget mensal
- 100% do budget mensal

---

## 🔒 Segurança

### Checklist de Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Variáveis de ambiente secretas marcadas como "secret" na Vercel
- ✅ HTTPS habilitado (automático na Vercel)
- ✅ Security headers configurados no `vercel.json`
- ✅ Tokens de API nunca expostos no cliente
- ✅ CORS configurado corretamente
- ✅ Rate limiting implementado

### Rotação de Secrets

Recomendado a cada 90 dias:
1. `JWT_SECRET`
2. `ENCRYPTION_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔄 Atualizações

### Deploy de Atualizações

1. Faça commit das mudanças:
```bash
git add .
git commit -m "feat: nova feature"
git push origin main
```

2. Vercel faz deploy automático!

### Rollback

Se algo der errado:
1. Vá em **Deployments**
2. Encontre o último deployment estável
3. Click "..." > "Promote to Production"

---

## 📞 Suporte

- 📚 Documentação: Ver `README.md`
- 🐛 Issues: GitHub Issues
- 💬 Dúvidas: Criar Discussion no GitHub

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Supabase configurado com todas as migrations
- [ ] Vercel deployment bem-sucedido
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Health check retorna status "ok"
- [ ] Login funcionando
- [ ] Cliente criado e keywords configuradas
- [ ] Cron jobs executando (verificar em 24h)
- [ ] Email de alerta recebido (testar manualmente)
- [ ] Monitoramento configurado
- [ ] Budget alerts configurados

**Parabéns! 🎉 Seu nORM está em produção!**
