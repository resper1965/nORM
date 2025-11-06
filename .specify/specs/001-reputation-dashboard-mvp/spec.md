# Feature Specification: nORM - Online Reputation Dashboard MVP

**Feature Branch**: `001-reputation-dashboard-mvp`
**Created**: 2025-11-06
**Status**: Draft
**Target**: 2-4 weeks MVP for solo founder
**Budget**: $400-600/month
**Initial Client**: Founder's own brand (real-world testing)
**Geographic Focus**: Brazil only (PT-BR, google.com.br)
**Blog Platform**: WordPress (existing)

## Executive Summary

**nORM** (Next Online Reputation Manager) is an AI-powered system that **automatically detects negative online content across Google and social media (Instagram, LinkedIn, Facebook) and counteracts it through strategic SEO-optimized content generation**. The core value proposition is: suppress negative news to Google page 3+ by flooding search results with positive content while monitoring social sentiment in real-time.

**Target Users**: Solo entrepreneurs, agencies managing personal brands, professionals (lawyers, doctors, executives), and small/medium businesses - starting with founder's own brand.

**Success Metric**: Increase client reputation score from 65 to 85 in 3 months by ensuring negative content ranks on page 3+ of Google and maintaining 70%+ positive sentiment on social media.

**"WOW Moment"**: User sees that a negative news article was counterbalanced by 5 positive AI-generated articles automatically published, preventing reputation score drop, with the negative article pushed to Google page 3. Additionally, user catches negative social media mentions within 1 hour and responds before they go viral.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - SERP Crisis Detection & Auto-Response (Priority: P1)

**As a** reputation manager
**I want to** be alerted immediately when negative content about my client appears on Google page 1-2
**So that** I can respond before it damages their reputation score

**Why this priority**: This is the core value - early detection prevents damage. Without this, the entire system fails.

**Independent Test**: Can be fully tested by creating a mock negative article, verifying the system detects it within 24h, sends alert, and shows it in dashboard.

**Acceptance Scenarios**:

1. **Given** client "Empresa ABC" has 5 monitored keywords including "Empresa ABC fraude"
   **When** a negative article appears at position 4 on google.com.br for "Empresa ABC fraude"
   **Then** system sends email alert within 1 hour with article title, URL, sentiment score (-0.7), and current Google position

2. **Given** user received alert about negative content
   **When** user opens dashboard
   **Then** alert appears in "Active Alerts" section with severity badge (high/medium/low) and "Generate Response" action button

3. **Given** negative content is detected
   **When** daily SERP check runs at 8am
   **Then** system updates position tracking graph and calculates new reputation score showing trend (↓ -5 points)

---

### User Story 2 - AI Content Generation Strategy (Priority: P1)

**As a** reputation manager
**I want to** generate 3-5 SEO-optimized positive articles with one click
**So that** I can quickly counteract negative content with volume strategy

**Why this priority**: The "inundation strategy" is the weapon - without bulk content generation, manual writing is too slow.

**Independent Test**: Click "Generate Response to [negative article]" and verify 3-5 unique articles are created in <5 minutes, each 800-1500 words, SEO score >70.

**Acceptance Scenarios**:

1. **Given** negative article detected: "Empresa ABC enfrenta problemas com clientes"
   **When** user clicks "Generate 5 Counter-Articles"
   **Then** system generates 5 unique articles in different angles:
   - "Como Empresa ABC resolve problemas: 10 cases de sucesso"
   - "Depoimentos reais: clientes satisfeitos da ABC compartilham experiências"
   - "Empresa ABC investe R$2M em atendimento ao cliente"
   - "Guia completo: por que escolher Empresa ABC em 2025"
   - "Empresa ABC recebe prêmio de excelência em atendimento"

2. **Given** articles are generated
   **When** user reviews content
   **Then** each article shows:
   - SEO Score (0-100) with breakdown (keyword density, readability, meta description)
   - Target keywords highlighted in text
   - Estimated time to rank (based on domain authority)
   - Preview of how it appears in Google search results

3. **Given** user is satisfied with generated content
   **When** user clicks "Publish All as Drafts"
   **Then** system:
   - Posts all 5 articles to WordPress as drafts (if WordPress connected)
   - OR saves to nORM internal library for manual publishing
   - Shows confirmation with direct links to WordPress drafts

