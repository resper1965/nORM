# nORM - Next Online Reputation Manager

Sistema de gerenciamento de reputação online com IA, monitoramento de SERP, redes sociais e geração automática de conteúdo.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL, Auth, Storage)
- **Tailwind CSS** + **shadcn/ui**
- **OpenAI GPT-4** (Geração de conteúdo)
- **SerpAPI** (Rastreamento SERP)
- **Recharts** (Gráficos)
- **next-intl** (Internacionalização)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase
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

## 🔧 Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint
- `npm test` - Executa testes

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
