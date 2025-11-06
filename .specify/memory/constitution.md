<!--
Sync Impact Report:
- Version change: 0.0.0 (none) → 1.0.0 (initial constitution)
- Added sections:
  * Core Principles (10 principles)
  * Additional Constraints (Security & Performance)
  * Development Standards & Quality Gates
  * Governance
- Templates requiring updates: ✅ All templates reviewed and aligned
- Follow-up TODOs: None - all principles fully defined
-->

# nORM Constitution

**nORM** - Next Online Reputation Manager: Intelligent system for monitoring, analyzing, and improving online reputation through AI-powered insights and automated content generation.

## Core Principles

### I. Privacy & Compliance (NON-NEGOTIABLE)

**MUST** maintain full compliance with LGPD (Brazil) and GDPR (EU) regulations:
- Encrypt all sensitive data at rest and in transit (social media tokens, API keys, user credentials)
- Implement explicit user consent flows before collecting any public data
- Provide data portability: users can export all their data in machine-readable format (JSON)
- Implement "right to be forgotten": complete data deletion within 30 days of request
- Maintain comprehensive audit logs for all data access and modifications (minimum 1 year retention)
- Display transparent privacy policy in user's language before account creation

**Rationale**: Reputation management involves collecting and analyzing public information about clients. We must handle this data with the highest ethical and legal standards to maintain trust and avoid regulatory penalties.

### II. AI Quality & Transparency

**MUST** ensure AI-generated insights are accurate, explainable, and trustworthy:
- Sentiment analysis requires ≥90% confidence threshold; otherwise flag for human review
- Reputation scores MUST show detailed breakdown of contributing factors with weighted percentages
- All AI-generated content MUST be marked as "AI-Generated" and require human approval before publication
- Implement multiple validation sources for sentiment analysis (minimum 2 models: OpenAI + fallback)
- A/B test AI models quarterly to ensure continuous improvement
- Provide "explain this score" feature showing specific mentions, sources, and sentiment distribution

**Rationale**: Users make business decisions based on our AI analysis. Inaccurate or unexplainable insights erode trust and can cause reputational harm. Transparency builds confidence.

### III. Ethical Data Collection

**MUST** respect source policies and avoid manipulative practices:
- Honor robots.txt directives; never bypass scraping restrictions
- Implement exponential backoff rate limiting (max 1 request/second per domain)
- Never distort, manipulate, or fabricate collected information
- Attribute all sources with direct links to original content
- FORBIDDEN: Creating fake news, astroturfing, or deceptive content
- Monitor ONLY publicly available information; no unauthorized access attempts
- Disclose data collection methods to users transparently

**Rationale**: Ethical data collection is both a legal requirement and a moral imperative. Violating these principles damages our reputation and exposes us to legal liability.

### IV. Architecture & Performance Excellence

**MUST** maintain modern, scalable, and performant architecture:
- **Stack**: Next.js 14 with App Router, TypeScript (strict mode), Supabase (PostgreSQL + Auth + Edge Functions)
- **Server Components by default**: Use Client Components only when necessary (interactivity, browser APIs)
- **Database**: Supabase Row Level Security (RLS) enabled on ALL tables
- **Background Jobs**: Supabase Edge Functions for async processing (news scraping, social sync, reputation calculation)
- **Caching Strategy**:
  - AI responses cached for 1 hour (same input = same output)
  - News articles cached for 4 hours
  - Social media data cached for 15 minutes
  - Reputation scores cached for 30 minutes
- **Core Web Vitals targets** (production):
  - Largest Contentful Paint (LCP): < 2.5s
  - First Input Delay (FID): < 100ms
  - Cumulative Layout Shift (CLS): < 0.1
- Progressive enhancement: critical features work without JavaScript

**Rationale**: Performance directly impacts user experience and SEO. A slow or unstable platform loses users. Modern architecture ensures maintainability and scalability.

### V. Testing & Quality Assurance (NON-NEGOTIABLE)

