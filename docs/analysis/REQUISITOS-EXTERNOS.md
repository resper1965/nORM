# 📋 Requisitos Externos - n.ORM

Documento completo listando todas as variáveis de ambiente necessárias e serviços externos utilizados pelo projeto.

## 🔐 Variáveis de Ambiente

### Obrigatórias (para funcionamento básico)

#### 1. Supabase - Banco de Dados e Autenticação
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hyeifxvxifhrapfdvfry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```
- **Onde obter**: https://app.supabase.com/project/hyeifxvxifhrapfdvfry/settings/api
- **Uso**: Banco de dados PostgreSQL, autenticação de usuários, Row Level Security
- **Observação**: A chave anônima pode ser exposta no cliente (NEXT_PUBLIC_)

#### 2. Alternativa para chave Supabase (opcional)
```bash
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sua_chave_publishable_aqui
```
- **Uso**: Pode ser usada como alternativa à NEXT_PUBLIC_SUPABASE_ANON_KEY

### Opcionais (para funcionalidades específicas)

#### 3. Supabase Service Role Key
```bash
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```
- **Onde obter**: https://app.supabase.com/project/hyeifxvxifhrapfdvfry/settings/api
- **Uso**: Operações administrativas no servidor (bypass RLS)
- **⚠️ SEGURANÇA**: NUNCA exponha publicamente! Apenas no servidor.

#### 4. OpenAI - IA e Análise de Sentimento
```bash
OPENAI_API_KEY=sk-sua_chave_openai_aqui
```
- **Onde obter**: https://platform.openai.com/api-keys
- **Uso**: 
  - Geração de conteúdo com IA
  - Análise de sentimento de menções (positivo/neutro/negativo)
  - Sugestões de melhorias de SEO
  - Análise de conteúdo gerado
- **Funcionalidades que dependem**: 
  - Geração de artigos para blog
  - Análise de sentimento de notícias e posts sociais
  - Sugestões de resposta a críticas

#### 5. SerpAPI - Monitoramento de Posições no Google
```bash
SERPAPI_KEY=sua_chave_serpapi_aqui
```
- **Onde obter**: https://serpapi.com/dashboard
- **Uso**: 
  - Rastreamento de posições SERP (Search Engine Results Page)
  - Monitoramento de keywords
  - Verificação de posicionamento de clientes no Google
- **Funcionalidades que dependem**:
  - Dashboard de posições SERP
  - Alertas de mudanças de posição
  - Relatórios de SEO

#### 6. Resend - Envio de E-mails
```bash
RESEND_API_KEY=re_sua_chave_resend_aqui
```
- **Onde obter**: https://resend.com/api-keys
- **Uso**: 
  - Envio de alertas por e-mail
  - Notificações de eventos importantes
  - Relatórios periódicos
- **Funcionalidades que dependem**:
  - Sistema de alertas
  - Notificações de mudanças críticas na reputação
  - Relatórios semanais/mensais

#### 7. URL da Aplicação
```bash
NEXT_PUBLIC_APP_URL=https://norm-nessbr-projects.vercel.app
```
- **Uso**: URL base da aplicação em produção
- **Padrão**: `http://localhost:3000` (desenvolvimento)
- **Uso**: Geração de links absolutos, callbacks, webhooks

## 🌐 Serviços Externos Utilizados

### 1. Supabase (PostgreSQL + Auth + Storage)
- **Tipo**: Backend-as-a-Service (BaaS)
- **Uso Principal**: 
  - Banco de dados PostgreSQL
  - Autenticação de usuários
  - Row Level Security (RLS)
  - Storage (se necessário para uploads)
- **Integração**: 
  - `@supabase/supabase-js` - Cliente JavaScript
  - `@supabase/ssr` - Server-side rendering
- **URL**: https://hyeifxvxifhrapfdvfry.supabase.co

### 2. OpenAI (GPT-4)
- **Tipo**: API de IA
- **Uso Principal**:
  - Geração de conteúdo para blog
  - Análise de sentimento
  - Sugestões de melhorias
- **Integração**: 
  - `openai` - SDK oficial
- **Endpoint**: https://api.openai.com/v1
- **Modelos utilizados**: GPT-4, GPT-3.5-turbo

### 3. SerpAPI
- **Tipo**: API de scraping de resultados de busca
- **Uso Principal**:
  - Monitoramento de posições no Google
  - Rastreamento de keywords
- **Integração**: 
  - `axios` - Requisições HTTP
- **Endpoint**: https://serpapi.com/search
- **Rate Limit**: Configurado via `rate-limiter.ts`

### 4. Resend
- **Tipo**: Serviço de envio de e-mails
- **Uso Principal**:
  - Envio de alertas
  - Notificações
- **Integração**: 
  - `resend` - SDK oficial
- **Endpoint**: https://api.resend.com/emails

### 5. Instagram Graph API
- **Tipo**: API oficial do Instagram (Meta)
- **Uso Principal**:
  - Monitoramento de menções
  - Rastreamento de posts e comentários
  - Análise de engajamento
- **Integração**: 
  - `axios` - Requisições HTTP
- **Endpoint**: https://graph.instagram.com
- **Configuração**: 
  - Access Token armazenado no banco (tabela `social_accounts`)
  - Requer app no Meta Developers

### 6. Facebook Graph API
- **Tipo**: API oficial do Facebook (Meta)
- **Uso Principal**:
  - Monitoramento de menções em páginas
  - Rastreamento de comentários
  - Análise de reviews
