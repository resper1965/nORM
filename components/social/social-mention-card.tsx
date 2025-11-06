'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Linkedin, Facebook, Heart, MessageCircle, Share2 } from 'lucide-react';
import type { SocialPost } from '@/lib/types/domain';

interface SocialMentionCardProps {
  post: SocialPost;
}

export function SocialMentionCard({ post }: SocialMentionCardProps) {
  const platformIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
  };

  const platformColors = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    linkedin: 'bg-blue-600',
    facebook: 'bg-blue-500',
  };

  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-gray-100 text-gray-800',
    negative: 'bg-red-100 text-red-800',
  };

  const Icon = platformIcons[post.platform];
  const sentiment = post.sentiment || 'neutral';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${platformColors[post.platform]} text-white`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{post.author_name || 'Unknown'}</span>
              <Badge className={sentimentColors[sentiment]}>
                {sentiment}
              </Badge>
              {post.sentiment_score !== undefined && (
                <span className="text-xs text-gray-500">
                  ({post.sentiment_score > 0 ? '+' : ''}{post.sentiment_score.toFixed(2)})
                </span>
              )}
            </div>
            {post.content && (
              <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                {post.content}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
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
                className="text-xs text-blue-500 hover:underline mt-2 inline-block"
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

