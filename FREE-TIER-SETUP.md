# 🆓 Setup Completo com Planos Gratuitos (Vercel + Supabase)

**Custo Total: $0/mês** + custos de APIs externas (OpenAI, SerpAPI, etc)

Este guia mostra como configurar o nORM usando apenas planos gratuitos.

---

## 📊 O que está incluído no FREE TIER

### Vercel Free Plan
- ✅ Deployments ilimitados
- ✅ 100GB bandwidth/mês
- ✅ Serverless Functions
- ✅ Environment variables
- ✅ Automatic HTTPS
- ✅ Git integration
- ❌ Cron Jobs (precisa Pro $20/mês)

### Supabase Free Plan
- ✅ 500MB database storage
- ✅ 2GB bandwidth/mês
- ✅ 50,000 Monthly Active Users
- ✅ Row Level Security (RLS)
- ✅ Auth (email, OAuth)
- ✅ Storage (1GB)
- ✅ Edge Functions (500k invocations/mês)
- ✅ Realtime subscriptions

### GitHub Free
- ✅ GitHub Actions (2000 minutos/mês para privado, ilimitado para público)
- ✅ Workflows ilimitados
- ✅ Secrets management

---

## 🔧 Solução para Cron Jobs (SEM Vercel Pro)

Como Vercel Cron Jobs requer plano Pro ($20/mês), usaremos **GitHub Actions** (grátis!).

### Como funciona

```mermaid
GitHub Actions (cron) → Chama API do Vercel → Executa tarefa → Salva no Supabase
```

**Vantagens:**
- ✅ 100% gratuito
- ✅ Confiável
- ✅ Logs completos
- ✅ Fácil de debugar
- ✅ Pode executar manualmente

**Limitações:**
- ⚠️ Atraso de ~15min possível em horários de pico
- ⚠️ Não executará se repositório for privado e exceder 2000 min/mês

---

## 🚀 Passo a Passo do Setup

### 1. Deploy na Vercel (FREE)

#### 1.1 Fazer Deploy
```bash
# 1. Push do código para GitHub
git push origin main

# 2. Ir para vercel.com
# 3. Importar repositório
# 4. Deploy automático!
```

#### 1.2 Configurar Environment Variables

No dashboard da Vercel, adicione:

**Mínimo necessário:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
CRON_SECRET=gere-string-aleatoria-32-chars
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

**Opcional (mas recomendado):**
```bash
SERPAPI_API_KEY=xxx
RESEND_API_KEY=xxx
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx
```

### 2. Configurar Supabase (FREE)

#### 2.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto (FREE plan)
3. Escolha região mais próxima

#### 2.2 Executar Migrations
```sql
-- No Supabase SQL Editor, execute na ordem:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_reputation_monitoring.sql
3. supabase/migrations/003_social_media.sql
4. supabase/migrations/004_content_generation.sql
5. supabase/migrations/005_reputation_scores.sql
6. supabase/migrations/006_audit_logs.sql
7. supabase/migrations/007_rls_policies.sql
8. supabase/migrations/008_client_domains.sql
```

#### 2.3 Obter Credenciais
- Settings > API > Project URL
- Settings > API > anon public key
- Settings > API > service_role key (⚠️ SECRETO!)

### 3. Configurar GitHub Actions (FREE - substitui Vercel Crons)

#### 3.1 Adicionar Secrets no GitHub

No seu repositório GitHub:
1. Vá em **Settings > Secrets and variables > Actions**
2. Adicione os secrets:

```bash
APP_URL = https://seu-app.vercel.app
CRON_SECRET = mesma-string-do-vercel
```

#### 3.2 Habilitar Workflows

O arquivo `.github/workflows/cron-jobs.yml` já está configurado!

Ele executará automaticamente:
- ✅ Calculate reputation: Diariamente à meia-noite
- ✅ Sync social media: A cada 6 horas
- ✅ Check SERP: A cada 6 horas
- ✅ Scrape news: Diariamente às 8h
- ✅ Send alerts: A cada 15 minutos
- ✅ Auto-generate content: Diariamente às 10h

#### 3.3 Testar Manualmente

1. Vá em **Actions** no GitHub
2. Selecione "Scheduled Cron Jobs"
3. Click "Run workflow"
4. Escolha qual job rodar
5. Verifique logs

---

## 💰 Custos Estimados (APIs Externas)

Mesmo com Vercel + Supabase grátis, você ainda precisará pagar pelas APIs:

| API | Uso Estimado | Custo Mensal |
|-----|--------------|--------------|
| OpenAI GPT-4 | 50 artigos + sentiment | $200-300 |
| SerpAPI | 100 keywords × 30 dias | $50 |
| Resend | 3000 emails | $0 (grátis) |
| Meta Graph API | Instagram/Facebook | $0 (grátis) |
| LinkedIn API | LinkedIn monitoring | $0 (grátis) |
| **TOTAL** | | **~$250-350/mês** |

