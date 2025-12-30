# nORM - Next Online Reputation Manager

<div align="center">

**Sistema inteligente de gerenciamento de reputação online com IA**

Monitoramento SERP • Análise de Sentimento • Geração de Conteúdo • Alertas em Tempo Real

[Demo](https://norm-reputation.vercel.app) • [Documentação](#-documentação) • [Deploy](#-deploy)

<br/>

**🆓 100% Funciona com Planos Gratuitos! (Vercel FREE + Supabase FREE + GitHub Actions)**

💰 **Custo de infra: $0/mês** | Apenas APIs externas (~$250-350/mês)

</div>

---

## 📖 Sobre o Projeto

nORM é uma plataforma completa de gerenciamento de reputação online que combina:

- 🔍 **Monitoramento SERP**: Rastreamento de posições no Google (google.com.br) para palavras-chave configuradas
- 📱 **Redes Sociais**: Monitoramento de menções no Instagram, LinkedIn e Facebook
- 🤖 **IA Generativa**: Geração automática de conteúdo otimizado para SEO usando GPT-4
- 📊 **Score de Reputação**: Cálculo de score 0-100 baseado em múltiplos fatores
- 🚨 **Alertas Inteligentes**: Notificações em tempo real quando conteúdo negativo é detectado
- 📰 **News Monitoring**: Rastreamento de menções em Google News Brasil
- 🎯 **Foco no Brasil**: Otimizado para google.com.br e conteúdo PT-BR

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL, Auth, Storage)
- **Tailwind CSS** + **shadcn/ui**
- **OpenAI GPT-4** (Geração de conteúdo)
- **SerpAPI** (Rastreamento SERP)
- **Recharts** (Gráficos)
- **next-intl** (Internacionalização)

## 💰 Custos

### Infraestrutura: **$0/mês** (FREE tier)
- ✅ **Vercel FREE**: Deployments ilimitados, 100GB bandwidth
- ✅ **Supabase FREE**: 500MB DB, 2GB bandwidth, 50k MAU
- ✅ **GitHub Actions FREE**: 2000 min/mês (privado), ilimitado (público)

### APIs Externas: **~$250-350/mês**
- OpenAI GPT-4: $200-300 (geração de conteúdo + sentiment)
- SerpAPI: $50 (tracking Google)
- Resend: $0 (até 3k emails grátis)
- Meta/LinkedIn APIs: $0 (grátis)

**Total estimado: $250-350/mês** (vs $340-440/mês com planos pagos)

📚 **[Ver guia completo FREE tier →](FREE-TIER-SETUP.md)**

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (FREE)
- Conta Vercel (FREE)
- Conta GitHub (FREE)
- Chaves de API (OpenAI, SerpAPI, etc.)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/resper1965/nORM.git
cd nORM
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves de API.

4. Execute as migrations do Supabase:
```bash
# Execute os arquivos em supabase/migrations/ no Supabase SQL Editor
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
nORM/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Rotas internacionalizadas
│   │   ├── (auth)/        # Páginas de autenticação
│   │   └── (dashboard)/   # Páginas do dashboard
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── dashboard/         # Componentes do dashboard
│   ├── social/            # Componentes de redes sociais
│   └── ui/                # Componentes UI reutilizáveis
├── lib/                   # Bibliotecas e utilitários
│   ├── ai/                # Integração OpenAI
│   ├── reputation/        # Lógica de reputação
│   ├── scraping/          # Scrapers (SERP, Google News)
│   ├── social/            # Integrações sociais
│   └── supabase/          # Cliente Supabase
├── supabase/
│   └── migrations/        # Migrations SQL
└── .specify/              # Documentação do projeto
```

## ✨ Features

### Core Features (MVP)
- ✅ **Dashboard de Reputação**: Visualização unificada de score, alertas e tendências
- ✅ **Monitoramento SERP**: Tracking de posições no Google para 5-10 keywords por cliente
- ✅ **Análise de Sentimento**: Análise automática de sentimento usando GPT-4 (90%+ confiança)
- ✅ **Geração de Conteúdo**: 3-5 artigos SEO-otimizados (800-1500 palavras) por click
- ✅ **Monitoramento Social**: Instagram, LinkedIn e Facebook integrados
- ✅ **Alertas em Tempo Real**: Email/notificações quando eventos críticos ocorrem
- ✅ **Integração WordPress**: Publicação automática de conteúdo como rascunhos
- ✅ **Multi-cliente**: Gerenciamento de 5-10 clientes simultaneamente
- ✅ **Internacionalização**: Suporte PT-BR/EN com next-intl
- ✅ **Cost Tracking**: Monitoramento de custos de APIs e budget alerts
- ✅ **Performance Monitoring**: Métricas de performance e Web Vitals

### Formula do Score de Reputação
```
score = (
  serpPosition × 0.35 +      // 35% - Posição média no Google
  newsSentiment × 0.25 +     // 25% - Sentimento de notícias
  socialSentiment × 0.20 +   // 20% - Sentimento redes sociais
  trendDirection × 0.15 +    // 15% - Tendência (subindo/descendo)
  mentionVolume × 0.05       // 5% - Volume de menções
) × 10
```

## 🏗️ Arquitetura

### Stack Tecnológico
```
Frontend:
├── Next.js 14 (App Router)
├── React 18 (Server Components)
├── TypeScript 5.5+
├── Tailwind CSS + shadcn/ui
└── next-intl (i18n)

Backend:
├── Supabase (PostgreSQL + Auth)
├── Edge Functions (Deno)
└── Row Level Security (RLS)

Integrações:
├── OpenAI GPT-4 (content + sentiment)
├── SerpAPI (Google tracking)
├── Meta Graph API (Instagram/Facebook)
├── LinkedIn API v2
├── WordPress REST API
└── Resend (email notifications)

Deploy:
├── Vercel (frontend + serverless)
└── Supabase (database + auth)
```

### Cron Jobs (Vercel)
```
- /api/cron/calculate-reputation → Diariamente às 00:00
- /api/cron/sync-social → A cada 6 horas
- /api/cron/check-serp → A cada 6 horas
- /api/cron/scrape-news → Diariamente às 08:00
- /api/cron/send-alerts → A cada 15 minutos
- /api/cron/auto-generate-content → Diariamente às 10:00
```

## 🧪 Testes

### Executar Testes
```bash
# Unit tests
npm run test

# Unit tests com UI
npm run test:ui

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E com UI
npm run test:e2e:ui
```

### Cobertura de Testes
- ✅ Unit Tests: Reputation Calculator, Sentiment Analysis
- ✅ Integration Tests: API endpoints, Authentication
- ✅ E2E Tests: Dashboard, Client Management, Content Generation
- 🎯 Target: 80% code coverage

## 🔧 Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint
- `npm test` - Executa testes unitários
- `npm run test:coverage` - Executa testes com coverage
- `npm run test:e2e` - Executa testes E2E

## 📚 Documentação

- [Plano Técnico](.specify/specs/001-reputation-dashboard-mvp/plan.md)
- [Modelo de Dados](.specify/specs/001-reputation-dashboard-mvp/data-model.md)
- [Quickstart](.specify/specs/001-reputation-dashboard-mvp/quickstart.md)
- [Setup Supabase](SUPABASE-SETUP.md)

## 🚢 Deploy

### Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente Necessárias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `SERPAPI_API_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## 📝 Licença

MIT
