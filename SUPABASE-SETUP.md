# 🗄️ Supabase Setup Guide - nORM

Complete guide for setting up Supabase database for the nORM project.

## 📊 Project Information

- **Project Name**: nORM
- **Project URL**: https://hyeifxvxifhrapfdvfry.supabase.co
- **Project ID**: hyeifxvxifhrapfdvfry
- **Region**: East US (default)
- **Dashboard**: https://app.supabase.com/project/hyeifxvxifhrapfdvfry
- **MCP Access**: https://mcp.supabase.com/mcp?project_ref=hyeifxvxifhrapfdvfry

## 🔑 Getting API Keys

### 1. Navigate to API Settings

Go to: https://app.supabase.com/project/hyeifxvxifhrapfdvfry/settings/api

### 2. Copy the following keys:

- **Project URL**: Already set to `https://hyeifxvxifhrapfdvfry.supabase.co`
- **Anon/Public Key**: Copy and add to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key**: Copy and add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Never expose this publicly!)

## 📁 Database Schema

### Core Tables

The nORM database consists of the following main tables:

#### 1. Clients Management
```sql
-- clients: Client companies being monitored
-- client_users: User access to client accounts
```

#### 2. Reputation Monitoring
```sql
-- reputation_scores: Historical reputation scores
-- reputation_alerts: Critical alerts and incidents
```

#### 3. Media Monitoring
```sql
-- media_mentions: News articles and online mentions
```

#### 4. Social Media
```sql
-- social_accounts: Connected social media accounts
-- social_posts: Posts and mentions from social media
```

#### 5. Content Generation
```sql
-- content_posts: Blog posts and generated content
-- seo_keywords: Tracked keywords for SEO
```

#### 6. Backlinks
```sql
-- backlinks: Current backlinks
-- backlink_opportunities: Potential backlink opportunities
```

#### 7. Audit & Security
```sql
-- audit_logs: Complete audit trail
```

## 🚀 Setup Instructions

### Method 1: Using Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref hyeifxvxifhrapfdvfry

# 4. Create migration files (will be created in next steps)
cd /home/user/nORM
mkdir -p supabase/migrations

# 5. Apply migrations (after migrations are created)
supabase db push

# 6. Generate TypeScript types
supabase gen types typescript --project-id hyeifxvxifhrapfdvfry > lib/types/supabase.ts
```

### Method 2: Using Supabase Dashboard

1. Go to: https://app.supabase.com/project/hyeifxvxifhrapfdvfry/editor
2. Open SQL Editor
3. Run each migration file manually

## 📋 Database Migrations

### Migration Files Structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql          # Core tables
│   ├── 002_clients_and_users.sql       # Client management
│   ├── 003_reputation_monitoring.sql    # Reputation tracking
│   ├── 004_media_monitoring.sql         # News and media
│   ├── 005_social_media.sql             # Social platforms
│   ├── 006_content_generation.sql       # Content & SEO
│   ├── 007_backlinks.sql                # Backlink tracking
│   ├── 008_audit_logs.sql               # Security & audit
│   ├── 009_rls_policies.sql             # Row Level Security
│   └── 010_functions_and_triggers.sql   # Stored procedures
└── seed.sql                              # Sample data (optional)
```

### Creating Migrations

We'll create these migrations in the next steps. Each migration will:
- Create tables with proper constraints
- Add indexes for performance
- Set up Row Level Security (RLS)
- Create triggers for audit logging

## 🔐 Row Level Security (RLS)

RLS will be enabled on ALL tables to ensure users can only access data they're authorized for.

**Policies Pattern:**
```sql
-- Users can only read their own client data
CREATE POLICY "Users read own clients"
  ON clients FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM client_users WHERE client_id = clients.id
  ));

-- Admins can manage everything
CREATE POLICY "Admins full access"
  ON clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM client_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## ⚙️ Supabase Functions (Edge Functions)

### Background Jobs

Create Edge Functions for async processing:

```bash
# Structure
supabase/functions/
├── scrape-news/
│   ├── index.ts
│   └── deno.json
├── sync-social-media/
│   ├── index.ts
│   └── deno.json
└── calculate-reputation/
    ├── index.ts
    └── deno.json
