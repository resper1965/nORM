# ⚙️ Configurações de Produção - n.ORM

## 📋 Checklist de Variáveis de Ambiente

### 🔴 Obrigatórias (Sem elas a aplicação não funciona)

#### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

#### OpenAI (Para geração de conteúdo)
```bash
OPENAI_API_KEY=sk-...
```

#### Resend (Para envio de emails)
```bash
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

#### Vercel Cron (Para proteger cron jobs)
```bash
CRON_SECRET=seu-secret-aleatorio-forte
```

---

### 🟡 Opcionais (Melhoram funcionalidades)

#### Google Custom Search (Para SERP tracking)
```bash
GOOGLE_CSE_API_KEY=sua-chave
GOOGLE_CSE_ID=seu-cse-id
```

**Nota:** Logging é feito automaticamente via Vercel Logs. Acesse Vercel Dashboard → Deployments → Logs para monitorar erros.

---

## 🔐 Como Configurar no Vercel

### 1. Acesse Vercel Dashboard
- Vá em: https://vercel.com/dashboard
- Selecione seu projeto `norm`

### 2. Adicione Variáveis de Ambiente
- Settings → Environment Variables
- Adicione cada variável acima
- Selecione ambientes: Production, Preview, Development

### 3. Verifique Variáveis Críticas

**Supabase:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave pública
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Chave privada (não expor no frontend)

**OpenAI:**
- ✅ `OPENAI_API_KEY` - Chave da API

**Resend:**
- ✅ `RESEND_API_KEY` - Chave da API
- ✅ `NEXT_PUBLIC_APP_URL` - URL da aplicação (ex: https://norm.vercel.app)

**Cron:**
- ✅ `CRON_SECRET` - String aleatória forte (ex: `openssl rand -hex 32`)

---

## 🛡️ Segurança

### Variáveis Públicas vs Privadas

**Públicas (NEXT_PUBLIC_*):**
- Expostas no frontend
- Podem ser vistas no código JavaScript
- Use apenas para dados não sensíveis

**Privadas:**
- Apenas no servidor
- Nunca expostas no frontend
- Use para chaves de API, secrets, etc.

### Boas Práticas

1. **Nunca commite secrets no Git**
   - Use `.env.local` para desenvolvimento
   - Use Vercel Environment Variables para produção

2. **Rotacione secrets regularmente**
   - Especialmente `CRON_SECRET` e `SUPABASE_SERVICE_ROLE_KEY`

3. **Use diferentes secrets por ambiente**
   - Development, Preview, Production

4. **Monitore uso de API keys**
   - Configure alertas de limite em OpenAI
   - Monitore custos no Supabase

---

## 📊 Verificação de Configuração

### Teste Local

```bash
# Verificar se todas as variáveis estão definidas
npm run build

# Testar conexão com Supabase
# Acesse: http://localhost:3000/api/health

# Testar cron jobs (com CRON_SECRET)
curl -X POST http://localhost:3000/api/cron/check-serp \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Teste em Produção

1. **Health Check:**
   ```bash
   curl https://seu-dominio.com/api/health
   ```

2. **Verificar Logs:**
   - Vercel Dashboard → Deployments → Logs
   - Verifique se não há erros de variáveis faltando

3. **Testar Cron Jobs:**
   - Vercel Dashboard → Cron Jobs
   - Verifique se estão executando sem erros

---

## 🔧 Configurações Adicionais

### Domínio Customizado

1. Vercel Dashboard → Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Atualize `NEXT_PUBLIC_APP_URL` com novo domínio

### SSL/HTTPS

- ✅ Automático no Vercel
- Certificados Let's Encrypt gerenciados automaticamente

### Monitoramento

**Vercel Logs (Nativo)**
- Acesse: Vercel Dashboard → Deployments → Logs
- Todos os logs são automaticamente coletados
- Filtros por nível (error, warn, info, debug)
- Histórico completo de erros e eventos

---

## 📝 Checklist Final

Antes de considerar produção 100%:

- [ ] Todas as variáveis obrigatórias configuradas
- [ ] `CRON_SECRET` definido e forte
- [ ] `NEXT_PUBLIC_APP_URL` aponta para URL correta
- [ ] Supabase conectado e funcionando
- [ ] OpenAI API key válida
- [ ] Resend configurado e testado
- [ ] Domínio customizado (se aplicável)
- [ ] Cron jobs executando sem erros
- [ ] Health check retornando OK
- [ ] Logs sem erros críticos

---

## 🆘 Troubleshooting

### Erro: "Missing environment variable"
- Verifique se variável está em Vercel Dashboard
- Verifique se nome está correto (case-sensitive)
- Faça redeploy após adicionar variável

### Erro: "Unauthorized" em cron jobs
- Verifique se `CRON_SECRET` está definido
- Verifique se header `Authorization: Bearer ...` está correto
- Verifique se Vercel Cron está configurado corretamente

### Erro: "Supabase connection failed"
- Verifique `NEXT_PUBLIC_SUPABASE_URL`
- Verifique `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Teste conexão no Supabase Dashboard

---

**Última atualização:** 2025-01-02
