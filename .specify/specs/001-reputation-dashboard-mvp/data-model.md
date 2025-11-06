# Data Model: nORM - Online Reputation Dashboard MVP

**Feature**: `001-reputation-dashboard-mvp`  
**Date**: 2025-11-06  
**Database**: Supabase PostgreSQL  
**Schema Version**: 1.0.0

## Overview

This document defines the complete database schema for the nORM MVP, including all tables, relationships, indexes, and Row Level Security (RLS) policies. The schema supports multi-client reputation monitoring, SERP tracking, social media monitoring, content generation, and alerting.

## Entity Relationship Diagram

```
┌─────────────┐
│   users     │ (Supabase Auth)
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────────┐
│   client_users          │ (RBAC: admin, editor, viewer)
└──────┬──────────────────┘
       │
       │ N:1
       │
┌──────▼──────┐
│   clients   │
└──────┬──────┘
       │
       ├─── 1:N ───┐
       │            │
       │            │
┌──────▼──────┐  ┌──▼──────────────┐  ┌──────────────┐
│  keywords   │  │  social_accounts │  │ wordpress_   │
│             │  │                  │  │  sites       │
└──────┬──────┘  └──┬───────────────┘  └──────────────┘
       │            │
       │ 1:N        │ 1:N
       │            │
┌──────▼──────────┐ │  ┌──────────────┐
│  serp_results   │ │  │ social_posts │
└─────────────────┘ │  └──────────────┘
                    │
┌───────────────────┘
│
┌──────▼──────────────┐
│  news_mentions      │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│ generated_content   │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│ reputation_scores   │
└─────────────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│      alerts         │
└─────────────────────┘

┌──────────────────────┐
│    audit_logs        │ (standalone, for compliance)
└──────────────────────┘
```

## Core Tables

### 1. `clients`

Stores client companies/individuals being monitored.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Client unique identifier |
| `name` | `text` | NOT NULL | Client name (e.g., "Empresa ABC") |
| `industry` | `text` | | Industry sector |
| `website` | `text` | | Client website URL |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last update timestamp |
| `created_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | User who created client |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Whether monitoring is active |

**Indexes**:
- `idx_clients_created_by` ON `clients(created_by)`
- `idx_clients_is_active` ON `clients(is_active)`

**RLS Policies**:
- Users can SELECT clients they have access to (via `client_users`)
- Only admins can INSERT/UPDATE/DELETE clients

---

### 2. `client_users`

RBAC mapping: which users have access to which clients with what role.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Mapping ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` | User reference |
| `role` | `text` | NOT NULL, CHECK (`role IN ('admin', 'editor', 'viewer')`) | User role |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Creation timestamp |

**Indexes**:
- `idx_client_users_client_id` ON `client_users(client_id)`
- `idx_client_users_user_id` ON `client_users(user_id)`
- UNIQUE `idx_client_users_unique` ON `(client_id, user_id)`

**RLS Policies**:
- Users can SELECT their own mappings
- Only admins can INSERT/UPDATE/DELETE mappings

---

### 3. `keywords`

Monitored search terms per client.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Keyword ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `keyword` | `text` | NOT NULL | Search term (e.g., "Empresa ABC fraude") |
| `priority` | `text` | NOT NULL, DEFAULT `'normal'`, CHECK (`priority IN ('high', 'normal', 'low')`) | Check frequency priority |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Whether keyword is monitored |
| `alert_threshold` | `integer` | DEFAULT `3` | Alert if position changes by this many spots |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last update timestamp |

**Indexes**:
- `idx_keywords_client_id` ON `keywords(client_id)`
- `idx_keywords_is_active` ON `keywords(is_active)`
- `idx_keywords_priority` ON `keywords(priority)`

**RLS Policies**:
- Users can SELECT keywords for clients they have access to
- Only admins/editors can INSERT/UPDATE/DELETE keywords

---

### 4. `serp_results`

