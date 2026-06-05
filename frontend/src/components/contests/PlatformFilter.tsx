'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLATFORMS } from '@/lib/constants';
import { Platform } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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
            ? "bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
            : "bg-transparent text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200"
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
                ? "text-white shadow-lg" 
                : "bg-transparent text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200"
            )}
            style={{ 
              borderColor: isSelected ? platform.color + '40' : undefined,
              backgroundColor: isSelected ? platform.color + '20' : undefined
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: platform.color, boxShadow: isSelected ? `0 0 8px ${platform.color}` : 'none' }} 
              />
              {platform.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
