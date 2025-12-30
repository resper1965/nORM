'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface BekaaBrandingProps {
  variant?: 'sidebar' | 'footer' | 'inline';
  className?: string;
}

export function BekaaBranding({ variant = 'footer', className = '' }: BekaaBrandingProps) {
  const baseClasses = 'flex items-center gap-2 transition-all duration-300';

  const variantClasses = {
    sidebar: 'text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/70',
    footer: 'text-sm text-muted-foreground hover:text-foreground',
    inline: 'text-sm text-muted-foreground',
  };

  return (
    <Link
      href="https://bekaa.com.br"
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label="Desenvolvido por Bekaa"
    >
      <span className="tracking-[0.02em]">Powered by</span>
      <span className="flex items-center gap-1.5 font-semibold tracking-[0.01em]">
        <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>Bekaa</span>
      </span>
    </Link>
  );
}
