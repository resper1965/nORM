# 🚀 Como Ir para Produção - Guia Passo a Passo

## ⚠️ Situação Atual
O código está deployado, mas o sistema não está funcional porque:
- ❌ Variáveis de ambiente não configuradas
- ❌ Migrations não executadas no Supabase
- ❌ Dados iniciais não criados
- ❌ Cron jobs não configurados

---

## 📋 PASSO 1: Configurar Supabase (15 minutos)

### 1.1 Criar/Acessar Projeto Supabase
1. Acesse: https://supabase.com/dashboard
2. Se não tem projeto, crie um (FREE tier funciona)
3. Anote o **Project URL** e **API Keys**

### 1.2 Executar Migrations
1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute os arquivos SQL **na ordem**:

```bash
# Ordem de execução:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_reputation_monitoring.sql
3. supabase/migrations/003_social_media.sql
4. supabase/migrations/004_content_generation.sql
5. supabase/migrations/005_reputation_scores.sql
6. supabase/migrations/006_audit_logs.sql
7. supabase/migrations/007_rls_policies.sql
8. supabase/migrations/008_infrastructure.sql
9. supabase/migrations/009_fix_security_issues.sql
```

**Como executar:**
- Abra cada arquivo SQL
- Copie todo o conteúdo
- Cole no SQL Editor do Supabase
- Clique em "Run" ou pressione Ctrl+Enter
- Verifique se não há erros

### 1.3 Criar Usuário de Teste
1. No Supabase Dashboard, vá em **Authentication > Users**
2. Clique em "Add User" > "Create new user"
3. Preencha:
   - Email: `admin@exemplo.com`
   - Password: (crie uma senha forte)
   - Auto Confirm User: ✅ (marcar)
4. Anote o **User ID** gerado

### 1.4 Criar Dados Iniciais (Opcional)
1. No SQL Editor, execute: `supabase/seed.sql`
2. Isso criará:
   - Um cliente de exemplo
   - Keywords de exemplo
   - Link do usuário ao cliente

---

## 📋 PASSO 2: Configurar Variáveis no Vercel (10 minutos)

### 2.1 Acessar Vercel Dashboard
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `norm` (ou seu projeto)
3. Vá em **Settings > Environment Variables**

### 2.2 Adicionar Variáveis Obrigatórias

**Copie e cole estas variáveis:**

```bash
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Aplicação (OBRIGATÓRIO)
NEXT_PUBLIC_APP_URL=https://norm-xxx.vercel.app

# Segurança (OBRIGATÓRIO)
CRON_SECRET=gerar-string-aleatoria-32-caracteres
ENCRYPTION_KEY=gerar-string-aleatoria-32-caracteres
JWT_SECRET=gerar-string-aleatoria-32-caracteres
```

**Para gerar strings aleatórias:**
```bash
# No terminal:
openssl rand -base64 32
# Execute 3 vezes para gerar CRON_SECRET, ENCRYPTION_KEY e JWT_SECRET
```

### 2.3 Adicionar Variáveis Opcionais (Recomendadas)

```bash
# OpenAI (para geração de conteúdo)
OPENAI_API_KEY=sk-proj-...

# SerpAPI (para monitoramento SERP)
SERPAPI_KEY=sua-chave-serpapi

# Resend (para e-mails)
RESEND_API_KEY=re_...
```

### 2.4 Fazer Redeploy
1. Após adicionar todas as variáveis
2. Vá em **Deployments**
3. Clique nos 3 pontos do último deploy
4. Selecione "Redeploy"
5. Aguarde o deploy completar

---

## 📋 PASSO 3: Configurar GitHub Actions (5 minutos)

### 3.1 Adicionar Secrets no GitHub
1. Acesse: https://github.com/resper1965/nORM/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione:

**Secret 1:**
- Name: `APP_URL`
- Value: `https://norm-xxx.vercel.app` (sua URL do Vercel)

**Secret 2:**
- Name: `CRON_SECRET`
- Value: (mesma string do CRON_SECRET do Vercel)

### 3.2 Habilitar GitHub Actions
1. Vá em **Settings > Actions > General**
2. Em "Workflow permissions", selecione:
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"
3. Salve

### 3.3 Testar Cron Job Manualmente
1. Vá em **Actions** no GitHub
2. Selecione "Scheduled Cron Jobs"
3. Clique em "Run workflow"
4. Selecione job: `reputation`
5. Clique em "Run workflow"
6. Verifique os logs para ver se executou com sucesso

---

## 📋 PASSO 4: Testar o Sistema (10 minutos)

### 4.1 Testar Login
1. Acesse: `https://norm-xxx.vercel.app/login`
2. Faça login com o usuário criado no Supabase
3. Verifique se redireciona para o dashboard

### 4.2 Verificar Dashboard
1. Após login, você deve ver o dashboard
2. Se não houver dados, é normal (ainda não executamos os crons)
3. Verifique se não há erros no console do navegador

### 4.3 Criar Cliente (se não usou seed)
1. Vá em `/clients/new`
2. Crie um cliente:
   - Nome: "Minha Empresa"
   - Website: "https://minhaempresa.com.br"