**MUST** maintain comprehensive test coverage before production:
- **Unit Tests**: 80% minimum coverage for critical paths (AI functions, reputation calculations, data processing)
- **Integration Tests**: All API endpoints, database operations, and third-party integrations
- **End-to-End Tests**: Core user flows (signup, add client, view dashboard, generate content)
- **TDD for critical features**: Write tests → get approval → implement (red-green-refactor)
- **CI/CD gates**:
  - All tests pass (no exceptions)
  - TypeScript compilation succeeds with zero errors
  - Linting passes (ESLint + Prettier)
  - No critical security vulnerabilities (npm audit)
- **Manual QA**: AI-generated content reviewed by humans before first release

**Rationale**: Bugs in production damage user trust and can cause real business harm (inaccurate reputation scores, failed content publishing). Tests are an investment that pays off exponentially.

### VI. Security First

**MUST** implement defense-in-depth security measures:
- **Authentication**: Supabase Auth with MFA option (encourage but don't require)
- **Authorization**: Role-Based Access Control (RBAC)
  - Admin: full access to all clients and system settings
  - Editor: can manage content and view analytics for assigned clients
  - Viewer: read-only access to reports and dashboards
- **Data Protection**:
  - API keys encrypted using AES-256 with per-user encryption keys
  - Tokens rotated every 90 days with automated warnings at 80 days
  - No sensitive data in logs (sanitize before logging)
- **Security Headers** (enforced in vercel.json):
  - Content-Security-Policy (CSP) with strict directives
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
- **Rate Limiting**: 100 requests/minute per user (configurable)
- **Input Sanitization**: All user inputs sanitized to prevent XSS and SQL injection
- **Dependency Scanning**: Weekly automated scans; critical CVEs fixed within 48 hours

**Rationale**: Security breaches expose user data, damage reputation, and can result in legal consequences. Security must be baked in, not bolted on.

### VII. Internationalization & Accessibility

**MUST** support global users and ensure accessibility:
- **i18n**: Native support for Portuguese (PT-BR), English (EN), Spanish (ES)
  - All UI strings must use next-intl from day one (no hardcoded strings)
  - Date/time formatted per locale using date-fns
  - Currency formatted per locale (R$, $, €)
- **Accessibility (WCAG 2.1 AA minimum)**:
  - Semantic HTML with proper heading hierarchy
  - ARIA labels on all interactive elements
  - Keyboard navigation for all features
  - Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text
  - Screen reader tested quarterly
- **Responsive Design**: Mobile-first approach
  - Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
  - Touch-friendly targets (minimum 44x44px)
- **Dark Mode**: Supported with user preference persistence

**Rationale**: Accessibility is a legal requirement in many jurisdictions and expands our user base. i18n enables global growth. Poor mobile experience alienates >50% of users.

### VIII. Documentation & Knowledge Sharing

**MUST** maintain comprehensive, up-to-date documentation:
- **README.md**: Setup instructions, tech stack, quick start (5-minute setup goal)
- **API Documentation**: OpenAPI/Swagger spec for all endpoints with examples
- **JSDoc**: All exported functions documented with parameter types, return types, examples
- **Architecture Decision Records (ADRs)**: Document significant technical decisions
  - Template: Context, Decision, Consequences, Alternatives Considered
  - Stored in `docs/adr/` directory
- **Changelog**: Semantic versioning with conventional commits
  - feat: new feature (MINOR bump)
  - fix: bug fix (PATCH bump)
  - BREAKING CHANGE: incompatible API change (MAJOR bump)
- **Deployment Guides**: Step-by-step instructions for Vercel, Supabase setup
- **Troubleshooting**: Common problems and solutions documented

**Rationale**: Documentation reduces onboarding time, prevents knowledge silos, and enables community contributions. Undocumented code is technical debt.

### IX. User Experience Excellence

**MUST** prioritize user experience in all features:
- **Loading States**: Show skeleton loaders or spinners for all async operations
- **Error Handling**:
  - Error boundaries prevent full app crashes
  - User-friendly error messages with actionable steps
  - Technical details available in console (dev mode)
- **Feedback**: Immediate visual confirmation for user actions
  - Button states: default → loading → success/error
  - Toast notifications for async operations
  - Optimistic UI updates where possible
- **Onboarding**: First-time user experience
  - Interactive tutorial for key features
  - Sample data pre-loaded for exploration
  - Contextual help tooltips
- **Performance Perception**:
  - Instant page transitions with Turbopack
  - Prefetch links on hover
  - Image optimization with next/image
- **Consistency**: Use shadcn/ui components consistently across all pages

**Rationale**: A confusing or slow interface drives users away regardless of feature quality. UX is a competitive advantage.

### X. Cost Optimization & Sustainability

**MUST** manage API costs and ensure long-term sustainability:
- **Cost Monitoring**: Real-time tracking of API usage and costs
  - Daily budget alerts at 80% and 100% of threshold
  - Per-client cost tracking for profitability analysis
- **Optimization Strategies**:
  - Cache AI responses aggressively (same question = cached answer)
  - Batch API calls where possible (news scraping, social sync)
  - Use cheaper models for simple tasks (sentiment: gpt-3.5-turbo vs gpt-4)
  - Implement request deduplication
- **Feature Flags**: Ability to disable expensive features per plan tier
  - Free tier: Manual content generation only
  - Pro tier: Automated content generation limited to 50/month
  - Enterprise tier: Unlimited
- **Scaling Strategy**:
  - Horizontal scaling with Edge Functions
  - Database read replicas for analytics queries
  - CDN for static assets (images, CSS, JS)

**Rationale**: Uncontrolled API costs can make the business unsustainable. Proactive cost management ensures profitability while maintaining quality.

## Additional Constraints

### Security Requirements

- **Secrets Management**: Never commit secrets to git
  - Use Vercel environment variables for all API keys
  - Supabase Edge Function secrets for background jobs
  - .env files in .gitignore
- **Encryption**:
  - TLS 1.3 for all connections
  - Database connections encrypted
  - Social media tokens encrypted with user-specific keys
- **Backup & Recovery**:
  - Daily automated Supabase backups
  - Point-in-time recovery available
  - Disaster recovery plan documented

### Performance Standards

- **API Response Times**:
  - Read operations: < 200ms (p95)
  - Write operations: < 500ms (p95)
  - AI operations: < 5s (p95)
- **Database Queries**:
  - All queries indexed appropriately
  - N+1 queries eliminated
  - Connection pooling enabled
- **Bundle Size**:
  - Initial JavaScript bundle: < 200KB (gzipped)
  - Per-page JavaScript: < 50KB (gzipped)
  - Tree-shaking enabled

## Development Standards & Quality Gates

### Code Review Process

**MUST** follow before merging to main:
1. Pull request with descriptive title and body
2. All CI checks pass (tests, linting, build)
3. At least one approval from code owner
4. No unresolved conversations
5. Branch up-to-date with main

### Commit Message Convention

Use Conventional Commits:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

Example:
```
feat(reputation): add sentiment trend analysis

Implement 30-day sentiment trend calculation using
exponential moving average for smoother visualization.

Closes #123
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch (if team grows)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Definition of Done

A feature is done when:
- [ ] Code written and reviewed
- [ ] Tests passing (unit + integration + E2E)
- [ ] Documentation updated
- [ ] Accessibility verified
- [ ] Performance benchmarked (no regressions)
- [ ] Deployed to staging and verified
- [ ] Product owner approval

## Governance

### Constitution Authority

This constitution supersedes all other development practices, guidelines, and team preferences. When in doubt, refer to these principles.

### Amendment Process

1. **Proposal**: Document proposed changes with rationale
2. **Review**: Minimum 3-day comment period
3. **Approval**: Requires consensus from project maintainers
4. **Migration**: Document migration plan for breaking changes
5. **Version Bump**: Update version according to semantic versioning
   - MAJOR: Backward-incompatible principle removal/redefinition
   - MINOR: New principle added or material expansion
   - PATCH: Clarifications, wording improvements

### Compliance Review

- **Quarterly**: Review adherence to all principles
- **On Violation**: Document exception with justification and remediation plan
- **Continuous**: Automated checks in CI/CD where possible

### Conflict Resolution

When principles conflict:
1. Non-negotiable principles (I, II, V, VI) take precedence
2. User safety > developer convenience
3. Long-term sustainability > short-term speed
4. Transparency > complexity

**Version**: 1.0.0 | **Ratified**: 2025-11-06 | **Last Amended**: 2025-11-06
