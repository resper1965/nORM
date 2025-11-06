'use client';

import { SocialMentionCard } from './social-mention-card';
import type { SocialPost } from '@/lib/types/domain';

interface SocialFeedProps {
  posts: SocialPost[];
  isLoading?: boolean;
}

export function SocialFeed({ posts, isLoading }: SocialFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No social mentions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <SocialMentionCard key={post.id} post={post} />
      ))}
    </div>
  );
}