---

### User Story 3 - Social Media Monitoring (Instagram, LinkedIn, Facebook) (Priority: P1)

**As a** reputation manager
**I want to** monitor mentions and sentiment on Instagram, LinkedIn, and Facebook in real-time
**So that** I can catch negative comments/posts before they damage reputation

**Why this priority**: Social media is often where reputation crises START - catching them early prevents Google amplification. Brazilian market is very active on these 3 platforms.

**Independent Test**: Create test post mentioning client on Instagram, verify system detects it within 1 hour, analyzes sentiment, and shows in dashboard.

**Acceptance Scenarios**:

1. **Given** client has connected Instagram, LinkedIn, and Facebook accounts
   **When** someone mentions client in a post or comment
   **Then** system:
   - Detects mention within 1 hour (polling every 15 min)
   - Extracts: platform, author, content, timestamp, engagement (likes/comments/shares)
   - Analyzes sentiment using OpenAI (-1.0 to +1.0 scale)
   - Shows in "Social Mentions" feed with platform icon

2. **Given** negative comment appears on LinkedIn: "Experiência horrível com [Cliente], não recomendo"
   **When** system analyzes sentiment (score: -0.8, high confidence)
   **Then** triggers alert:
   - Email: "🚨 Negative LinkedIn mention detected"
   - Dashboard: Red badge on "Social Mentions" tab
   - Suggested response: AI-generated professional reply (user reviews before posting)

3. **Given** user wants to track competitors' social mentions
   **When** user adds competitor name to monitoring
   **Then** tracks their mentions separately to compare sentiment vs client

4. **Given** Instagram Story mentions client
   **When** story is detected (24h lifetime)
   **Then** system:
   - Screenshots story automatically (before it disappears)
   - Stores image + text analysis
   - Flags if negative

---

### User Story 4 - Brazilian Market Focus (google.com.br, PT-BR only) (Priority: P1)

**As a** Brazilian reputation manager
**I want to** focus exclusively on Brazilian Google and Portuguese content initially
**So that** I can deliver faster MVP without multi-language complexity

**Why this priority**: Founder's own brand is Brazilian - adding multi-language now delays MVP by 2+ weeks with little immediate value.

**Independent Test**: Configure client, verify all SERP checks use google.com.br, all generated content is in PT-BR, all social monitoring is Portuguese-language.

**Acceptance Scenarios**:

1. **Given** client is configured
   **When** daily SERP check runs
   **Then** ONLY checks google.com.br (not .com, .es, etc.)

2. **Given** content generator creates articles
   **When** user clicks "Generate 5 Articles"
   **Then** all articles are in fluent Brazilian Portuguese (PT-BR, not PT-PT)

3. **Given** news scraping detects article in English
   **When** sentiment analysis runs
   **Then** system:
   - Translates to PT-BR for analysis
   - Still generates PT-BR counter-articles
   - Shows original language tag: "EN → PT"

4. **Given** user wants to expand internationally later
   **When** v0.2 adds multi-language
   **Then** database schema supports `language` field (already planned, not blocking MVP)

---

### User Story 5 - Reputation Score Calculation & Visualization (Priority: P1)

**As a** reputation manager
**I want to** see a single score (0-100) that represents my client's online reputation
**So that** I can quickly assess health and track improvement over time

**Why this priority**: Single metric simplifies complex data - essential for decision making and client reporting.

**Independent Test**: Create mock data with 10 positive mentions, 2 negative, client on Google page 1 position 3, and verify score calculates correctly (~75-80).

**Acceptance Scenarios**:

1. **Given** client has mixed online presence
   **When** reputation score is calculated
   **Then** score formula considers:
   - Google SERP position for brand name (40% weight)
   - Sentiment ratio of recent mentions - last 30 days (30% weight)
   - Trend direction - improving vs declining (20% weight)
   - Number of positive vs negative mentions (10% weight)