**Economia vs Plano Pago:**
- Vercel Pro: $20/mês → **ECONOMIZADO**
- Supabase Pro: $25/mês → **ECONOMIZADO**
- **Total economizado: $45/mês ($540/ano)**

---

## ⚠️ Limitações do Free Tier

### Vercel Free
| Limitação | Impacto |
|-----------|---------|
| 100GB bandwidth | ✅ Suficiente para ~10k usuários/mês |
| No Cron Jobs | ✅ Resolvido com GitHub Actions |
| 100 max serverless functions | ✅ Projeto usa ~20 |

### Supabase Free
| Limitação | Impacto |
|-----------|---------|
| 500MB storage | ⚠️ Limite de ~5k clientes ou ~50k mentions |
| 2GB bandwidth | ✅ Suficiente para uso moderado |
| Pausa após 1 semana inativa | ⚠️ Requer acesso semanal |

### GitHub Actions Free
| Limitação | Impacto |
|-----------|---------|
| 2000 min/mês (privado) | ✅ Suficiente (~200 min/mês de uso) |
| Ilimitado (público) | ✅ Sem limites! |

---

## 🎯 Quando fazer upgrade para planos pagos?

### Upgrade Vercel Pro ($20/mês) quando:
- [ ] Precisar de cron jobs nativos (mais confiável que GitHub Actions)
- [ ] Tráfego > 100GB/mês
- [ ] Precisar de preview deployments ilimitados

### Upgrade Supabase Pro ($25/mês) quando:
- [ ] Database > 500MB (muitos clientes/dados)
- [ ] Bandwidth > 2GB/mês
- [ ] Precisar de backups automáticos
- [ ] Quiser suporte prioritário

---

## ✅ Checklist de Setup FREE

- [ ] Código no GitHub
- [ ] Deploy na Vercel (FREE plan)
- [ ] Environment variables configuradas
- [ ] Projeto Supabase criado (FREE plan)
- [ ] Migrations executadas
- [ ] GitHub Secrets configurados (APP_URL, CRON_SECRET)
- [ ] GitHub Actions habilitado
- [ ] Teste manual de 1 cron job funcionou
- [ ] Login no app funciona
- [ ] Criação de cliente funciona

---

## 🐛 Troubleshooting FREE Tier

### GitHub Actions não executam
- ✅ Verifique se repositório não está em pausa (7 dias sem commit)
- ✅ Confirme secrets APP_URL e CRON_SECRET configurados
- ✅ Verifique logs em Actions tab

### Supabase pausou por inatividade
- ✅ Acesse dashboard Supabase 1x/semana
- ✅ Ou faça um request qualquer para "acordar"

### Limite de storage atingido (500MB)
- ✅ Delete dados antigos (> 90 dias)
- ✅ Ou faça upgrade para Pro ($25/mês)

### Bandwidth limit excedido
- ✅ Otimize queries (use indexes)
- ✅ Cache responses no cliente
- ✅ Reduza frequência de polling

---

## 📊 Monitoramento de Limites

### Vercel
```
Dashboard > Settings > Usage
- Bandwidth usado
- Function invocations
- Build minutes
```

### Supabase
```
Dashboard > Settings > Usage
- Database size
- Bandwidth
- API requests
```

### GitHub Actions
```
Settings > Billing > Plans and usage
- Minutes used (repos privados)
```

---

## 💡 Dicas para Otimizar FREE Tier

### 1. Reduza chamadas de API
```typescript
// Use cache quando possível
const cached = cache.get(key)
if (cached) return cached

// Batch requests
await batchRequests(items, 10, processor)
```

### 2. Otimize Database Queries
```sql
-- Adicione indexes
CREATE INDEX idx_client_id ON mentions(client_id);
CREATE INDEX idx_created_at ON mentions(created_at);

-- Delete dados antigos
DELETE FROM mentions WHERE created_at < NOW() - INTERVAL '90 days';
```

### 3. Reduza Frequência de Crons
Se estiver no limite do GitHub Actions:
```yaml
# De 15 em 15 min → 30 em 30 min
- cron: '*/30 * * * *'  # alerts

# De 6 em 6h → 12 em 12h
- cron: '0 */12 * * *'  # sync social
```

---

## 🚀 Próximos Passos

1. ✅ Siga este guia
2. ✅ Configure tudo no FREE tier
3. ✅ Use por 1-2 meses
4. 📊 Monitore usage
5. 💰 Faça upgrade se necessário

**Você pode começar 100% de graça e só pagar quando precisar escalar!**

---

## 📞 Precisa de Ajuda?

- 📚 Ver [DEPLOY-GUIDE.md](DEPLOY-GUIDE.md) para instruções detalhadas
- 🐛 Abrir issue no GitHub
- 💬 Criar Discussion no repositório