Historical Google position data for keywords.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Result ID |
| `keyword_id` | `uuid` | NOT NULL, FK → `keywords(id) ON DELETE CASCADE` | Keyword reference |
| `position` | `integer` | NOT NULL | Google position (1-100, NULL if not found) |
| `url` | `text` | NOT NULL | Result URL |
| `title` | `text` | | Result title |
| `snippet` | `text` | | Result snippet |
| `domain` | `text` | | Domain of result URL |
| `checked_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When SERP was checked |
| `is_client_content` | `boolean` | DEFAULT `false` | Whether this is client's own content |

**Indexes**:
- `idx_serp_results_keyword_id` ON `serp_results(keyword_id)`
- `idx_serp_results_checked_at` ON `serp_results(checked_at DESC)`
- `idx_serp_results_position` ON `serp_results(position)`
- Composite: `idx_serp_results_keyword_checked` ON `(keyword_id, checked_at DESC)`

**RLS Policies**:
- Users can SELECT results for clients they have access to
- System can INSERT results (via service role)

**Data Retention**: 90 days minimum (archive older data)

---

### 5. `news_mentions`

Scraped news articles mentioning clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Mention ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `title` | `text` | NOT NULL | Article title |
| `url` | `text` | NOT NULL, UNIQUE | Article URL |
| `excerpt` | `text` | | Article excerpt/snippet |
| `source` | `text` | | News source (e.g., "G1", "Folha de S.Paulo") |
| `published_at` | `timestamptz` | | Article publish date |
| `scraped_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When article was scraped |
| `sentiment` | `text` | CHECK (`sentiment IN ('positive', 'neutral', 'negative')`) | Sentiment classification |
| `sentiment_score` | `decimal(3,2)` | CHECK (`sentiment_score >= -1.0 AND sentiment_score <= 1.0`) | Sentiment score (-1.0 to +1.0) |
| `sentiment_confidence` | `decimal(3,2)` | CHECK (`sentiment_confidence >= 0.0 AND sentiment_confidence <= 1.0`) | Confidence (0.0 to 1.0) |
| `sentiment_rationale` | `text` | | AI explanation (e.g., "Mentions 'lawsuit' and 'fraud'") |
| `language` | `text` | DEFAULT `'pt-BR'` | Article language |

**Indexes**:
- `idx_news_mentions_client_id` ON `news_mentions(client_id)`
- `idx_news_mentions_scraped_at` ON `news_mentions(scraped_at DESC)`
- `idx_news_mentions_sentiment` ON `news_mentions(sentiment)`
- `idx_news_mentions_url` ON `news_mentions(url)` (for deduplication)

**RLS Policies**:
- Users can SELECT mentions for clients they have access to
- System can INSERT mentions (via service role)

**Data Retention**: 90 days minimum

---

### 6. `social_accounts`

Connected social media accounts (Instagram, LinkedIn, Facebook).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Account ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `platform` | `text` | NOT NULL, CHECK (`platform IN ('instagram', 'linkedin', 'facebook')`) | Platform name |
| `account_id` | `text` | NOT NULL | Platform account ID |
| `account_name` | `text` | | Display name |
| `access_token_encrypted` | `text` | NOT NULL | Encrypted access token (AES-256) |
| `refresh_token_encrypted` | `text` | | Encrypted refresh token |
| `token_expires_at` | `timestamptz` | | Token expiration |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Whether account is monitored |
| `last_synced_at` | `timestamptz` | | Last successful sync |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last update timestamp |

**Indexes**:
- `idx_social_accounts_client_id` ON `social_accounts(client_id)`
- `idx_social_accounts_platform` ON `social_accounts(platform)`
- `idx_social_accounts_is_active` ON `social_accounts(is_active)`

**RLS Policies**:
- Users can SELECT accounts for clients they have access to
- Only admins can INSERT/UPDATE/DELETE accounts (tokens are sensitive)

**Security**: Tokens encrypted with AES-256, key stored in Supabase secrets

---

### 7. `social_posts`