2. **Given** user opens dashboard
   **When** reputation score is displayed
   **Then** shows:
   - Large score number: 78/100 with color coding (0-50 red, 51-75 yellow, 76-100 green)
   - Trend arrow and change: ↑ +3 (last 7 days)
   - Expandable "Score Breakdown" showing weighted factors
   - 30-day line chart showing historical trend

3. **Given** user hovers over score breakdown
   **When** tooltip appears
   **Then** explains each factor:
   - "SERP Position: 9/10 - You rank #3 on Google for your name"
   - "Sentiment: 7/10 - 70% of mentions are positive"
   - "Trend: 8/10 - Improving over last 30 days"
   - "Volume: 6/10 - 12 positive vs 3 negative mentions"

---

### User Story 5 - WordPress Auto-Publishing Integration (Priority: P2)

**As a** reputation manager
**I want to** publish AI-generated articles directly to client WordPress blogs as drafts
**So that** I can review and publish quickly without copy-pasting

**Why this priority**: Automation saves hours per week - but P2 because manual publishing works for MVP.

**Independent Test**: Connect WordPress site, generate article, publish as draft, verify it appears in WordPress admin with correct title, content, tags, and featured image.

**Acceptance Scenarios**:

1. **Given** user has WordPress site credentials
   **When** user clicks "Connect WordPress" in settings
   **Then** system:
   - Tests connection via WordPress REST API
   - Verifies write permissions
   - Shows success message with blog name and URL
   - Stores encrypted credentials in database

2. **Given** WordPress is connected
   **When** user generates 3 articles and clicks "Publish All as Drafts"
   **Then** system:
   - Creates posts in WordPress with status="draft"
   - Includes meta description as excerpt
   - Adds recommended tags from SEO analysis
   - Sets category to "Blog" (default) or user-selected category
   - Returns direct links to WordPress edit screens

3. **Given** WordPress connection fails
   **When** system attempts to publish
   **Then** shows clear error message and fallback options:
   - "WordPress connection lost. [Reconnect] or [Export as HTML]"
   - Saves content locally so it's not lost
   - Sends email notification to user

---

### User Story 6 - Multi-Channel Content Distribution (Priority: P2)

**As a** reputation manager
**I want to** distribute generated content across blog, Medium, LinkedIn, and partner sites
**So that** I maximize SEO impact and reach

**Why this priority**: Multi-channel amplifies SEO effect - but can start with blog-only in MVP.

**Independent Test**: Publish same article to WordPress, Medium, and LinkedIn, verify correct formatting and canonical URLs.

**Acceptance Scenarios**:

1. **Given** user generated article and wants maximum distribution
   **When** user selects "Publish to All Channels"
   **Then** system shows checklist:
   - [x] WordPress (primary - canonical URL)
   - [x] Medium (cross-post with canonical back to WordPress)
   - [x] LinkedIn Article (native format)
   - [ ] Partner sites (manual submission for now)

2. **Given** article published to WordPress first
   **When** system cross-posts to Medium
   **Then** includes canonical URL meta tag pointing to WordPress version (prevents SEO duplicate content penalty)

3. **Given** content strategy requires guest posting
   **When** user marks article as "Guest Post Ready"
   **Then** system:
   - Generates pitch email template
   - Suggests 10 target sites based on niche (using Ahrefs/Moz data)
   - Tracks outreach status (sent, accepted, published)

---

### User Story 7 - Real-Time Alert System (Priority: P2)

**As a** reputation manager
**I want to** receive instant alerts (email/SMS) when critical reputation events occur
**So that** I can respond within minutes, not hours

**Why this priority**: Speed matters in crisis management - but P2 because daily checks work for MVP.

**Independent Test**: Manually trigger alert by creating negative mention, verify email arrives within 5 minutes with actionable information.

**Acceptance Scenarios**:

1. **Given** client "Empresa ABC" has reputation score of 82
   **When** new negative article drops score to 75 (>5 point drop)
   **Then** system sends alert email:
   - Subject: "🚨 ALERT: Empresa ABC reputation dropped 7 points"
   - Body: Article title, URL, excerpt, sentiment score, current Google position
   - Action buttons: [View Dashboard] [Generate Response] [Mark as Handled]

