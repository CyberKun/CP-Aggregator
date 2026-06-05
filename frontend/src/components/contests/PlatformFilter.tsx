'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLATFORMS } from '@/lib/constants';
import { Platform } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { PlatformIcon } from '@/components/ui/PlatformIcon';

interface PlatformFilterProps {
  selectedPlatforms: Set<Platform>;
  onToggle: (platform: Platform) => void;
  onToggleAll: () => void;
}

export function PlatformFilter({ selectedPlatforms, onToggle, onToggleAll }: PlatformFilterProps) {
  const allSelected = selectedPlatforms.size === PLATFORMS.length;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      <button
        onClick={onToggleAll}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all relative overflow-hidden border",
          allSelected 
            ? "bg-[var(--color-elevated)] text-[var(--color-text-primary)] border-[var(--color-border-hover)] shadow-sm" 
            : "bg-[var(--color-panel)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
        )}
      >
        {allSelected && (
          <motion.div 
            layoutId="filter-active-bg-all"
            className="absolute inset-0 bg-white/5"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          {allSelected && <Check className="w-3.5 h-3.5" />}
          All Platforms
        </span>
      </button>

      {PLATFORMS.map((platform) => {
        const isSelected = selectedPlatforms.has(platform.key);
        
        return (
          <button
            key={platform.key}
            onClick={() => onToggle(platform.key)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all relative overflow-hidden border",
              isSelected 
                ? "text-[var(--color-text-primary)] shadow-sm bg-[var(--color-panel)]" 
                : "bg-[var(--color-panel)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
            )}
            style={{ 
              borderColor: isSelected ? platform.color + '40' : undefined,
              backgroundColor: isSelected ? platform.color + '10' : undefined
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <PlatformIcon 
                platform={platform.key} 
                color={platform.color} 
                className="w-4 h-4 mr-0.5"
                style={{ 
                  filter: isSelected ? `drop-shadow(0 0 4px ${platform.color}80)` : 'none',
                  boxShadow: isSelected && platform.key !== 'CODEFORCES' && platform.key !== 'LEETCODE' ? `0 0 8px ${platform.color}40` : 'none' 
                }} 
              />
              {platform.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