- **Integração**: 
  - `axios` - Requisições HTTP
- **Endpoint**: https://graph.facebook.com/v18.0
- **Configuração**: 
  - Access Token armazenado no banco (tabela `social_accounts`)
  - Requer app no Meta Developers

### 7. LinkedIn API v2
- **Tipo**: API oficial do LinkedIn
- **Uso Principal**:
  - Monitoramento de menções
  - Rastreamento de posts e comentários
  - Análise de engajamento em company pages
- **Integração**: 
  - `axios` - Requisições HTTP
- **Endpoint**: https://api.linkedin.com/v2
- **Configuração**: 
  - Access Token armazenado no banco (tabela `social_accounts`)
  - Requer app no LinkedIn Developers

### 8. WordPress REST API
- **Tipo**: API REST nativa do WordPress
- **Uso Principal**:
  - Publicação automática de conteúdo gerado
  - Gerenciamento de posts
- **Integração**: 
  - `axios` - Requisições HTTP
  - Autenticação via Application Password
- **Endpoint**: `{site_url}/wp-json/wp/v2`
- **Configuração**: 
  - URL, usuário e Application Password armazenados no banco (tabela `wordpress_sites`)
  - Configurado via interface da aplicação

### 9. Google News (Scraping)
- **Tipo**: Scraping de notícias
- **Uso Principal**:
  - Monitoramento de menções em notícias
  - Rastreamento de artigos sobre clientes
- **Integração**: 
  - `jsdom` - Parsing HTML/XML
  - `axios` - Requisições HTTP
- **Endpoint**: RSS feeds do Google News
- **Observação**: Não requer API key, mas pode ter rate limits

### 10. Vercel (Hosting + Cron Jobs)
- **Tipo**: Plataforma de deploy e hosting
- **Uso Principal**:
  - Hosting da aplicação Next.js
  - Cron jobs para tarefas agendadas
- **Cron Jobs configurados**:
  - `/api/cron/scrape-news` - Diário às 6h
  - `/api/cron/sync-social` - Diário às 12h
  - `/api/cron/calculate-reputation` - Diário à meia-noite
  - `/api/cron/check-serp` - Diário às 18h
- **Configuração**: `vercel.json`

## 📊 Resumo por Funcionalidade

### Funcionalidades que NÃO requerem variáveis extras:
- ✅ Autenticação de usuários (Supabase)
- ✅ Dashboard básico
- ✅ Gerenciamento de clientes
- ✅ Visualização de dados armazenados

### Funcionalidades que requerem variáveis específicas:

#### Geração de Conteúdo com IA
- ✅ `OPENAI_API_KEY` (obrigatória)
- Funcionalidade: Gerar artigos para blog

#### Monitoramento SERP
- ✅ `SERPAPI_KEY` (obrigatória)
- Funcionalidade: Rastrear posições no Google

#### Análise de Sentimento
- ✅ `OPENAI_API_KEY` (obrigatória)
- Funcionalidade: Analisar sentimento de menções

#### Alertas por E-mail
- ✅ `RESEND_API_KEY` (obrigatória)
- Funcionalidade: Enviar notificações por e-mail

#### Monitoramento de Redes Sociais
- ⚠️ Configuração no banco de dados (tabela `social_accounts`)
- Funcionalidade: Monitorar Instagram, Facebook, LinkedIn
- **Não requer variáveis de ambiente**, mas requer:
  - Access Tokens configurados via interface
  - Apps criados nas plataformas (Meta Developers, LinkedIn Developers)

#### Publicação no WordPress
- ⚠️ Configuração no banco de dados (tabela `wordpress_sites`)
- Funcionalidade: Publicar conteúdo automaticamente
- **Não requer variáveis de ambiente**, mas requer:
  - URL do site WordPress
  - Usuário com Application Password
  - Configurado via interface

## 🚀 Deploy - Checklist de Variáveis

### Mínimo necessário (funcionamento básico):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hyeifxvxifhrapfdvfry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### Recomendado (todas as funcionalidades):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hyeifxvxifhrapfdvfry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
OPENAI_API_KEY=sk-sua_chave_openai_aqui
SERPAPI_KEY=sua_chave_serpapi_aqui
RESEND_API_KEY=re_sua_chave_resend_aqui
NEXT_PUBLIC_APP_URL=https://norm-nessbr-projects.vercel.app
```

## 📝 Notas Importantes

1. **Variáveis NEXT_PUBLIC_**: Podem ser expostas no cliente (navegador)
2. **Variáveis sem NEXT_PUBLIC_**: Apenas no servidor (mais seguras)
3. **Configurações no banco**: Instagram, Facebook, LinkedIn e WordPress são configurados via interface, não via variáveis de ambiente
4. **Rate Limits**: SerpAPI e outras APIs têm rate limits configurados no código
5. **Custos**: Algumas APIs são pagas (OpenAI, SerpAPI). Verifique os planos.

## 🔗 Links Úteis

- Supabase Dashboard: https://app.supabase.com/project/hyeifxvxifhrapfdvfry
- OpenAI Dashboard: https://platform.openai.com
- SerpAPI Dashboard: https://serpapi.com/dashboard
- Resend Dashboard: https://resend.com/api-keys
- Meta Developers: https://developers.facebook.com
- LinkedIn Developers: https://www.linkedin.com/developers

