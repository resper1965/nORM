/**
 * API request/response types
 * Types for API endpoints
 */

import type { 
  Client, 
  Keyword, 
  Alert, 
  GeneratedContent, 
  ReputationScore,
  SocialPost,
  SERPResult 
} from './domain';

// Generate Content API
export interface GenerateContentRequest {
  client_id: string;
  topic: string;
  article_count?: number; // 1-5, default 3
  trigger_mention_id?: string;
}

export interface GenerateContentResponse {
  articles: GeneratedContent[];
  generation_time_ms: number;
}

// Reputation API
export interface ReputationResponse {
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number; // Change from previous period
  breakdown: {
    serp: number;
    news: number;
    social: number;
    trend: number;
    volume: number;
  };
  calculated_at?: Date | string;
  period_start?: Date | string;
  period_end?: Date | string;
}

// SERP API
export interface SERPResponse {
  results: Array<{
    keyword: string;
    position: number | null;
    url: string;
    title?: string;
    snippet?: string;
    checked_at: Date | string;
  }>;
}

// Social Mentions API
export interface SocialMentionsResponse {
  mentions: SocialPost[];
  total: number;
}

// Alerts API
export interface AlertsResponse {
  alerts: Alert[];
}

// Clients API
export interface ClientsResponse {
  clients: Client[];
}

export interface ClientResponse {
  client: Client;
}

// WordPress Publish API
export interface WordPressPublishRequest {
  content_id: string;
  wordpress_site_id: string;
  category?: string;
  tags?: string[];
}

export interface WordPressPublishResponse {
  wordpress_post_id: number;
  wordpress_url: string;
}

// Error Response
export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

