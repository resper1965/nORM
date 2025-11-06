# Implementation Plan: nORM - Online Reputation Dashboard MVP

**Branch**: `001-reputation-dashboard-mvp` | **Date**: 2025-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-reputation-dashboard-mvp/spec.md`

## Summary

Build an AI-powered online reputation management system that monitors Google SERP positions, social media mentions (Instagram, LinkedIn, Facebook), and news articles in Brazilian market (google.com.br, PT-BR). When negative content is detected, automatically generate 3-5 SEO-optimized counter-articles using OpenAI GPT-4 and publish to WordPress as drafts. Calculate reputation score (0-100) from Google position (35%), news sentiment (25%), social sentiment (20%), trend (15%), and volume (5%). Deploy as Next.js 14 app on Vercel with Supabase backend. Target: 2-4 weeks for solo founder, $345-545/month API budget.

## Technical Context

**Language/Version**: TypeScript 5.5+ (strict mode), Node.js 18+

**Framework**: Next.js 14 with App Router, React 18, shadcn/ui components

**Primary Dependencies**:
- OpenAI SDK (GPT-4 for content generation and sentiment analysis)
- SerpAPI (Google position tracking for google.com.br)
- Meta Graph API (Instagram + Facebook)
- LinkedIn API v2 (LinkedIn monitoring)
- WordPress REST API client
- Supabase JS Client (@supabase/ssr)
- Zod (schema validation)
- Recharts (dashboard charts)

**Storage**:
- Supabase PostgreSQL (primary database)
  - Tables: clients, keywords, serp_results, news_mentions, social_posts, generated_content, reputation_scores, alerts, audit_logs
  - Row Level Security (RLS) enabled on all tables
- Supabase Storage (for Instagram Story screenshots, future images)

**Testing**:
- Vitest (unit tests - 80% coverage target)
- Playwright (E2E tests for critical user flows)
- React Testing Library (component tests)
- MSW (Mock Service Worker for API mocking)

**Target Platform**:
- Frontend: Vercel Edge (global CDN)
- Backend: Supabase Edge Functions (Deno runtime)
- Database: Supabase hosted PostgreSQL (AWS region: East US)

**Project Type**: Web application (Next.js fullstack with Supabase backend)

**Performance Goals**:
- Dashboard LCP < 2.5s (Core Web Vitals)
- SERP check for 10 keywords < 30s
- AI content generation (5 articles) < 5 minutes
- Social media polling cycle < 15 minutes
- Database queries < 200ms (p95)

**Constraints**:
- API budget: $345-545/month maximum
- Development time: 2-4 weeks (solo founder)
- Geographic focus: Brazil only (google.com.br, PT-BR content)
- Content language: Portuguese (PT-BR) exclusively in MVP
- Sentiment confidence: ≥90% for auto-actions, <90% flag for review
- Data retention: 90 days minimum for SERP/mentions, 1 year for audit logs

**Scale/Scope**:
- MVP: 5-10 clients
- Keywords per client: 5-10
- Total SERP checks: 50-100/day
- Social media accounts: 3 platforms × 5-10 clients = 15-30 accounts
- Generated articles: ~50-75/month
- Database size estimate: <1GB in first 3 months

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Privacy & Compliance (NON-NEGOTIABLE)
- [x] All social media tokens encrypted (AES-256) in database
- [x] WordPress credentials encrypted
- [x] OpenAI API key stored as Supabase secret (not in code)
- [x] Audit logs table with RLS (1 year retention)
- [x] User consent flow before data collection (dashboard onboarding)
- [x] Data export endpoint (JSON format)
- [x] Data deletion endpoint (30-day SLA)
- [x] Privacy policy page (PT-BR) before account creation

**Status**: ✅ PASS - All encryption and compliance requirements addressed

### ✅ II. AI Quality & Transparency
- [x] Sentiment analysis confidence threshold: ≥0.9 for auto-action, <0.9 flagged
- [x] Reputation score breakdown UI (show weighted factors)
- [x] AI-generated content marked with badge + requires approval
- [x] Multiple sentiment models: OpenAI GPT-4 (primary), fallback to GPT-3.5-turbo
- [x] "Explain Score" expandable tooltip on dashboard
- [x] A/B testing: compare GPT-4 vs GPT-3.5 sentiment quarterly (log differences)

**Status**: ✅ PASS - Transparency and quality thresholds defined

### ✅ III. Ethical Data Collection
- [x] Respect robots.txt (check before scraping)
- [x] Rate limiting: max 1 req/s per domain (exponential backoff on 429)
- [x] No content manipulation (display original + generated separately)
- [x] Attribution: all news articles link to source
- [x] No fake news generation (prompt engineering guards)
- [x] Only public data (no login-required content)

**Status**: ✅ PASS - Ethical scraping and attribution enforced

### ✅ IV. Architecture & Performance Excellence
- [x] Next.js 14 App Router with Server Components
- [x] TypeScript strict mode
- [x] Supabase RLS on all tables
- [x] Edge Functions for async jobs (news scraping, social sync, score calc)
- [x] Caching strategy:
  - AI responses: 1h (Redis/Upstash in future, memory cache in MVP)
  - News articles: 4h
  - Social mentions: 15min
  - SERP results: 24h
- [x] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [x] Progressive enhancement: works without JS (Server Components)

**Status**: ✅ PASS - Modern stack with performance optimization

### ✅ V. Testing & Quality Assurance (NON-NEGOTIABLE)
- [x] 80% unit test coverage (Vitest) for:
  - Reputation score calculation
  - Sentiment analysis logic
  - SERP position extraction
  - Content generation prompts
- [x] Integration tests for:
  - Supabase queries
  - OpenAI API calls (mocked)
  - WordPress API (mocked)
- [x] E2E tests (Playwright):
  - Signup → Add client → View dashboard
  - Generate content → Publish to WordPress
  - Receive alert → Respond to crisis
- [x] CI/CD gates: tests pass, TypeScript compiles, lint passes, no critical CVEs
- [x] Manual QA: Review first 10 AI-generated articles before production

**Status**: ✅ PASS - Comprehensive testing strategy defined

### ✅ VI. Security First
- [x] Supabase Auth with MFA support (optional for users)
- [x] RBAC: admin (full access), editor (content only), viewer (read-only)
- [x] Encrypted credentials: AES-256 with per-user keys
- [x] Security headers in vercel.json (CSP, X-Frame-Options, etc.)
- [x] Rate limiting: 100 req/min per user (future: Upstash Redis)
- [x] Input sanitization: Zod schemas on all forms
- [x] Dependency scanning: npm audit in CI/CD

**Status**: ✅ PASS - Defense-in-depth security

### ✅ VII. Internationalization & Accessibility
- [x] UI in PT-BR (next-intl configured)
- [x] i18n strings for all UI text
- [x] Date/currency formatting: Brazilian locale
- [x] WCAG 2.1 AA: semantic HTML, ARIA labels, keyboard nav, 4.5:1 contrast
- [x] Screen reader testing: Dashboard and content editor
- [x] Mobile-first responsive design
- [x] Dark mode supported

**Status**: ✅ PASS - PT-BR locale with accessibility

### ✅ VIII. Documentation & Knowledge Sharing
- [x] README.md with 5-minute setup
- [x] This plan.md (technical architecture)
- [x] data-model.md (Phase 1)
- [x] contracts/api-spec.json (Phase 1)
- [x] quickstart.md (Phase 1)
- [x] JSDoc on exported functions
- [x] Conventional Commits (feat, fix, docs, etc.)
- [x] VERCEL-DEPLOY.md and SUPABASE-SETUP.md already created

**Status**: ✅ PASS - Documentation planned

### ✅ IX. User Experience Excellence
- [x] Loading states: Skeleton loaders on dashboard cards
- [x] Error boundaries: React Error Boundary on main dashboard
- [x] User-friendly errors: "Failed to connect to WordPress. [Reconnect]"
- [x] Immediate feedback: Toasts on actions (saving, publishing, etc.)
- [x] Optimistic UI: Update score locally before server confirms
- [x] Onboarding: Guided tour for first-time users (react-joyride)

**Status**: ✅ PASS - UX patterns defined

### ✅ X. Cost Optimization & Sustainability
- [x] Real-time cost tracking: Log OpenAI tokens, SERP API calls
- [x] Budget alerts: Email at 80% and 100% of $545/month
- [x] Caching: Reduce duplicate API calls
- [x] Batch processing: Check all keywords in single SERP API request
- [x] Feature flags: Disable expensive features if budget exceeded
- [x] Tiered pricing future: Free (manual only), Pro (50 articles/mo), Enterprise (unlimited)

**Status**: ✅ PASS - Cost monitoring planned

**Overall Constitution Compliance**: ✅ PASS (10/10 principles satisfied)

## Project Structure

### Documentation (this feature)

```text
specs/001-reputation-dashboard-mvp/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions and best practices
├── data-model.md        # Phase 1: Database schema and entity relationships
├── quickstart.md        # Phase 1: Developer onboarding guide
├── contracts/           # Phase 1: API specifications
│   ├── api-spec.json    # OpenAPI 3.0 spec for REST endpoints
│   └── supabase-schema.sql # Database schema DDL
└── tasks.md             # Phase 2: Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
nORM/
├── app/                          # Next.js 14 App Router
│   ├── [locale]/                 # Internationalization wrapper
│   │   ├── (dashboard)/          # Dashboard route group
│   │   │   ├── page.tsx          # Main dashboard (reputation score, SERP grid, alerts)
│   │   │   ├── clients/          # Client management
│   │   │   │   ├── page.tsx      # Client list
│   │   │   │   ├── [id]/         # Client details
│   │   │   │   │   ├── page.tsx  # Single client dashboard
│   │   │   │   │   ├── keywords/page.tsx  # Keyword management
│   │   │   │   │   └── settings/page.tsx  # Client settings (WordPress, social)
│   │   │   ├── reputation/       # Reputation monitoring
│   │   │   │   ├── page.tsx      # SERP tracking dashboard
│   │   │   │   └── alerts/page.tsx # Alerts history
│   │   │   ├── social/           # Social media monitoring
│   │   │   │   ├── page.tsx      # Unified social feed
│   │   │   │   └── [platform]/page.tsx # Platform-specific view
│   │   │   ├── content/          # Content generation
│   │   │   │   ├── page.tsx      # Content library
│   │   │   │   ├── new/page.tsx  # Generate new articles
│   │   │   │   └── [id]/page.tsx # Edit article
│   │   │   └── settings/page.tsx # User settings
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── api/                  # API routes
│   │   │   ├── cron/             # Cron job endpoints (for Vercel)
│   │   │   │   ├── scrape-news/route.ts
│   │   │   │   ├── sync-social/route.ts
│   │   │   │   └── calculate-reputation/route.ts
│   │   │   ├── generate-content/route.ts # AI content generation
│   │   │   └── health/route.ts   # Health check endpoint
│   │   ├── layout.tsx            # Root layout
│   │   ├── loading.tsx           # Global loading state
│   │   ├── error.tsx             # Global error boundary
│   │   └── not-found.tsx         # 404 page
│   └── globals.css               # Global styles + Tailwind
│
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── reputation-score-card.tsx
│   │   ├── serp-position-grid.tsx
│   │   ├── alerts-list.tsx
│   │   ├── reputation-timeline.tsx
│   │   └── score-breakdown-tooltip.tsx
│   ├── social/                   # Social media components
│   │   ├── social-mention-card.tsx
│   │   ├── sentiment-badge.tsx
│   │   ├── platform-icon.tsx
│   │   └── social-feed.tsx
│   ├── content/                  # Content generation components
│   │   ├── content-editor.tsx
│   │   ├── seo-score-panel.tsx
│   │   ├── ai-suggestions.tsx
│   │   └── article-preview.tsx
│   ├── ui/                       # shadcn/ui components (already exists)
│   └── providers.tsx             # React Context providers
│
├── lib/                          # Utilities and services
│   ├── ai/                       # AI/LLM integrations
│   │   ├── openai.ts             # OpenAI client wrapper
│   │   ├── sentiment.ts          # Sentiment analysis
│   │   ├── content-generator.ts  # Article generation
│   │   └── prompts.ts            # LLM prompts (versioned)
│   ├── scraping/                 # Web scraping
│   │   ├── serp.ts               # SerpAPI integration
│   │   ├── google-news.ts        # Google News scraper
│   │   └── rate-limiter.ts       # Rate limiting utility
│   ├── social/                   # Social media APIs
│   │   ├── instagram.ts          # Instagram Graph API
│   │   ├── linkedin.ts           # LinkedIn API
│   │   ├── facebook.ts           # Facebook Graph API
│   │   └── unified-feed.ts       # Aggregate social mentions
│   ├── wordpress/                # WordPress integration
│   │   ├── client.ts             # WordPress REST API client
│   │   └── publisher.ts          # Publish articles as drafts
│   ├── supabase/                 # Supabase clients (already exists)
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── reputation/               # Reputation score logic
│   │   ├── calculator.ts         # Score calculation algorithm
│   │   ├── trend-analyzer.ts     # Trend detection
│   │   └── alert-generator.ts    # Alert rules
│   ├── types/                    # TypeScript types
│   │   ├── supabase.ts           # Generated Supabase types
│   │   ├── api.ts                # API request/response types
│   │   └── domain.ts             # Domain models (Client, Keyword, etc.)
│   ├── utils/                    # General utilities (already exists)
│   │   ├── logger.ts
│   │   └── validation.ts
│   └── config/                   # Configuration (already exists)
│       └── env.ts
│
├── supabase/                     # Supabase backend
│   ├── migrations/               # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_clients_and_users.sql
│   │   ├── 003_reputation_monitoring.sql
│   │   ├── 004_media_monitoring.sql
│   │   ├── 005_social_media.sql
│   │   ├── 006_content_generation.sql
│   │   ├── 007_alerts.sql
│   │   ├── 008_audit_logs.sql
│   │   └── 009_rls_policies.sql
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── scrape-news/
│   │   │   └── index.ts          # Scheduled news scraping
│   │   ├── sync-social-media/
│   │   │   └── index.ts          # Poll social media APIs
│   │   └── calculate-reputation/
│   │       └── index.ts          # Recalculate reputation scores
│   └── seed.sql                  # Sample data for development
│
├── tests/                        # Test files
│   ├── unit/                     # Unit tests (Vitest)
│   │   ├── lib/ai/sentiment.test.ts
│   │   ├── lib/reputation/calculator.test.ts
│   │   └── lib/scraping/serp.test.ts
│   ├── integration/              # Integration tests
│   │   ├── api/generate-content.test.ts
│   │   └── supabase/clients.test.ts
│   └── e2e/                      # End-to-end tests (Playwright)
│       ├── signup-flow.spec.ts
│       ├── generate-content.spec.ts
│       └── dashboard.spec.ts
│
├── public/                       # Static assets
├── i18n/                         # Internationalization (already exists)
├── .specify/                     # Spec-driven dev (already exists)
├── .claude/                      # Claude Code commands (already exists)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── vercel.json                   # Vercel deployment config (already exists)
├── .env.local                    # Local environment variables
├── .env.example                  # Example env vars (already exists)
└── README.md
```

**Structure Decision**: Next.js 14 App Router with feature-based organization. Backend logic lives in Supabase Edge Functions (Deno runtime) rather than Next.js API routes for better scalability and cost (Edge Functions are free up to 2M invocations/month). Frontend uses Server Components by default with Client Components only for interactivity. This aligns with Constitution Principle IV (Architecture Excellence) and follows Next.js 14 best practices.

## Complexity Tracking

> All Constitution gates PASS - no violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | No complexity violations |

---

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed technology research and decision rationale.

**Key Research Topics**:
1. **SERP API Selection**: SerpAPI vs Bright Data vs custom Puppeteer scraping
2. **Social Media API Limits**: Instagram Graph API pagination, LinkedIn rate limits, Facebook webhook setup
3. **OpenAI Cost Optimization**: GPT-4 vs GPT-3.5-turbo for different use cases, prompt caching strategies
4. **Supabase Edge Functions**: Deno runtime limitations, cold start mitigation
5. **WordPress REST API**: Application Passwords vs OAuth, handling different WordPress versions
6. **Sentiment Analysis**: Single-model vs ensemble approach, confidence calibration
7. **SERP Position Tracking**: Daily vs hourly checks, cost-benefit analysis
8. **Caching Strategy**: Memory vs Redis vs Upstash, cache invalidation rules

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity-relationship diagrams and field specifications.

**Core Entities**:
- **clients**: Client companies/individuals being monitored
- **users**: System users (Supabase Auth integrated)
- **client_users**: RBAC mapping (user → client with role)
- **keywords**: Monitored search terms per client
- **serp_results**: Historical Google position data
- **news_mentions**: Scraped news articles
- **social_accounts**: Connected social media accounts
- **social_posts**: Aggregated social mentions
- **generated_content**: AI-generated articles
- **reputation_scores**: Historical score calculations
- **alerts**: Reputation alerts (negative mentions, score drops)
- **audit_logs**: Compliance audit trail

### API Contracts

See [contracts/](./contracts/) directory for OpenAPI 3.0 specifications.

**Primary Endpoints**:
- `POST /api/generate-content` - Generate 1-5 articles
- `GET /api/clients/:id/reputation` - Current reputation score + breakdown
- `GET /api/clients/:id/serp` - SERP positions for keywords
- `GET /api/social/mentions` - Aggregated social feed
- `POST /api/wordpress/publish` - Publish article to WordPress as draft
- `GET /api/alerts` - Active alerts for all clients
- `POST /api/cron/scrape-news` - Trigger news scraping (Vercel Cron)
- `POST /api/cron/sync-social` - Trigger social sync (Vercel Cron)
- `POST /api/cron/calculate-reputation` - Recalculate scores (Vercel Cron)

### Quickstart Guide

See [quickstart.md](./quickstart.md) for developer onboarding with step-by-step setup instructions.

---

## Next Steps

1. **Review this plan**: Approve technical decisions and architecture
2. **Run `/speckit.tasks`**: Generate actionable task breakdown
3. **Run `/speckit.implement`**: Execute tasks and build MVP

**Estimated Implementation Effort**: 80-120 hours (2-4 weeks @ 40h/week for solo founder)

