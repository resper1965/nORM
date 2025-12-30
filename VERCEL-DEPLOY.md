# 🚀 Deploy no Vercel - n.ORM

Guia completo para deploy do n.ORM (Next Online Reputation Manager) no Vercel.

## 📋 Pré-requisitos

Antes de fazer o deploy, você precisa:

1. ✅ Conta no [Vercel](https://vercel.com)
2. ✅ Conta no [Supabase](https://supabase.com) (banco de dados)
3. ✅ API Keys necessárias (veja seção de Variáveis de Ambiente)
4. ✅ Repositório GitHub conectado

## 🔧 Configuração Inicial

### 1. Conectar Repositório ao Vercel

```bash
# Opção 1: Via CLI do Vercel
npm i -g vercel
vercel login
vercel

# Opção 2: Via Dashboard
# Vá para https://vercel.com/new e conecte este repositório
```

### 2. Configurar Variáveis de Ambiente

No dashboard do Vercel, vá em **Settings → Environment Variables** e adicione:

#### 🔴 Obrigatórias (Mínimo para Deploy)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (para funcionalidades de IA)
OPENAI_API_KEY=sk-...

# Segurança
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ENCRYPTION_KEY=your-encryption-key-32-characters
```

#### 🟡 Recomendadas (Para Funcionalidades Completas)

```bash
# Social Media APIs
TWITTER_BEARER_TOKEN=your-token
FACEBOOK_ACCESS_TOKEN=your-token
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-secret

# News & Media
NEWS_API_KEY=your-newsapi-key

# Email (para alertas)
RESEND_API_KEY=your-resend-key
```

#### 🟢 Opcionais (Recursos Avançados)

```bash
# Anthropic Claude (alternativa ao OpenAI)
ANTHROPIC_API_KEY=sk-ant-...

# SEO & Backlinks
MOZ_ACCESS_ID=your-moz-id
MOZ_SECRET_KEY=your-moz-secret

# Web Scraping
SCRAPINGBEE_API_KEY=your-scrapingbee-key

# Rate Limiting (Redis)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 3. Configurar Domínio Personalizado (Opcional)

No Vercel Dashboard:
1. Vá em **Settings → Domains**
2. Adicione seu domínio customizado
3. Configure os DNS conforme instruções

## 🗄️ Setup do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto
3. Aguarde o provisionamento (2-3 minutos)

### 2. Executar Migrations

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link com o projeto
supabase link --project-ref your-project-ref

# Executar migrations
supabase db push
```

### 3. Configurar Row Level Security (RLS)

As migrations já incluem políticas de segurança, mas você pode revisá-las no Dashboard:
- **Authentication → Policies**

### 4. Configurar Edge Functions (Background Jobs)

```bash
# Deploy das Edge Functions
supabase functions deploy scrape-news
supabase functions deploy sync-social-media
supabase functions deploy calculate-reputation

# Configurar secrets das Edge Functions
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set NEWS_API_KEY=your-key
```

### 5. Configurar Cron Jobs

No Supabase Dashboard:
1. Vá em **Database → Cron**
2. As migrations já criaram os jobs, verifique se estão ativos

Ou via SQL:

```sql
-- Verificar cron jobs ativos
SELECT * FROM cron.job;

-- Habilitar/desabilitar
UPDATE cron.job SET enabled = true WHERE jobname = 'calculate-reputation-scores';
```

## 🔄 Deploy Automático

O projeto está configurado para deploy automático:

```bash
# Quando você faz push para main:
git push origin main

# Vercel automaticamente:
# 1. Detecta mudanças
# 2. Executa build
# 3. Faz deploy
# 4. Invalida cache do CDN
```

### Branches e Preview Deployments

```bash
# Cada branch gera um preview deployment
git checkout -b feature/nova-funcionalidade
git push origin feature/nova-funcionalidade

# Vercel gera: https://norm-git-feature-nova-funcionalidade-user.vercel.app
```

## 🔍 Verificações Pós-Deploy

### 1. Health Check

Acesse: `https://seu-dominio.vercel.app/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T12:00:00.000Z",
  "services": {
    "database": "connected",
    "ai": "available"
  }
}
```

### 2. Testar Autenticação

1. Acesse o app
2. Tente fazer login/signup
3. Verifique se Supabase Auth está funcionando

### 3. Verificar Edge Functions

```bash
# Testar manualmente
curl -X POST https://seu-projeto.supabase.co/functions/v1/scrape-news \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 4. Logs e Monitoramento

**Vercel Logs:**
```bash
# Via CLI
vercel logs

# Ou no Dashboard: Deployments → Select Deployment → Logs
```

**Supabase Logs:**
- Dashboard → Logs → Select Function/Database

## 📊 Monitoramento e Performance

### Vercel Analytics

Automaticamente ativado. Veja em:
- **Analytics** no Dashboard do Vercel

### Vercel Speed Insights

```bash
# Instalar (opcional)
npm install @vercel/speed-insights

# Já incluído no projeto
```

### Custom Monitoring

O projeto está preparado para:
- **Sentry** (error tracking)
- **PostHog** (product analytics)

Configure as variáveis de ambiente para ativar.

## 🐛 Troubleshooting

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solução:**
1. Verifique as variáveis de ambiente no Vercel
2. Re-deploy: `vercel --force`

### Erro: "OpenAI API Key Invalid"

**Solução:**
1. Verifique se a key está correta
2. Verifique se tem créditos na conta OpenAI
3. Re-deploy após corrigir

### Erro: "Database connection failed"

**Solução:**
1. Verifique se o Supabase project está ativo
2. Verifique as credenciais
3. Verifique se as migrations foram executadas

### Build Timeout

Se o build estiver demorando muito:

```bash
# Aumentar timeout no vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 300
      }
    }
  ]
}
```

### Edge Function não está executando

**Solução:**
1. Verifique os logs: `supabase functions logs scrape-news`
2. Verifique se os secrets estão configurados
3. Teste manualmente via curl

## 💰 Custos Estimados

### Vercel
- **Hobby (Free):** Adequado para desenvolvimento
  - 100 GB bandwidth
  - Serverless Functions: 100 GB-Hrs
  - Edge Functions: 500k invocations

- **Pro ($20/mês):** Recomendado para produção
  - 1 TB bandwidth
  - Serverless Functions: 1000 GB-Hrs
  - Custom domains ilimitados

### Supabase
- **Free Tier:** Adequado para desenvolvimento
  - 500 MB database
  - 2 GB bandwidth
  - 50k edge function invocations

- **Pro ($25/mês):** Recomendado para produção
  - 8 GB database
  - 250 GB bandwidth
  - 2M edge function invocations

### APIs Externas
- **OpenAI:** ~$200-500/mês (varia com uso)
- **NewsAPI:** $0-450/mês
- **Social Media APIs:** Maioria é grátis (com rate limits)

**Total estimado produção:** $245-975/mês

## 🔐 Segurança

### Headers de Segurança

Já configurados em `vercel.json`:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Environment Variables

**NUNCA** commite:
- ❌ `.env`
- ❌ `.env.local`
- ❌ API keys em código

**SEMPRE** use:
- ✅ Vercel Environment Variables
- ✅ Supabase Secrets
- ✅ `.env.example` para documentação

### Rate Limiting

Configure Upstash Redis para rate limiting em produção:

```typescript
// lib/rate-limit.ts já está configurado
// Configure as variáveis:
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 📚 Recursos Adicionais

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🆘 Suporte

Se encontrar problemas:

1. **Logs do Vercel:** `vercel logs`
2. **Logs do Supabase:** Dashboard → Logs
3. **Issues:** Abra um issue no repositório
4. **Discord:** [Vercel Discord](https://vercel.com/discord)

---

**Última atualização:** 2025-11-06
**Versão:** 1.0.0