Aggregated social media mentions (posts, comments, stories).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Post ID |
| `social_account_id` | `uuid` | NOT NULL, FK → `social_accounts(id) ON DELETE CASCADE` | Account reference |
| `platform` | `text` | NOT NULL, CHECK (`platform IN ('instagram', 'linkedin', 'facebook')`) | Platform name |
| `post_id` | `text` | NOT NULL | Platform post ID |
| `post_url` | `text` | | Post URL |
| `author_id` | `text` | | Author user ID on platform |
| `author_name` | `text` | | Author display name |
| `content` | `text` | | Post/comment content |
| `content_type` | `text` | NOT NULL, CHECK (`content_type IN ('post', 'comment', 'story', 'mention')`) | Type of content |
| `published_at` | `timestamptz` | NOT NULL | When content was published |
| `scraped_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When content was scraped |
| `engagement_likes` | `integer` | DEFAULT `0` | Number of likes |
| `engagement_comments` | `integer` | DEFAULT `0` | Number of comments |
| `engagement_shares` | `integer` | DEFAULT `0` | Number of shares |
| `sentiment` | `text` | CHECK (`sentiment IN ('positive', 'neutral', 'negative')`) | Sentiment classification |
| `sentiment_score` | `decimal(3,2)` | CHECK (`sentiment_score >= -1.0 AND sentiment_score <= 1.0`) | Sentiment score |
| `sentiment_confidence` | `decimal(3,2)` | CHECK (`sentiment_confidence >= 0.0 AND sentiment_confidence <= 1.0`) | Confidence |
| `screenshot_url` | `text` | | URL to screenshot (for Instagram Stories) |
| `language` | `text` | DEFAULT `'pt-BR'` | Content language |

**Indexes**:
- `idx_social_posts_social_account_id` ON `social_posts(social_account_id)`
- `idx_social_posts_platform` ON `social_posts(platform)`
- `idx_social_posts_published_at` ON `social_posts(published_at DESC)`
- `idx_social_posts_sentiment` ON `social_posts(sentiment)`
- UNIQUE `idx_social_posts_unique` ON `(platform, post_id)`

**RLS Policies**:
- Users can SELECT posts for clients they have access to
- System can INSERT posts (via service role)

**Data Retention**: 90 days minimum

---

### 8. `wordpress_sites`

WordPress site configurations for auto-publishing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Site ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `site_url` | `text` | NOT NULL | WordPress site URL |
| `username` | `text` | NOT NULL | WordPress username |
| `application_password_encrypted` | `text` | NOT NULL | Encrypted application password |
| `default_category` | `text` | DEFAULT `'Blog'` | Default post category |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Whether auto-publish is enabled |
| `last_tested_at` | `timestamptz` | | Last connection test |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last update timestamp |

**Indexes**:
- `idx_wordpress_sites_client_id` ON `wordpress_sites(client_id)`
- `idx_wordpress_sites_is_active` ON `wordpress_sites(is_active)`

**RLS Policies**:
- Users can SELECT sites for clients they have access to
- Only admins can INSERT/UPDATE/DELETE sites (credentials are sensitive)

**Security**: Passwords encrypted with AES-256

---

### 9. `generated_content`

AI-generated articles for reputation management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Content ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `trigger_mention_id` | `uuid` | FK → `news_mentions(id)` | Negative mention that triggered generation |
| `title` | `text` | NOT NULL | Article title |
| `content` | `text` | NOT NULL | Full article content (HTML) |
| `meta_description` | `text` | | SEO meta description |
| `target_keywords` | `text[]` | | Array of target keywords |
| `seo_score` | `integer` | CHECK (`seo_score >= 0 AND seo_score <= 100`) | SEO score (0-100) |
| `readability_score` | `integer` | CHECK (`readability_score >= 0 AND readability_score <= 100`) | Readability score |
| `word_count` | `integer` | | Article word count |
| `status` | `text` | NOT NULL, DEFAULT `'draft'`, CHECK (`status IN ('draft', 'published', 'archived')`) | Content status |
| `wordpress_post_id` | `integer` | | WordPress post ID (if published) |
| `wordpress_site_id` | `uuid` | FK → `wordpress_sites(id)` | WordPress site reference |
| `generated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Generation timestamp |
| `published_at` | `timestamptz` | | Publication timestamp |
| `created_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | User who generated content |

**Indexes**:
- `idx_generated_content_client_id` ON `generated_content(client_id)`
- `idx_generated_content_status` ON `generated_content(status)`
- `idx_generated_content_generated_at` ON `generated_content(generated_at DESC)`
- `idx_generated_content_trigger_mention_id` ON `generated_content(trigger_mention_id)`

**RLS Policies**:
- Users can SELECT content for clients they have access to
- Users can INSERT/UPDATE content (editors and admins)

---

### 10. `reputation_scores`

Historical reputation score calculations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Score ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `score` | `decimal(5,2)` | NOT NULL, CHECK (`score >= 0 AND score <= 100`) | Reputation score (0-100) |
| `score_breakdown` | `jsonb` | NOT NULL | Detailed breakdown: `{serp: 35, news: 25, social: 20, trend: 15, volume: 5}` |
| `calculated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Calculation timestamp |
| `period_start` | `date` | NOT NULL | Start of calculation period (30 days) |
| `period_end` | `date` | NOT NULL | End of calculation period |

