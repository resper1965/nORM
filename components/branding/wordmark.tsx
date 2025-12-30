import { cn } from '@/lib/utils';

type WordmarkVariant = 'light' | 'dark' | 'muted';
type WordmarkSize = 'sm' | 'md' | 'lg';

interface WordmarkProps {
  variant?: WordmarkVariant;
  size?: WordmarkSize;
  className?: string;
}

const textColorByVariant: Record<WordmarkVariant, string> = {
  light: 'text-[#0B0C0E]',
  dark: 'text-white',
  muted: 'text-foreground',
};

const sizeByVariant: Record<WordmarkSize, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function Wordmark({
  variant = 'muted',
  size = 'md',
  className,
}: WordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-semibold tracking-[0.08em]',
        textColorByVariant[variant],
        sizeByVariant[size],
        className
      )}
      aria-label="n.ORM"
    >
      <span className="font-semibold">n</span>
      <span className="text-[#00ADE8]">.</span>
      <span className="font-semibold">ORM</span>
    </span>
  );
}


