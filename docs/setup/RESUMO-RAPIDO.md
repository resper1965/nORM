# ⚡ Resumo Rápido - Ir para Produção

## 🎯 O Que Fazer AGORA (40 minutos)

### 1. Supabase (15 min)
```bash
1. Acesse: https://supabase.com/dashboard
2. Crie projeto (se não tem)
3. SQL Editor > Execute migrations na ordem:
   - 001_initial_schema.sql
   - 002_reputation_monitoring.sql
   - 003_social_media.sql
   - 004_content_generation.sql
   - 005_reputation_scores.sql
   - 006_audit_logs.sql
   - 007_rls_policies.sql
   - 008_infrastructure.sql
   - 009_fix_security_issues.sql
4. Authentication > Users > Criar usuário
5. SQL Editor > Executar seed.sql (opcional)
```

### 2. Vercel - Variáveis (10 min)
```bash
1. Acesse: https://vercel.com/dashboard
2. Seu projeto > Settings > Environment Variables
3. Adicione:

OBRIGATÓRIAS:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://norm-xxx.vercel.app
CRON_SECRET=openssl-rand-base64-32
ENCRYPTION_KEY=openssl-rand-base64-32
JWT_SECRET=openssl-rand-base64-32

OPCIONAIS (mas recomendadas):
OPENAI_API_KEY=sk-...
SERPAPI_KEY=xxx
RESEND_API_KEY=re_...

4. Redeploy o projeto
```

### 3. GitHub Secrets (5 min)
```bash
1. GitHub > Settings > Secrets > Actions
2. Adicione:
   APP_URL=https://norm-xxx.vercel.app
   CRON_SECRET=mesma-do-vercel
3. Settings > Actions > Habilitar workflows
```

### 4. Testar (10 min)
```bash
1. Acesse: https://norm-xxx.vercel.app/login
2. Faça login
3. Crie um cliente
4. Adicione keywords
5. GitHub Actions > Executar cron manualmente
6. Aguarde 5 min > Recarregue dashboard
```

---

## ✅ Checklist Mínimo

- [ ] Migrations executadas no Supabase
- [ ] Variáveis obrigatórias no Vercel
- [ ] GitHub Secrets configurados
- [ ] Usuário criado no Supabase
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Cliente criado
- [ ] Keywords adicionadas
- [ ] Cron job executou (ver logs)

---

## 🚨 Se Algo Não Funciona

1. **Ver logs do Vercel**: Dashboard > Deployments > Logs
2. **Ver logs do GitHub**: Actions > [workflow] > Logs
3. **Verificar variáveis**: Vercel > Settings > Environment Variables
4. **Verificar migrations**: Supabase > SQL Editor > Verificar tabelas

---

**Tempo total: ~40 minutos**
