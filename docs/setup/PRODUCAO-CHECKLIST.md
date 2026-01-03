# ✅ Checklist para Produção - n.ORM

## 🎯 Objetivo
Tornar o sistema 100% funcional em produção com todas as funcionalidades operacionais.

---

## 📋 FASE 1: Configuração Básica (OBRIGATÓRIA)

### 1.1 Supabase - Banco de Dados ✅
- [ ] Criar projeto no Supabase (https://supabase.com)
- [ ] Executar todas as migrations na ordem:
  - [ ] `001_initial_schema.sql`
  - [ ] `002_reputation_monitoring.sql`
  - [ ] `003_social_media.sql`
  - [ ] `004_content_generation.sql`
  - [ ] `005_reputation_scores.sql`
  - [ ] `006_audit_logs.sql`
  - [ ] `007_rls_policies.sql`
  - [ ] `008_infrastructure.sql`
  - [ ] `009_fix_security_issues.sql`
- [ ] Obter credenciais:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Vercel - Deploy ✅
- [ ] Projeto conectado ao GitHub
- [ ] Deploy automático configurado
- [ ] Variáveis de ambiente configuradas no Vercel Dashboard

### 1.3 Variáveis de Ambiente no Vercel
**Obrigatórias:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://norm-xxx.vercel.app
```

**Recomendadas (para funcionalidades completas):**
```bash
OPENAI_API_KEY=sk-...
SERPAPI_KEY=xxx
RESEND_API_KEY=re_...
CRON_SECRET=string-aleatoria-32-chars
ENCRYPTION_KEY=string-aleatoria-32-chars
JWT_SECRET=string-aleatoria-32-chars
```

---

## 📋 FASE 2: Dados Iniciais (OBRIGATÓRIA)

### 2.1 Criar Primeiro Usuário
- [ ] Acessar `/register` ou usar Supabase Auth
- [ ] Criar conta de usuário
- [ ] Verificar se login funciona

### 2.2 Criar Primeiro Cliente
- [ ] Fazer login no sistema
- [ ] Acessar `/clients/new`
- [ ] Criar primeiro cliente com:
  - Nome
  - Website (opcional)
  - Indústria (opcional)

### 2.3 Adicionar Keywords
- [ ] Acessar cliente criado
- [ ] Adicionar pelo menos 3-5 keywords para monitoramento
- [ ] Verificar se keywords aparecem no dashboard

---

## 📋 FASE 3: Configurar Integrações (OPCIONAL mas RECOMENDADO)

### 3.1 SerpAPI (Para Monitoramento SERP)
- [ ] Criar conta em https://serpapi.com
- [ ] Obter API key
- [ ] Adicionar `SERPAPI_KEY` no Vercel
- [ ] Testar endpoint `/api/cron/check-serp`

### 3.2 OpenAI (Para Geração de Conteúdo)
- [ ] Criar conta em https://platform.openai.com
- [ ] Adicionar créditos ($5 mínimo)
- [ ] Obter API key
- [ ] Adicionar `OPENAI_API_KEY` no Vercel
- [ ] Testar geração de conteúdo em `/content/generate`

### 3.3 Resend (Para E-mails)
- [ ] Criar conta em https://resend.com
- [ ] Verificar domínio (ou usar domínio de teste)
- [ ] Obter API key
- [ ] Adicionar `RESEND_API_KEY` no Vercel
- [ ] Testar envio de e-mail

### 3.4 Redes Sociais (Opcional)
- [ ] **Facebook/Instagram**: Configurar Meta Developer App
- [ ] **LinkedIn**: Configurar LinkedIn Developer App
- [ ] Adicionar contas sociais via interface do sistema

---

## 📋 FASE 4: Configurar Cron Jobs (OBRIGATÓRIA)

### 4.1 GitHub Actions (Gratuito)
- [ ] Verificar se `.github/workflows/cron-jobs.yml` existe
- [ ] Adicionar secrets no GitHub:
  - `APP_URL`: URL do Vercel
  - `CRON_SECRET`: Mesma string do Vercel
- [ ] Habilitar GitHub Actions no repositório
- [ ] Testar execução manual de um job

### 4.2 Cron Jobs Necessários
- [ ] **Calculate Reputation**: Diariamente (00:00)
- [ ] **Check SERP**: A cada 6 horas
- [ ] **Sync Social**: A cada 6 horas
- [ ] **Scrape News**: Diariamente (08:00)
- [ ] **Send Alerts**: A cada 15 minutos

---

## 📋 FASE 5: Testes Funcionais

### 5.1 Autenticação
- [ ] Registro de novo usuário funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Proteção de rotas funciona

### 5.2 Dashboard
- [ ] Dashboard carrega sem erros
- [ ] Mostra dados do cliente (se houver)
- [ ] Gráficos renderizam corretamente

### 5.3 Clientes
- [ ] Criar cliente funciona
- [ ] Editar cliente funciona
- [ ] Deletar cliente funciona
- [ ] Lista de clientes carrega

### 5.4 Keywords
- [ ] Adicionar keyword funciona
- [ ] Editar keyword funciona
- [ ] Deletar keyword funciona

### 5.5 Conteúdo
- [ ] Geração de conteúdo funciona (se OpenAI configurado)
- [ ] Lista de conteúdo gerado aparece

### 5.6 Alertas
- [ ] Alertas aparecem no dashboard
- [ ] E-mails são enviados (se Resend configurado)

---

## 📋 FASE 6: Dados de Teste (OPCIONAL)

### 6.1 Criar Dados de Exemplo
- [ ] Executar script de seed (se existir)
- [ ] Ou criar manualmente:
  - 2-3 clientes
  - 5-10 keywords por cliente
  - Alguns resultados SERP
  - Algumas menções de notícias
  - Alguns posts sociais

---

## 🐛 Troubleshooting

### Problema: "Nenhum dado aparece no dashboard"
**Solução:**
1. Verificar se há clientes criados
2. Verificar se há keywords configuradas
3. Executar cron jobs manualmente para gerar dados
4. Verificar logs do Vercel

### Problema: "Cron jobs não executam"
**Solução:**
1. Verificar GitHub Secrets configurados
2. Verificar CRON_SECRET no Vercel
3. Verificar se GitHub Actions está habilitado
4. Ver logs em GitHub > Actions

### Problema: "Erro ao gerar conteúdo"
**Solução:**
1. Verificar se OPENAI_API_KEY está configurada
2. Verificar se há créditos na conta OpenAI
3. Verificar logs do Vercel

### Problema: "E-mails não são enviados"
**Solução:**
1. Verificar se RESEND_API_KEY está configurada
2. Verificar se domínio está verificado no Resend
3. Verificar logs do Vercel

---

## ✅ Checklist Final

Antes de considerar "em produção", verifique:

- [ ] Login/Registro funciona
- [ ] Dashboard carrega sem erros
- [ ] Pode criar clientes
- [ ] Pode adicionar keywords
- [ ] Cron jobs estão executando (verificar logs)
- [ ] Dados aparecem no dashboard (após execução de crons)
- [ ] Geração de conteúdo funciona (se OpenAI configurado)
- [ ] E-mails são enviados (se Resend configurado)

---

## 🚀 Próximos Passos Após Setup

1. **Monitorar logs** por 24-48h
2. **Verificar execução dos cron jobs**
3. **Testar todas as funcionalidades**
4. **Configurar domínio personalizado** (opcional)
5. **Verificar logs no Vercel** (nativo, automático)
   - Acesse: Vercel Dashboard → Deployments → Logs

---

## 📞 Precisa de Ajuda?

- Ver logs do Vercel: Dashboard > Deployments > Logs
- Ver logs do GitHub Actions: GitHub > Actions
- Ver logs do Supabase: Dashboard > Logs
