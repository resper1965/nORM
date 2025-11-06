# nORM Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-06

## Active Technologies

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript 5.5+
- Tailwind CSS
- shadcn/ui components
- next-intl (i18n)

**Backend**:
- Supabase (PostgreSQL, Auth, Edge Functions)
- Deno runtime (Edge Functions)

**AI & APIs**:
- OpenAI GPT-4 (content generation, sentiment analysis)
- SerpAPI (SERP tracking)
- Meta Graph API (Instagram, Facebook)
- LinkedIn API v2
- WordPress REST API
- Resend (email notifications)

**Testing**:
- Vitest (unit tests)
- Playwright (E2E tests)
- React Testing Library
- MSW (API mocking)

**Deployment**:
- Vercel (frontend)
- Supabase (backend, database)

## Project Structure

```text
nORM/
├── .specify/
│   ├── memory/
│   ├── scripts/
│   ├── specs/
│   └── templates/
├── .claude/
│   └── commands/
└── [Other project files]
```

## Commands

Available Spec Kit commands:
- `/speckit.constitution` - Create or update project governing principles
- `/speckit.specify` - Define what you want to build (requirements and user stories)
- `/speckit.plan` - Create technical implementation plans with your chosen tech stack
- `/speckit.tasks` - Generate actionable task lists for implementation
- `/speckit.implement` - Execute all tasks to build the feature according to the plan
- `/speckit.clarify` - Clarify underspecified areas
- `/speckit.analyze` - Cross-artifact consistency & coverage analysis
- `/speckit.checklist` - Generate custom quality checklists

## Code Style

To be determined during feature planning.

## Recent Changes

- **2025-11-06**: Created tasks.md with 97 implementation tasks organized by user story
- **2025-11-06**: Created technical implementation plan for nORM MVP (001-reputation-dashboard-mvp)
- **2025-11-06**: Generated Phase 1 artifacts: data-model.md, API contracts, quickstart.md
- **2025-11-06**: Established project constitution v1.0.0 with 10 core principles
- **2025-11-06**: Configured Vercel deployment with comprehensive environment variables
- **2025-11-06**: Initial setup with GitHub Spec Kit

## Active Feature Development

### Feature: 001-reputation-dashboard-mvp

**Status**: Planning Complete, Ready for Implementation

**Location**: `.specify/specs/001-reputation-dashboard-mvp/`

**Artifacts**:
- ✅ `spec.md` - Feature specification with user stories and requirements
- ✅ `plan.md` - Technical implementation plan with architecture and design decisions
- ✅ `data-model.md` - Complete database schema and entity relationships
- ✅ `contracts/api-spec.json` - OpenAPI 3.0 API specification
- ✅ `contracts/supabase-schema.sql` - Database schema SQL
- ✅ `quickstart.md` - Developer onboarding guide
- ✅ `tasks.md` - Implementation tasks breakdown (97 tasks organized by user story)

**Next Steps**:
1. Review and approve task breakdown
2. Run `/speckit.implement` to start building MVP
3. Track progress by checking off tasks as they're completed

**Estimated Effort**: 80-120 hours (2-4 weeks @ 40h/week)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
