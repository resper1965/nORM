# nORM - Next Online Reputation Manager

Sistema de gerenciamento de reputação online com monitoramento SERP, análise de sentimento e geração de conteúdo com IA.

## Sobre

nORM monitora a reputação online de clientes através de:
- Monitoramento SERP (posições no Google)
- Análise de sentimento em notícias e redes sociais
- Geração automática de conteúdo otimizado para SEO
- Alertas em tempo real
- Score de reputação (0-100)

## Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (PostgreSQL, Auth)
- Tailwind CSS + shadcn/ui
- OpenAI GPT-4
- SerpAPI

## Instalação

```bash
git clone https://github.com/resper1965/nORM.git
cd nORM
npm install
cp .env.example .env.local
# Configure .env.local com suas chaves de API
npm run dev
```

## Estrutura

```
app/              # Next.js App Router
components/        # Componentes React
lib/              # Lógica de negócio
  ├── ai/         # Integração IA
  ├── reputation/ # Cálculo de score
  ├── scraping/   # Scrapers
  └── social/     # Integrações sociais
supabase/         # Migrations SQL
```

## Features

- Dashboard de reputação
- Monitoramento SERP (Google)
- Análise de sentimento (GPT-4)
- Geração de conteúdo (3-5 artigos por click)
- Monitoramento social (Instagram, LinkedIn, Facebook)
- Alertas por email
- Integração WordPress
- Multi-cliente
- Internacionalização (PT-BR, EN, ES)

## Score de Reputação

```
score = (
  serpPosition × 0.35 +
  newsSentiment × 0.25 +
  socialSentiment × 0.20 +
  trendDirection × 0.15 +
  mentionVolume × 0.05
) × 10
```

## Cron Jobs

- `/api/cron/calculate-reputation` - Diariamente 00:00
- `/api/cron/sync-social` - A cada 6 horas
- `/api/cron/check-serp` - A cada 6 horas
- `/api/cron/scrape-news` - Diariamente 08:00
- `/api/cron/send-alerts` - A cada 15 minutos

## Testes

```bash
npm test              # Unit tests
npm run test:coverage # Com cobertura
npm run test:e2e      # E2E tests
```

## Deploy

### Vercel

1. Conecte o repositório
2. Configure variáveis de ambiente
3. Deploy automático

### Variáveis de Ambiente

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `SERPAPI_KEY`
- `RESEND_API_KEY`

## Documentação

- [Setup](docs/setup/SUPABASE-SETUP.md)
- [Deploy](docs/setup/VERCEL-DEPLOY.md)
- [API](docs/api/API-DOCUMENTATION.md)
- [Contribuindo](CONTRIBUTING.md)

## Licença

MIT