2. **Given** user has phone number configured
   **When** CRITICAL alert triggers (score drops >10 points OR negative content in top 3 Google results)
   **Then** sends SMS: "URGENT: [Client] negative content at Google #2. Check dashboard immediately."

3. **Given** user receives alert
   **When** user clicks "Mark as Handled"
   **Then** alert moves to "Resolved" status and doesn't re-trigger for same article

---

### User Story 8 - Client & Keyword Management (Priority: P3)

**As a** agency owner managing multiple clients
**I want to** easily add clients and configure monitored keywords
**So that** I can scale to 10-20 clients efficiently

**Why this priority**: P3 because MVP focuses on 1-5 clients max initially.

**Independent Test**: Add client, configure 10 keywords, verify monitoring starts within 24h.

**Acceptance Scenarios**:

1. **Given** user clicks "Add New Client"
   **When** user fills form (name, industry, website, blog URL)
   **Then** system:
   - Creates client record
   - Suggests 5 default keywords (brand name + common negative terms)
   - Prompts for WordPress credentials (optional)
   - Starts monitoring within 24h

2. **Given** client exists
   **When** user edits keyword list
   **Then** can:
   - Add unlimited keywords (charged per keyword in future tiers)
   - Mark keywords as high-priority (checked more frequently)
   - Set custom alert thresholds per keyword
   - Pause/resume monitoring without deleting

3. **Given** user manages 15 clients
   **When** user opens dashboard
   **Then** shows:
   - Client list with reputation scores
   - Total alerts across all clients
   - Quick-switch dropdown to view individual client dashboards

---

## Functional Requirements

### Core Features (MVP - 2-4 weeks)

1. **SERP Tracking Engine**
   - Daily automated Google position checks for configured keywords
   - Support for google.com.br ONLY in MVP (expandable to .com, .es later)
   - Store historical data (minimum 90 days)
   - Detect position changes >3 spots and trigger alerts
   - API: Use SerpAPI or similar ($100/month for 5000 searches - Brazil only cheaper)

2. **News Monitoring**
   - Daily scraping of Google News Brasil for client mentions
   - Filter by date (last 24h) and Portuguese language
   - Extract: title, URL, excerpt, publish date, source
   - Deduplicate articles (same story, different sources)

3. **Social Media Monitoring**
   - **Instagram**: Track mentions, comments, stories, and hashtags
     - Instagram Graph API (requires Facebook Business account)
     - Poll every 15 minutes for new mentions
     - Screenshot Instagram Stories before they expire (24h)
   - **LinkedIn**: Monitor profile mentions, post comments, company page tags
     - LinkedIn API v2 (requires Company Page admin access)
     - Track engagement metrics (likes, comments, shares)
   - **Facebook**: Track page mentions, post comments, reviews
     - Facebook Graph API (same as Instagram)
     - Monitor both public posts and page-specific content
   - **Unified Feed**: Aggregate all social mentions in single dashboard view
   - **Real-time Alerts**: Email/in-app notification for negative mentions (sentiment < -0.5)
   - Cost: APIs are mostly free for basic usage, with rate limits

4. **Sentiment Analysis**
   - OpenAI GPT-4 analysis of article content
   - Output: sentiment (positive/neutral/negative) + confidence score (0-1)
   - Threshold: >0.8 confidence to mark as definitive, <0.8 flag for review
   - Store rationale: "Article mentions 'lawsuit' and 'fraud' - negative context"

5. **Reputation Score Algorithm**
   ```javascript
   score = (
     googlePosition * 0.35 +      // #1 = 10 pts, #2 = 9 pts, etc.
     newsSentiment * 0.25 +        // (positive - negative) news / total
     socialSentiment * 0.20 +      // Instagram + LinkedIn + Facebook avg sentiment
     trendDirection * 0.15 +       // improving = +10, declining = -10
     mentionVolume * 0.05          // more positive mentions = higher
   ) * 10  // Scale to 0-100
   ```

   **Note**: Social media sentiment now accounts for 20% of score - reflects importance in Brazilian market.

6. **AI Content Generator**
   - Input: Topic OR "respond to [article URL]"
   - Generate 1-5 articles (user selectable)
   - Length: 800-1500 words each
   - Include: Title, H2/H3 headings, meta description, keywords
   - SEO optimization: Keyword density 1-2%, readability score >60
   - Uniqueness guarantee: Each article uses different angle/structure

