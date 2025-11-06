# Quickstart Guide: nORM Development

**Feature**: `001-reputation-dashboard-mvp`  
**Date**: 2025-11-06  
**Target**: Get developers up and running in 5 minutes

## Prerequisites

- **Node.js**: 18+ (check with `node --version`)
- **npm**: 9+ (check with `npm --version`)
- **Git**: Latest version
- **Supabase Account**: Free tier is sufficient
- **OpenAI API Key**: For AI features (get from https://platform.openai.com/api-keys)
- **SerpAPI Account**: For SERP tracking (free trial available)

## 5-Minute Setup

### Step 1: Clone and Install (1 minute)

```bash
# Clone repository
git clone https://github.com/resper1965/nORM.git
cd nORM

# Install dependencies
npm install
```

The `postinstall` script will automatically:
- Set up BMAD Method framework
- Check for BMAD updates
- Verify project structure

### Step 2: Environment Variables (2 minutes)

```bash
# Copy example env file
cp .env.example .env.local
```

Edit `.env.local` and add:

```bash
# Supabase (get from https://app.supabase.com/project/hyeifxvxifhrapfdvfry/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://hyeifxvxifhrapfdvfry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# SerpAPI (get from https://serpapi.com/dashboard)
SERPAPI_KEY=your-serpapi-key-here

# Resend (for emails - get from https://resend.com/api-keys)
RESEND_API_KEY=re_your-key-here

# App URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important**: Never commit `.env.local` to git!

### Step 3: Database Setup (1 minute)

```bash
# Option A: Using Supabase CLI (recommended)
npm install -g supabase
supabase login
supabase link --project-ref hyeifxvxifhrapfdvfry

# Apply database schema
supabase db push

# Generate TypeScript types
supabase gen types typescript --project-id hyeifxvxifhrapfdvfry > lib/types/supabase.ts
```

**Option B: Using Supabase Dashboard**

1. Go to: https://app.supabase.com/project/hyeifxvxifhrapfdvfry/editor
2. Open SQL Editor
3. Copy and run: `.specify/specs/001-reputation-dashboard-mvp/contracts/supabase-schema.sql`

### Step 4: Run Development Server (1 minute)

```bash
# Start Next.js dev server
npm run dev
```

Open http://localhost:3000 in your browser.

**✅ You're ready to code!**

## Project Structure Overview

```
nORM/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalization
│   │   ├── (dashboard)/   # Dashboard routes
│   │   └── api/           # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── social/            # Social media components
│   ├── content/           # Content generation UI
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and services
│   ├── ai/                # OpenAI integration
│   ├── scraping/          # SERP and news scraping
│   ├── social/            # Social media APIs
│   ├── wordpress/         # WordPress integration
│   ├── reputation/        # Reputation score logic
│   └── supabase/          # Supabase clients
├── supabase/              # Supabase backend
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge Functions
└── tests/                 # Test files
```

## Common Development Tasks

### Add a New Component

```bash
# Add shadcn/ui component
npx shadcn@latest add button

# Create custom component
touch components/dashboard/my-component.tsx
```

### Create Database Migration

```bash
# Create new migration
supabase migration new add_new_feature

# Edit the migration file in supabase/migrations/
# Then apply it
supabase db push
```

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Generate Types from Database

```bash
# Regenerate TypeScript types after schema changes
supabase gen types typescript --project-id hyeifxvxifhrapfdvfry > lib/types/supabase.ts
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Run linter
npm run lint

# Run tests
npm run test

# Commit changes
git commit -m "feat: add my feature"
```

### 2. Database Changes

```bash
# Create migration
supabase migration new my_migration

# Edit supabase/migrations/XXXXXX_my_migration.sql
# Apply migration
supabase db push

# Update TypeScript types
supabase gen types typescript --project-id hyeifxvxifhrapfdvfry > lib/types/supabase.ts
```

### 3. API Development

```bash
# Create API route
touch app/api/my-endpoint/route.ts

# Test locally
curl http://localhost:3000/api/my-endpoint
```

## Key Files to Know

### Configuration Files

- **`next.config.js`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS configuration
- **`tsconfig.json`**: TypeScript configuration
- **`package.json`**: Dependencies and scripts

### Important Directories

- **`app/[locale]/(dashboard)/`**: Main application routes
- **`lib/`**: Business logic and utilities
- **`components/`**: React components
- **`supabase/migrations/`**: Database migrations
- **`.specify/specs/001-reputation-dashboard-mvp/`**: Feature specifications

## API Endpoints

### Local Development

All API routes are available at: `http://localhost:3000/api/`

**Key Endpoints**:
- `GET /api/health` - Health check
- `GET /api/clients` - List clients
- `GET /api/clients/:id/reputation` - Get reputation score
- `POST /api/generate-content` - Generate AI content
- `GET /api/social/mentions` - Get social mentions
- `POST /api/wordpress/publish` - Publish to WordPress

See [contracts/api-spec.json](./contracts/api-spec.json) for full API documentation.

## Database Access

### Access via MCP (Model Context Protocol)

Para acessar o Supabase via MCP no Cursor:

**URL MCP**: https://mcp.supabase.com/mcp?project_ref=hyeifxvxifhrapfdvfry

**Configuração**:
1. Abra as configurações do Cursor
2. Navegue até MCP Settings
3. Adicione o servidor MCP do Supabase com a URL acima
4. O MCP permitirá acesso direto ao banco de dados e schema

### Using Supabase Client

```typescript
// Browser client
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server client
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

### Direct SQL Access

```bash
# Connect via psql
psql postgresql://postgres:[PASSWORD]@db.hyeifxvxifhrapfdvfry.supabase.co:5432/postgres

# Or use Supabase Dashboard SQL Editor
# https://app.supabase.com/project/hyeifxvxifhrapfdvfry/editor
```

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test lib/reputation/calculator.test.ts

# Watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

### Manual Testing

1. **Dashboard**: http://localhost:3000/dashboard
2. **API Health**: http://localhost:3000/api/health
3. **Database**: Check Supabase Dashboard

## Troubleshooting

### Issue: "Module not found"

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Issue: "Supabase connection failed"

1. Check `.env.local` has correct keys
2. Verify Supabase project is active
3. Check network connection

### Issue: "TypeScript errors"

```bash
# Regenerate types
supabase gen types typescript --project-id hyeifxvxifhrapfdvfry > lib/types/supabase.ts

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue: "Database migration failed"

```bash
# Check migration status
supabase migration list

# Reset database (⚠️ destroys data)
supabase db reset

# Or fix migration manually in Supabase Dashboard
```

## Next Steps

1. **Read the Spec**: [spec.md](./spec.md) - Full feature specification
2. **Review the Plan**: [plan.md](./plan.md) - Technical implementation plan
3. **Check Data Model**: [data-model.md](./data-model.md) - Database schema
4. **API Documentation**: [contracts/api-spec.json](./contracts/api-spec.json) - API contracts

## Getting Help

- **Documentation**: Check `.specify/specs/001-reputation-dashboard-mvp/` directory
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Issues**: Create GitHub issue for bugs

## Development Checklist

Before starting work on a feature:

- [ ] Read the feature spec in `spec.md`
- [ ] Review technical plan in `plan.md`
- [ ] Check data model in `data-model.md`
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Verify tests pass: `npm run test`
- [ ] Start dev server: `npm run dev`

---

**Happy coding! 🚀**