**Indexes**:
- `idx_reputation_scores_client_id` ON `reputation_scores(client_id)`
- `idx_reputation_scores_calculated_at` ON `reputation_scores(calculated_at DESC)`
- Composite: `idx_reputation_scores_client_calculated` ON `(client_id, calculated_at DESC)`

**RLS Policies**:
- Users can SELECT scores for clients they have access to
- System can INSERT scores (via service role)

**Data Retention**: 1 year minimum

---

### 11. `alerts`

Reputation alerts (negative mentions, score drops, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Alert ID |
| `client_id` | `uuid` | NOT NULL, FK → `clients(id) ON DELETE CASCADE` | Client reference |
| `alert_type` | `text` | NOT NULL, CHECK (`alert_type IN ('negative_mention', 'score_drop', 'serp_change', 'social_negative', 'critical')`) | Alert type |
| `severity` | `text` | NOT NULL, CHECK (`severity IN ('low', 'medium', 'high', 'critical')`) | Alert severity |
| `title` | `text` | NOT NULL | Alert title |
| `message` | `text` | NOT NULL | Alert message |
| `related_mention_id` | `uuid` | FK → `news_mentions(id)` | Related news mention |
| `related_social_post_id` | `uuid` | FK → `social_posts(id)` | Related social post |
| `related_serp_result_id` | `uuid` | FK → `serp_results(id)` | Related SERP result |
| `status` | `text` | NOT NULL, DEFAULT `'active'`, CHECK (`status IN ('active', 'acknowledged', 'resolved', 'dismissed')`) | Alert status |
| `email_sent` | `boolean` | DEFAULT `false` | Whether email notification was sent |
| `email_sent_at` | `timestamptz` | | Email sent timestamp |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Creation timestamp |
| `resolved_at` | `timestamptz` | | Resolution timestamp |
| `resolved_by` | `uuid` | FK → `auth.users(id)` | User who resolved alert |

**Indexes**:
- `idx_alerts_client_id` ON `alerts(client_id)`
- `idx_alerts_status` ON `alerts(status)`
- `idx_alerts_severity` ON `alerts(severity)`
- `idx_alerts_created_at` ON `alerts(created_at DESC)`
- Composite: `idx_alerts_client_status` ON `(client_id, status)`

**RLS Policies**:
- Users can SELECT alerts for clients they have access to
- Users can UPDATE alerts (to acknowledge/resolve)
- System can INSERT alerts (via service role)

---

### 12. `audit_logs`

Compliance audit trail (1 year retention).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Log ID |
| `user_id` | `uuid` | FK → `auth.users(id)` | User who performed action |
| `client_id` | `uuid` | FK → `clients(id)` | Client affected |
| `action` | `text` | NOT NULL | Action type (e.g., "client.created", "content.published") |
| `resource_type` | `text` | NOT NULL | Resource type (e.g., "client", "content", "alert") |
| `resource_id` | `uuid` | | Resource ID |
| `metadata` | `jsonb` | | Additional metadata |
| `ip_address` | `inet` | | User IP address |
| `user_agent` | `text` | | User agent string |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Action timestamp |

**Indexes**:
- `idx_audit_logs_user_id` ON `audit_logs(user_id)`
- `idx_audit_logs_client_id` ON `audit_logs(client_id)`
- `idx_audit_logs_action` ON `audit_logs(action)`
- `idx_audit_logs_created_at` ON `audit_logs(created_at DESC)`
- Composite: `idx_audit_logs_client_created` ON `(client_id, created_at DESC)`

**RLS Policies**:
- Admins can SELECT all audit logs
- System can INSERT audit logs (via service role)
- No UPDATE/DELETE allowed (immutable)

**Data Retention**: 1 year (automated cleanup job)

---

## Database Functions & Triggers

### Functions

1. **`update_updated_at_column()`**
   - Updates `updated_at` timestamp on row update
   - Used by triggers on all tables with `updated_at`

2. **`calculate_reputation_score(client_id uuid)`**
   - Calculates reputation score for a client
   - Returns score (0-100) and breakdown JSONB
   - Used by scheduled job

3. **`check_alert_conditions(client_id uuid)`**
   - Checks if alert conditions are met
   - Creates alerts if needed
   - Used by scheduled job

### Triggers

1. **`set_updated_at`** on all tables with `updated_at`
   - Automatically updates `updated_at` on row update

2. **`audit_log_trigger`** on critical tables
   - Logs all INSERT/UPDATE/DELETE operations
   - Writes to `audit_logs` table

---

## Row Level Security (RLS) Summary

All tables have RLS enabled. Policies follow this pattern:

1. **SELECT**: Users can read data for clients they have access to (via `client_users`)
2. **INSERT**: 
   - System tables (serp_results, news_mentions, social_posts, reputation_scores, alerts, audit_logs): Service role only
   - User tables (clients, keywords, generated_content): Admins/editors only
3. **UPDATE**: Admins/editors can update data for clients they have access to
4. **DELETE**: Only admins can delete data

**Service Role**: Used by Edge Functions and cron jobs to bypass RLS for system operations.

---

## Indexes Summary

All foreign keys are indexed. Additional indexes for:
- Time-based queries (`created_at`, `updated_at`, `checked_at`, `published_at`)
- Filtering (`is_active`, `status`, `sentiment`, `platform`)
- Composite indexes for common query patterns

**Total Indexes**: ~40 indexes across all tables

---

## Data Retention & Archival

- **SERP Results**: 90 days (archive older data to separate table)
- **News Mentions**: 90 days
- **Social Posts**: 90 days
- **Reputation Scores**: 1 year
- **Audit Logs**: 1 year (then delete)
- **Generated Content**: Keep forever (no archival)

**Archival Strategy**: Monthly job moves old data to `*_archive` tables, then deletes after retention period.

---

## Migration Strategy

Migrations are numbered sequentially:
1. `001_initial_schema.sql` - Core tables (clients, users, keywords)
2. `002_clients_and_users.sql` - Client-user relationships
3. `003_reputation_monitoring.sql` - SERP and news monitoring
4. `004_media_monitoring.sql` - News mentions
5. `005_social_media.sql` - Social accounts and posts
6. `006_content_generation.sql` - Generated content and WordPress
7. `007_alerts.sql` - Alert system
8. `008_audit_logs.sql` - Audit logging
9. `009_rls_policies.sql` - Row Level Security policies

Each migration is idempotent and can be run multiple times safely.

---

## Next Steps

1. Review this data model
2. Generate SQL migrations in `supabase/migrations/`
3. Create TypeScript types from schema (using Supabase CLI)
4. Implement RLS policies
5. Set up data retention jobs

