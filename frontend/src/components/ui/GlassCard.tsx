'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  accentColor?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hoverEffect = false,
  accentColor,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass glass-hover relative rounded-xl',
        hoverEffect && 'cursor-pointer',
        className
      )}
      whileHover={
        hoverEffect
          ? {
              scale: 1.01,
              borderColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
    >
      {accentColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ backgroundColor: accentColor }}
        />
      )}
      {children}
    </motion.div>
  );
}
