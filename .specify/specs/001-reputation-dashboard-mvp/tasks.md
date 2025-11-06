# Tasks: nORM - Online Reputation Dashboard MVP

**Input**: Design documents from `/specs/001-reputation-dashboard-mvp/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ data-model.md, ✅ contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan (app/, lib/, components/, supabase/)
- [ ] T002 [P] Install and configure dependencies (OpenAI SDK, SerpAPI, Resend, etc.)
- [ ] T003 [P] Configure TypeScript strict mode and ESLint
- [ ] T004 [P] Setup Vitest and Playwright for testing
- [ ] T005 [P] Configure environment variables validation (lib/config/env.ts)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Setup Supabase database schema (run migrations from contracts/supabase-schema.sql)
- [ ] T007 [P] Generate TypeScript types from Supabase schema (lib/types/supabase.ts)
- [ ] T008 [P] Implement authentication/authorization framework (Supabase Auth + RLS)
- [ ] T009 [P] Setup API routing structure (app/api/ routes)
- [ ] T010 Create base domain models (lib/types/domain.ts: Client, Keyword, etc.)
- [ ] T011 Configure error handling and logging infrastructure (lib/utils/logger.ts)
- [ ] T012 Setup Row Level Security (RLS) policies on all tables
- [ ] T013 Create audit logging system (audit_logs table + triggers)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - SERP Crisis Detection & Auto-Response (Priority: P1) 🎯 MVP

**Goal**: Detect negative content on Google page 1-2 and send alerts immediately

**Independent Test**: Create mock negative article, verify system detects it within 24h, sends alert, shows in dashboard.

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create SerpAPI integration (lib/scraping/serp.ts)
- [ ] T015 [P] [US1] Create rate limiter utility (lib/scraping/rate-limiter.ts)
- [ ] T016 [US1] Implement SERP position tracking service (lib/scraping/serp-tracker.ts)
- [ ] T017 [US1] Create cron job endpoint for SERP checks (app/api/cron/check-serp/route.ts)
- [ ] T018 [US1] Implement alert generation logic (lib/reputation/alert-generator.ts)
- [ ] T019 [US1] Create email notification service (lib/notifications/email.ts using Resend)
- [ ] T020 [US1] Build SERP position grid component (components/dashboard/serp-position-grid.tsx)
- [ ] T021 [US1] Build alerts list component (components/dashboard/alerts-list.tsx)
- [ ] T022 [US1] Create alerts API endpoint (app/api/alerts/route.ts)
- [ ] T023 [US1] Implement alerts page (app/[locale]/(dashboard)/reputation/alerts/page.tsx)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - AI Content Generation Strategy (Priority: P1) 🎯 MVP

**Goal**: Generate 3-5 SEO-optimized positive articles with one click to counteract negative content

**Independent Test**: Click "Generate Response to [negative article]" and verify 3-5 unique articles are created in <5 minutes, each 800-1500 words, SEO score >70.

### Implementation for User Story 2

- [ ] T024 [P] [US2] Create OpenAI client wrapper (lib/ai/openai.ts)
- [ ] T025 [P] [US2] Create content generation prompts (lib/ai/prompts.ts)
- [ ] T026 [US2] Implement AI content generator service (lib/ai/content-generator.ts)
- [ ] T027 [US2] Create SEO score calculator (lib/ai/seo-analyzer.ts)
- [ ] T028 [US2] Build content generation API endpoint (app/api/generate-content/route.ts)
- [ ] T029 [US2] Create content editor component (components/content/content-editor.tsx)
- [ ] T030 [US2] Build SEO score panel component (components/content/seo-score-panel.tsx)
- [ ] T031 [US2] Create article preview component (components/content/article-preview.tsx)
- [ ] T032 [US2] Implement content generation page (app/[locale]/(dashboard)/content/new/page.tsx)
- [ ] T033 [US2] Create content library page (app/[locale]/(dashboard)/content/page.tsx)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Social Media Monitoring (Priority: P1) 🎯 MVP

**Goal**: Monitor mentions and sentiment on Instagram, LinkedIn, and Facebook in real-time

**Independent Test**: Create test post mentioning client on Instagram, verify system detects it within 1 hour, analyzes sentiment, shows in dashboard.

### Implementation for User Story 3

- [ ] T034 [P] [US3] Create Instagram Graph API integration (lib/social/instagram.ts)
- [ ] T035 [P] [US3] Create LinkedIn API integration (lib/social/linkedin.ts)
- [ ] T036 [P] [US3] Create Facebook Graph API integration (lib/social/facebook.ts)
- [ ] T037 [US3] Implement unified social feed aggregator (lib/social/unified-feed.ts)
- [ ] T038 [US3] Create social media sync cron job (app/api/cron/sync-social/route.ts)
- [ ] T039 [US3] Implement sentiment analysis for social posts (lib/ai/sentiment.ts)
- [ ] T040 [US3] Build social mention card component (components/social/social-mention-card.tsx)
- [ ] T041 [US3] Create sentiment badge component (components/social/sentiment-badge.tsx)
- [ ] T042 [US3] Build platform icon component (components/social/platform-icon.tsx)
- [ ] T043 [US3] Create social feed component (components/social/social-feed.tsx)
- [ ] T044 [US3] Implement social mentions API endpoint (app/api/social/mentions/route.ts)
- [ ] T045 [US3] Create social monitoring page (app/[locale]/(dashboard)/social/page.tsx)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Brazilian Market Focus (Priority: P1) 🎯 MVP

**Goal**: Focus exclusively on Brazilian Google (google.com.br) and Portuguese content (PT-BR)

**Independent Test**: Configure client, verify all SERP checks use google.com.br, all generated content is in PT-BR.

### Implementation for User Story 4

- [ ] T046 [US4] Configure SerpAPI to use google.com.br only (lib/scraping/serp.ts)
- [ ] T047 [US4] Update content generator prompts for PT-BR (lib/ai/prompts.ts)
- [ ] T048 [US4] Add language detection and translation for news articles (lib/scraping/google-news.ts)
- [ ] T049 [US4] Update UI to show language tags (components/content/article-preview.tsx)
- [ ] T050 [US4] Configure i18n for PT-BR as default (i18n/config.ts)

**Checkpoint**: All content generation and monitoring now focused on Brazil/PT-BR

---

## Phase 7: User Story 5 - Reputation Score Calculation & Visualization (Priority: P1) 🎯 MVP

**Goal**: Display single reputation score (0-100) with breakdown and historical trends

**Independent Test**: Create mock data with 10 positive mentions, 2 negative, client on Google page 1 position 3, verify score calculates correctly (~75-80).

### Implementation for User Story 5

- [ ] T051 [US5] Implement reputation score calculator (lib/reputation/calculator.ts)
- [ ] T052 [US5] Create trend analyzer (lib/reputation/trend-analyzer.ts)
- [ ] T053 [US5] Build reputation score calculation cron job (app/api/cron/calculate-reputation/route.ts)
- [ ] T054 [US5] Create reputation score card component (components/dashboard/reputation-score-card.tsx)
- [ ] T055 [US5] Build score breakdown tooltip component (components/dashboard/score-breakdown-tooltip.tsx)
- [ ] T056 [US5] Create reputation timeline chart component (components/dashboard/reputation-timeline.tsx)
- [ ] T057 [US5] Implement reputation API endpoint (app/api/clients/[id]/reputation/route.ts)
- [ ] T058 [US5] Create main dashboard page (app/[locale]/(dashboard)/page.tsx)

**Checkpoint**: Reputation score calculation and visualization complete

---

## Phase 8: User Story 6 - WordPress Auto-Publishing Integration (Priority: P2)

**Goal**: Publish AI-generated articles directly to WordPress as drafts

**Independent Test**: Connect WordPress site, generate article, publish as draft, verify it appears in WordPress admin.

### Implementation for User Story 6

- [ ] T059 [P] [US6] Create WordPress REST API client (lib/wordpress/client.ts)
- [ ] T060 [US6] Implement WordPress publisher service (lib/wordpress/publisher.ts)
- [ ] T061 [US6] Create WordPress connection test utility (lib/wordpress/connection-test.ts)
- [ ] T062 [US6] Build WordPress publish API endpoint (app/api/wordpress/publish/route.ts)
- [ ] T063 [US6] Create WordPress settings page (app/[locale]/(dashboard)/clients/[id]/settings/page.tsx)
- [ ] T064 [US6] Add "Publish to WordPress" button to content editor (components/content/content-editor.tsx)

**Checkpoint**: WordPress integration complete

---

## Phase 9: User Story 7 - Real-Time Alert System (Priority: P2)

**Goal**: Receive instant alerts (email/SMS) when critical reputation events occur

**Independent Test**: Manually trigger alert by creating negative mention, verify email arrives within 5 minutes.

### Implementation for User Story 7

- [ ] T065 [US7] Enhance email notification service with templates (lib/notifications/email.ts)
- [ ] T066 [US7] Implement SMS notification service (lib/notifications/sms.ts) - optional for MVP
- [ ] T067 [US7] Create alert trigger conditions checker (lib/reputation/alert-generator.ts)
- [ ] T068 [US7] Build alert email templates (lib/notifications/templates/)
- [ ] T069 [US7] Implement "Mark as Handled" functionality (app/api/alerts/[id]/route.ts)
- [ ] T070 [US7] Add alert notification preferences to user settings

**Checkpoint**: Real-time alert system complete

---

## Phase 10: User Story 8 - Client & Keyword Management (Priority: P3)

**Goal**: Easily add clients and configure monitored keywords

**Independent Test**: Add client, configure 10 keywords, verify monitoring starts within 24h.

### Implementation for User Story 8

- [ ] T071 [P] [US8] Create client management API endpoints (app/api/clients/route.ts)
- [ ] T072 [P] [US8] Create keyword management API endpoints (app/api/clients/[id]/keywords/route.ts)
- [ ] T073 [US8] Build client list page (app/[locale]/(dashboard)/clients/page.tsx)
- [ ] T074 [US8] Create add client form component (components/clients/add-client-form.tsx)
- [ ] T075 [US8] Build keyword management page (app/[locale]/(dashboard)/clients/[id]/keywords/page.tsx)
- [ ] T076 [US8] Create keyword suggestion service (lib/clients/keyword-suggestions.ts)
- [ ] T077 [US8] Implement client dashboard page (app/[locale]/(dashboard)/clients/[id]/page.tsx)

**Checkpoint**: Client and keyword management complete

---

## Phase 11: News Monitoring (Supporting Feature)

**Goal**: Daily scraping of Google News Brasil for client mentions

- [ ] T078 [P] Create Google News scraper (lib/scraping/google-news.ts)
- [ ] T079 Create news scraping cron job (app/api/cron/scrape-news/route.ts)
- [ ] T080 Implement article deduplication logic (lib/scraping/deduplicator.ts)
- [ ] T081 Build news mentions display component (components/dashboard/news-mentions.tsx)

---

## Phase 12: Authentication & Authorization

**Goal**: User authentication and RBAC (admin, editor, viewer)

- [ ] T082 [P] Create login page (app/[locale]/auth/login/page.tsx)
- [ ] T083 [P] Create signup page (app/[locale]/auth/signup/page.tsx)
- [ ] T084 Implement RBAC middleware (lib/auth/rbac.ts)
- [ ] T085 Create user settings page (app/[locale]/(dashboard)/settings/page.tsx)

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T086 [P] Add loading states and skeleton loaders (components/ui/skeleton.tsx)
- [ ] T087 [P] Implement error boundaries (app/[locale]/error.tsx)
- [ ] T088 [P] Add toast notifications (components/ui/toast.tsx)
- [ ] T089 Create onboarding flow for first-time users (components/onboarding/tour.tsx)
- [ ] T090 [P] Add unit tests for reputation calculator (tests/unit/lib/reputation/calculator.test.ts)
- [ ] T091 [P] Add unit tests for sentiment analysis (tests/unit/lib/ai/sentiment.test.ts)
- [ ] T092 [P] Add integration tests for API endpoints (tests/integration/api/)
- [ ] T093 Create E2E tests for critical flows (tests/e2e/dashboard.spec.ts)
- [ ] T094 Implement cost tracking and budget alerts (lib/monitoring/cost-tracker.ts)
- [ ] T095 Add performance monitoring (lib/monitoring/performance.ts)
- [ ] T096 Run quickstart.md validation
- [ ] T097 Update documentation (README.md, API docs)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phases 3-10)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Supporting Features (Phases 11-12)**: Can run in parallel with user stories
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Depends on US1 (SERP) and US2 (Content) - Configures them for Brazil
- **User Story 5 (P1)**: Depends on US1 (SERP data) and US3 (Social data) - Calculates score from both
- **User Story 6 (P2)**: Depends on US2 (Content generation) - Publishes generated content
- **User Story 7 (P2)**: Depends on US1 (Alerts) - Enhances alert system
- **User Story 8 (P3)**: Can start after Foundational - Manages clients and keywords

### Within Each User Story

- Models/types before services
- Services before API endpoints
- API endpoints before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all P1 user stories can start in parallel
- Tasks marked [P] within a user story can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (P1 User Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL - blocks all stories**)
3. Complete Phases 3-7: User Stories 1-5 (P1)
4. **STOP and VALIDATE**: Test all P1 stories independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo (MVP!)
7. Add P2 stories (US6, US7) → Test independently → Deploy/Demo
8. Add P3 stories (US8) → Test independently → Deploy/Demo

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (SERP)
   - Developer B: User Story 2 (Content)
   - Developer C: User Story 3 (Social)
3. Then:
   - Developer A: User Story 4 (Brazil focus)
   - Developer B: User Story 5 (Reputation score)
   - Developer C: User Story 6 (WordPress)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Estimated effort: 80-120 hours (2-4 weeks @ 40h/week for solo founder)

---

## Next Steps

1. **Review this task list**: Approve task breakdown and dependencies
2. **Run `/speckit.implement`**: Execute tasks and build MVP
3. **Track progress**: Check off tasks as they're completed
4. **Validate at checkpoints**: Test each user story independently before moving on

