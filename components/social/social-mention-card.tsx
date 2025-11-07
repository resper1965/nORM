'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Instagram, Linkedin, Facebook, Heart, MessageCircle, Share2 } from 'lucide-react';
import type { SocialPost } from '@/lib/types/domain';
import { SentimentBadge } from '@/components/social/sentiment-badge';

interface SocialMentionCardProps {
  post: SocialPost;
}

export function SocialMentionCard({ post }: SocialMentionCardProps) {
  const platformIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
  };

  const platformStyles = {
    instagram: 'bg-primary/15 text-primary',
    linkedin: 'bg-muted/40 text-muted-foreground',
    facebook: 'bg-muted/40 text-muted-foreground',
  };

  const Icon = platformIcons[post.platform];
  const sentiment = post.sentiment || 'neutral';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${platformStyles[post.platform]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{post.author_name || 'Unknown'}</span>
              <SentimentBadge sentiment={sentiment} score={post.sentiment_score} confidence={post.sentiment_confidence} />
            </div>
            {post.content && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-3 leading-relaxed">
                {post.content}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{post.engagement_likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.engagement_comments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                <span>{post.engagement_shares}</span>
              </div>
              <span>{new Date(post.published_at).toLocaleString('pt-BR')}</span>
            </div>
            {post.post_url && (
              <a
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 transition-colors mt-2 inline-flex items-center gap-1"
              >
                Ver post original
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