```

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy scrape-news
supabase functions deploy sync-social-media
supabase functions deploy calculate-reputation

# Set secrets (never commit these!)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set NEWS_API_KEY=your-key
supabase secrets set TWITTER_BEARER_TOKEN=your-token
```

### Invoke Functions Manually

```bash
# Test news scraping
supabase functions invoke scrape-news --data '{"client_id":"uuid-here"}'

# Test social sync
supabase functions invoke sync-social-media --data '{"client_id":"uuid-here"}'
```

## 🕐 Cron Jobs

Set up scheduled jobs using Supabase's pg_cron extension:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule reputation score calculation (every hour)
SELECT cron.schedule(
  'calculate-reputation-scores',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hyeifxvxifhrapfdvfry.supabase.co/functions/v1/calculate-reputation',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );
  $$
);

-- Schedule news scraping (every hour)
SELECT cron.schedule(
  'scrape-news',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hyeifxvxifhrapfdvfry.supabase.co/functions/v1/scrape-news',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );
  $$
);

-- Schedule social media sync (every 15 minutes)
SELECT cron.schedule(
  'sync-social-media',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hyeifxvxifhrapfdvfry.supabase.co/functions/v1/sync-social-media',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );
  $$
);
```

## 🔍 Database Access

### Access via MCP (Model Context Protocol)

Para acessar o Supabase via MCP no Cursor ou outras ferramentas compatíveis:

**URL MCP**: https://mcp.supabase.com/mcp?project_ref=hyeifxvxifhrapfdvfry

**Configuração no Cursor**:
1. Abra as configurações do Cursor
2. Navegue até MCP Settings
3. Adicione o servidor MCP do Supabase com a URL acima
4. O MCP permitirá acesso direto ao banco de dados, schema, e funcionalidades do Supabase

**Benefícios do MCP**:
- Acesso direto ao schema do banco de dados
- Consultas SQL via interface
- Gerenciamento de tabelas e migrations
- Visualização de dados em tempo real
- Integração com ferramentas de IA para análise de dados

### Using Supabase Client (Next.js)

```typescript
// lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// lib/supabase/server.ts (server)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### Direct Database Connection

For admin tasks or local development:

```bash
# Connection string format:
postgresql://postgres:[YOUR-PASSWORD]@db.hyeifxvxifhrapfdvfry.supabase.co:5432/postgres

# Get your password from:
# https://app.supabase.com/project/hyeifxvxifhrapfdvfry/settings/database
```

## 📊 Monitoring & Performance

### Enable Realtime (if needed)

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE reputation_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE reputation_alerts;
```

### Indexes for Performance

All migrations include proper indexes, but here are key ones:

```sql
-- Client lookups
CREATE INDEX idx_clients_active ON clients(is_active) WHERE is_active = true;

-- Reputation scores by client and date
CREATE INDEX idx_reputation_scores_client_date ON reputation_scores(client_id, calculated_at DESC);

-- Media mentions by client and sentiment
CREATE INDEX idx_media_mentions_client_sentiment ON media_mentions(client_id, sentiment, published_at DESC);

-- Audit logs by date (for compliance)
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

## 🔧 Environment Variables Setup

### Local Development (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hyeifxvxifhrapfdvfry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Vercel Production

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hyeifxvxifhrapfdvfry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🧪 Testing Database Connection

Create a test file to verify connection:

```typescript
// scripts/test-supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('clients').select('count')

    if (error) throw error

    console.log('✅ Supabase connection successful!')
    console.log('Clients count:', data)
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
  }
}

testConnection()
```

Run with:
```bash
npx tsx scripts/test-supabase.ts
```

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript/introduction
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

## 🆘 Troubleshooting

### Issue: "Invalid API key"
**Solution**: Double-check your keys in the Supabase dashboard. Make sure you're using the correct project keys.

### Issue: "Row level security policy violation"
**Solution**: RLS policies need to be set up. Run migration 009_rls_policies.sql.

### Issue: "Connection timeout"
**Solution**: Check if your IP is allowed. Supabase allows all IPs by default, but verify in Settings → Database → Connection pooling.

### Issue: "Function not found"
**Solution**: Deploy Edge Functions using `supabase functions deploy <function-name>`.

---

**Last updated**: 2025-11-06
**Project**: nORM v1.0.0
**Supabase Project ID**: hyeifxvxifhrapfdvfry
