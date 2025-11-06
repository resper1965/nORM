'use client';

import { Instagram, Linkedin, Facebook } from 'lucide-react';
import type { SocialPlatform } from '@/lib/types/domain';

interface PlatformIconProps {
  platform: SocialPlatform;
  className?: string;
}

export function PlatformIcon({ platform, className = 'w-5 h-5' }: PlatformIconProps) {
  const icons = {
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
  };

  const Icon = icons[platform];
  return <Icon className={className} />;
}

