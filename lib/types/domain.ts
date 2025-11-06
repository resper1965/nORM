/**
 * Domain models for nORM
 * Core business entities and their types
 */

export type ClientRole = 'admin' | 'editor' | 'viewer';

export type KeywordPriority = 'high' | 'normal' | 'low';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type AlertType = 
  | 'negative_mention' 
  | 'score_drop' 
  | 'serp_change' 
  | 'social_negative' 
  | 'critical';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

export type ContentStatus = 'draft' | 'published' | 'archived';

export type SocialPlatform = 'instagram' | 'linkedin' | 'facebook';

export type ContentType = 'post' | 'comment' | 'story' | 'mention';

export interface Client {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  is_active: boolean;
}

export interface ClientUser {
  id: string;
  client_id: string;
  user_id: string;
  role: ClientRole;
  created_at: Date;
}

export interface Keyword {
  id: string;
  client_id: string;
  keyword: string;
  priority: KeywordPriority;
  is_active: boolean;
  alert_threshold: number;
  created_at: Date;
  updated_at: Date;
}

export interface SERPResult {
  id: string;
  keyword_id: string;
  position: number | null;
  url: string;
  title?: string;
  snippet?: string;
  domain?: string;
  checked_at: Date;
  is_client_content: boolean;
}

export interface NewsMention {
  id: string;
  client_id: string;
  title: string;
  url: string;
  excerpt?: string;
  source?: string;
  published_at?: Date;
  scraped_at: Date;
  sentiment?: Sentiment;
  sentiment_score?: number; // -1.0 to 1.0
  sentiment_confidence?: number; // 0.0 to 1.0
  sentiment_rationale?: string;
  language: string;
}

export interface SocialAccount {
  id: string;
  client_id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name?: string;
  is_active: boolean;
  last_synced_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SocialPost {
  id: string;
  social_account_id: string;
  platform: SocialPlatform;
  post_id: string;
  post_url?: string;
  author_id?: string;
  author_name?: string;
  content?: string;
  content_type: ContentType;
  published_at: Date;
  scraped_at: Date;
  engagement_likes: number;
  engagement_comments: number;
  engagement_shares: number;
  sentiment?: Sentiment;
  sentiment_score?: number;
  sentiment_confidence?: number;
  screenshot_url?: string;
  language: string;
}

export interface WordPressSite {
  id: string;
  client_id: string;
  site_url: string;
  username: string;
  default_category: string;
  is_active: boolean;
  last_tested_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GeneratedContent {
  id: string;
  client_id: string;
  trigger_mention_id?: string;
  title: string;
  content: string;
  meta_description?: string;
  target_keywords: string[];
  seo_score?: number; // 0-100
  readability_score?: number; // 0-100
  word_count?: number;
  status: ContentStatus;
  wordpress_post_id?: number;
  wordpress_site_id?: string;
  generated_at: Date;
  published_at?: Date;
  created_by: string;
}

export interface ReputationScore {
  id: string;
  client_id: string;
  score: number; // 0-100
  score_breakdown: {
    serp: number;
    news: number;
    social: number;
    trend: number;
    volume: number;
  };
  calculated_at: Date;
  period_start: Date;
  period_end: Date;
}

export interface Alert {
  id: string;
  client_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_mention_id?: string;
  related_social_post_id?: string;
  related_serp_result_id?: string;
  status: AlertStatus;
  email_sent: boolean;
  email_sent_at?: Date;
  created_at: Date;
  resolved_at?: Date;
  resolved_by?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  client_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