3. Salve

### 4.4 Adicionar Keywords
1. Acesse o cliente criado
2. Adicione keywords:
   - "nome da empresa"
   - "produto principal"
   - "serviço oferecido"
3. Salve cada keyword

### 4.5 Executar Cron Jobs Manualmente
1. No GitHub Actions, execute manualmente:
   - `check-serp` (para buscar posições no Google)
   - `scrape-news` (para buscar notícias)
   - `calculate-reputation` (para calcular score)
2. Aguarde alguns minutos
3. Recarregue o dashboard
4. Você deve ver dados aparecendo!

---

## 📋 PASSO 5: Verificar Funcionalidades

### 5.1 Checklist de Funcionalidades

- [ ] **Login/Registro funciona**
  - Teste: Criar nova conta
  - Teste: Fazer login
  - Teste: Fazer logout

- [ ] **Dashboard carrega**
  - Teste: Acessar `/dashboard`
  - Verificar: Não há erros no console
  - Verificar: Interface carrega corretamente

- [ ] **Clientes funcionam**
  - Teste: Criar cliente
  - Teste: Editar cliente
  - Teste: Ver lista de clientes

- [ ] **Keywords funcionam**
  - Teste: Adicionar keyword
  - Teste: Editar keyword
  - Teste: Deletar keyword

- [ ] **Cron Jobs executam**
  - Teste: Executar manualmente no GitHub Actions
  - Verificar: Logs mostram sucesso
  - Verificar: Dados aparecem no dashboard após execução

- [ ] **Geração de Conteúdo** (se OpenAI configurado)
  - Teste: Acessar `/content/generate`
  - Teste: Gerar um artigo
  - Verificar: Artigo é gerado e salvo

- [ ] **E-mails** (se Resend configurado)
  - Teste: Criar um alerta crítico
  - Verificar: E-mail é enviado

---

## 🐛 Troubleshooting

### Problema: "Dashboard vazio, sem dados"
**Causa:** Cron jobs ainda não executaram ou não há dados
**Solução:**
1. Execute cron jobs manualmente no GitHub Actions
2. Aguarde 5-10 minutos
3. Recarregue o dashboard
4. Se ainda vazio, verifique logs do Vercel

### Problema: "Erro ao fazer login"
**Causa:** Variáveis de ambiente não configuradas
**Solução:**
1. Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verifique se usuário existe no Supabase Auth
3. Verifique logs do Vercel

### Problema: "Cron jobs não executam"
**Causa:** Secrets do GitHub não configurados
**Solução:**
1. Verifique se `APP_URL` e `CRON_SECRET` estão em GitHub Secrets
2. Verifique se GitHub Actions está habilitado
3. Verifique logs em GitHub > Actions

### Problema: "Erro 500 ao acessar páginas"
**Causa:** Variáveis de ambiente faltando ou migrations não executadas
**Solução:**
1. Verifique todas as variáveis obrigatórias no Vercel
2. Verifique se todas as migrations foram executadas
3. Verifique logs do Vercel para erro específico

---

## ✅ Checklist Final

Antes de considerar "em produção", verifique:

- [ ] Todas as migrations executadas no Supabase
- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] GitHub Secrets configurados (APP_URL, CRON_SECRET)
- [ ] Pelo menos 1 usuário criado no Supabase Auth
- [ ] Pelo menos 1 cliente criado no sistema
- [ ] Pelo menos 3-5 keywords adicionadas
- [ ] Login funciona
- [ ] Dashboard carrega sem erros
- [ ] Cron jobs executam (verificar logs)
- [ ] Dados aparecem no dashboard após execução de crons

---

## 🎯 Próximos Passos Após Setup

1. **Monitorar por 24-48h**
   - Verificar execução dos cron jobs
   - Verificar se dados estão sendo coletados
   - Verificar se não há erros

2. **Adicionar mais clientes**
   - Criar clientes reais
   - Adicionar keywords relevantes
   - Configurar integrações sociais (se necessário)

3. **Configurar domínio personalizado** (opcional)
   - No Vercel: Settings > Domains
   - Adicionar seu domínio
   - Configurar DNS

4. **Configurar monitoramento** (nativo Vercel)
   - Vercel Logs (automático) - Acesse Dashboard → Deployments → Logs
   - Vercel Analytics (opcional) - Para métricas de performance

---

## 📞 Precisa de Ajuda?

- **Logs do Vercel**: Dashboard > Deployments > [último deploy] > Logs
- **Logs do Supabase**: Dashboard > Logs
- **Logs do GitHub Actions**: GitHub > Actions > [workflow] > [run]

---

## 🎉 Quando Está Pronto?

O sistema está pronto para produção quando:
- ✅ Login funciona
- ✅ Dashboard carrega
- ✅ Pode criar clientes e keywords
- ✅ Cron jobs executam automaticamente
- ✅ Dados aparecem no dashboard
- ✅ Não há erros nos logs

**Tempo estimado total: 40-60 minutos**
