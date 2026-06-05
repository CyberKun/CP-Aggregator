import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  color: string;
  variant?: 'solid' | 'outline' | 'glow';
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  color,
  variant = 'solid',
  size = 'sm',
}: BadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center font-medium rounded-full whitespace-nowrap',
    size === 'sm' ? 'px-2.5 py-0.5 text-[11px] tracking-wide' : 'px-3 py-1 text-xs'
  );

  if (variant === 'solid') {
    return (
      <span
        className={baseClasses}
        style={{
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {label}
      </span>
    );
  }

  if (variant === 'outline') {
    return (
      <span
        className={baseClasses}
        style={{
          border: `1px solid ${color}40`,
          color: color,
          backgroundColor: 'transparent',
        }}
      >
        {label}
      </span>
    );
  }

  // glow variant
  return (
    <span
      className={baseClasses}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        boxShadow: `0 0 12px ${color}30, 0 0 4px ${color}20`,
      }}
    >
      {label}
    </span>
  );
}