7. **WordPress Integration**
   - REST API authentication (Application Password)
   - Post as draft (status=draft)
   - Set category, tags, excerpt
   - Support for featured images (future: AI-generated or stock photos)
   - Founder's existing WordPress blog URL configured in settings

8. **Dashboard UI**
   - Reputation score card (large number + trend)
   - SERP position grid (keyword x position)
   - **Social Media Feed** (NEW): Real-time feed of Instagram, LinkedIn, Facebook mentions
   - Recent alerts list (last 10)
   - Quick actions: "Generate Content", "Add Client", "View Social Mentions"

9. **Alert System**
   - Email notifications via Resend API
   - Trigger conditions:
     - New negative mention detected
     - Reputation score drops >5 points
     - Client disappears from Google page 1
     - Weekly summary (every Monday 9am)

---

## Non-Functional Requirements

### Performance
- Dashboard loads in <2 seconds (LCP)
- SERP check for 5 keywords completes in <30 seconds
- AI content generation: <5 minutes for 5 articles
- Database queries optimized with indexes on `client_id`, `created_at`, `sentiment`

### Scalability
- Support 50 clients in MVP (each with 5-10 keywords = 250-500 keyword checks/day)
- Database: Supabase Pro (8GB) sufficient for 1M+ mention records
- Edge Functions: 2M monthly invocations (well within Supabase limits)

### Security
- WordPress credentials encrypted with AES-256
- OpenAI API key stored as Supabase secret
- Row Level Security (RLS) enforced on all tables
- No sensitive data in logs

### Reliability
- Graceful degradation if SERP API fails (use cached data + warning)
- Retry logic: 3 attempts with exponential backoff for API calls
- Dead letter queue for failed background jobs

### Internationalization
- UI in Portuguese (PT-BR) initially
- Support PT, EN, ES content generation
- Currency/date formatting per locale
- Time zones handled correctly (all UTC in DB, display in user's TZ)

### Accessibility
- WCAG 2.1 AA compliance (minimum)
- Keyboard navigation for all features
- Screen reader tested for dashboard

### Cost Optimization
- Cache SERP results for 24h (don't re-check same keyword within 24h)
- Batch API calls where possible (check 5 keywords in 1 SerpAPI request)
- Lazy load historical data (only last 30 days by default)
- Monitor OpenAI token usage (alert if >$200/month)

---

## Technical Constraints

### API Budget ($400-600/month)
- **OpenAI GPT-4**: $120-150/month (generating ~50-75 articles + sentiment analysis)
- **SerpAPI**: $80-100/month (Brazil-only cheaper, ~5000 searches)
- **NewsAPI**: $0-50/month (free tier sufficient initially, upgrade if needed)
- **Social Media APIs**:
  - Instagram Graph API: $0 (free with Facebook Business account)
  - LinkedIn API: $0 (free tier, 500 requests/day sufficient)
  - Facebook Graph API: $0 (free with Facebook account)
- **Resend (Email)**: $0-20/month (free tier = 3000 emails/month, sufficient)
- **Supabase Pro**: $25/month
- **Vercel Pro**: $20/month
- **Buffer for overages**: $55-185/month

**Total Estimated**: $345-545/month (well within $400-600 budget)

### Technology Stack (Fixed)
- Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Edge Functions)
- AI: OpenAI GPT-4 (primary), Anthropic Claude (fallback)
- SERP: SerpAPI (primary), manual fallback
- Deployment: Vercel (frontend), Supabase (backend)

### External Dependencies
- WordPress sites must have REST API enabled (Application Passwords support)
- Google Brasil (google.com.br) must remain accessible
- Clients must have existing domains (no free blog creation in MVP)
- **Social Media Requirements**:
  - Instagram: Client must have Business/Creator account linked to Facebook Page
  - LinkedIn: Client must have Company Page (Personal profiles API is restricted)
  - Facebook: Client must have Business Page with admin access
- Founder's own brand used as initial test client

---

## Out of Scope (Future Versions)

### v0.2 - International Expansion
- Multi-language support (EN, ES) beyond PT-BR
- Multi-country SERP (google.com, google.es)
- Auto-translation of articles
- Currency/timezone handling for multiple regions

### v0.3 - Additional Social Platforms
- Twitter/X API integration
- TikTok monitoring
- YouTube comment tracking
- WhatsApp Business API
- Social posting automation (schedule posts across platforms)

### v0.4 - Advanced SEO
- Backlink tracking and outreach
- Competitor analysis
- Keyword research tools
- SERP feature tracking (featured snippets, knowledge panels)

### v0.4 - Reporting & White-Label
- PDF report generation
- White-label branding for agencies
- Client portal (view-only access)
- Custom domains

### v0.5 - AI Enhancements
- Voice-to-article (record response, AI converts to article)
- Image generation (featured images for articles)
- Video script generation
- Multi-modal content (infographics, slides)

---

## Success Criteria

### MVP is successful if:
1. ✅ System monitors 5 clients with 5 keywords each (25 total keywords)
2. ✅ Detects negative mention within 24 hours of publication
3. ✅ Generates 5 unique articles in <5 minutes with SEO score >70
4. ✅ Publishes to WordPress as draft in 1 click
5. ✅ Reputation score calculation matches manual calculation (±2 points)
6. ✅ Dashboard loads in <2 seconds with all data
7. ✅ Zero data loss (all mentions, SERP checks, generated content persisted)
8. ✅ Total cost stays under $600/month

### User validates MVP when:
- Solo founder uses it for 1-3 beta clients for 30 days
- At least 1 client's reputation score increases by 10+ points
- At least 1 negative article is pushed from page 1 to page 3+ on Google
- User reports saving 10+ hours/week vs manual monitoring

---

## Dependencies

### Must Have Before Development Starts
- [x] Supabase project created (hyeifxvxifhrapfdvfry)
- [x] Project constitution ratified (v1.0.0)
- [ ] OpenAI API key obtained ($20 credit minimum)
- [ ] SerpAPI account created (free trial = 100 searches)
- [ ] 1 test client with WordPress blog for integration testing

### Nice to Have
- [ ] NewsAPI account (can use Google News RSS as fallback)
- [ ] Domain for production (can use vercel.app for MVP)
- [ ] 2-3 beta clients committed to testing

---

## Risk Assessment

### High Risk
- **OpenAI cost overrun**: Generating 5 articles per crisis can get expensive
  - **Mitigation**: Set hard limit ($200/month), use GPT-3.5-turbo for drafts, GPT-4 for final
- **SERP API rate limits**: Checking too frequently hits limits
  - **Mitigation**: Daily checks only, cache aggressively, have manual fallback

### Medium Risk
- **WordPress API changes**: Client sites break integration
  - **Mitigation**: Test with 3+ WordPress versions, have copy/paste fallback
- **Google algorithm changes**: SERP positions fluctuate wildly
  - **Mitigation**: Track trends over 7 days, not daily volatility

### Low Risk
- **Supabase downtime**: Database unavailable
  - **Mitigation**: Vercel Edge Functions can use Upstash Redis as temporary cache
- **Solo founder burnout**: 2-4 week timeline is aggressive
  - **Mitigation**: Ruthlessly cut scope, use AI for code generation, focus on P1 only

---

## Review & Acceptance Checklist

Before marking this spec as "Ready for Planning":

- [ ] All user stories have clear acceptance criteria
- [ ] Success metrics are measurable and realistic
- [ ] Budget constraints are documented and feasible
- [ ] Technical stack aligns with project constitution
- [ ] Out-of-scope items are clearly defined
- [ ] At least 1 beta client is identified for testing
- [ ] Solo founder has reviewed and approved timeline
- [ ] All assumptions are documented (e.g., "clients have WordPress")
- [ ] Risks have mitigation strategies
- [ ] This spec can be implemented in 2-4 weeks by 1 developer

---

**Next Steps:**
1. Get approval on this specification
2. Run `/speckit.plan` to create technical implementation plan
3. Run `/speckit.tasks` to break down into actionable development tasks
4. Run `/speckit.implement` to build the MVP

**Estimated Effort:** 80-120 hours (2-4 weeks at 40h/week)
