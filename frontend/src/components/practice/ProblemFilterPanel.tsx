'use client';

import React, { useState } from 'react';
import { Platform } from '@/types';
import { PLATFORM_MAP, PLATFORMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { X, LayoutGrid, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DifficultyTier } from '@/hooks/useProblems';

interface ProblemFilterPanelProps {
  filters: {
    platforms: Platform[];
    tier: DifficultyTier;
    tags?: string[];
    status?: 'all' | 'solved' | 'unsolved';
  };
  updateFilters: (filters: Partial<ProblemFilterPanelProps['filters']>) => void;
}

export const ProblemFilterPanel: React.FC<ProblemFilterPanelProps> = ({ filters, updateFilters }) => {
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const COMMON_CF_TAGS = ['dp', 'greedy', 'math', 'implementation', 'data structures', 'graphs', 'sortings', 'binary search', 'dfs and similar', 'trees', 'strings', 'number theory', 'geometry', 'combinatorics', 'two pointers', 'bitmasks'];
  const COMMON_LC_TAGS = ['array', 'string', 'hash-table', 'dynamic-programming', 'math', 'sorting', 'greedy', 'depth-first-search', 'binary-search', 'database', 'breadth-first-search', 'tree', 'matrix', 'two-pointers'];

  const activePlatform = filters.platforms[0] || 'CODEFORCES';
  
  const suggestedTags = (activePlatform === 'CODEFORCES' ? COMMON_CF_TAGS : COMMON_LC_TAGS)
    .filter(tag => tag.includes(tagInput.toLowerCase()) && !(filters.tags || []).includes(tag))
    .slice(0, 5);

  const handlePlatformSelect = (platform: Platform) => {
    const current = filters.platforms || [];
    let newPlatforms;
    if (current.includes(platform)) {
      if (current.length === 1) return; // Prevent deselecting the last platform
      newPlatforms = current.filter(p => p !== platform);
    } else {
      newPlatforms = [...current, platform];
    }
    updateFilters({ platforms: newPlatforms });
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      const currentTags = filters.tags || [];
      if (!currentTags.includes(newTag)) {
        updateFilters({ tags: [...currentTags, newTag] });
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    const currentTags = filters.tags || [];
    updateFilters({ tags: currentTags.filter((t) => t !== tag) });
  };

  const tiers: { level: DifficultyTier, label: string, color: string }[] = [
    { level: 1, label: 'Beginner', color: 'from-slate-100 to-emerald-600' },
    { level: 2, label: 'Novice', color: 'from-slate-300 to-teal-600' },
    { level: 3, label: 'Intermediate', color: 'from-blue-400 to-blue-600' },
    { level: 4, label: 'Advanced', color: 'from-slate-100 to-emerald-600' },
    { level: 5, label: 'Expert', color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="w-full max-w-[280px] flex-shrink-0 flex flex-col gap-8 p-6 rounded-3xl glass-surface border border-[var(--color-border)] shadow-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-200 rounded-full mix-blend-screen filter blur-[50px] opacity-10"></div>
      
      {/* TAGS SECTION (MOVED TO TOP) */}
      <div>
        <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
          Tags
        </h3>
        <div className="relative mb-4 z-50">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleTagAdd}
            placeholder="e.g. dp, graphs (Enter)"
            className="w-full bg-[var(--color-void)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-slate-200 focus:ring-1 focus:ring-slate-200 transition-all shadow-inner"
          />
          {showSuggestions && suggestedTags.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-[160px] overflow-y-auto bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl shadow-2xl z-[100] p-1">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    if (!currentTags.includes(tag)) {
                      updateFilters({ tags: [...currentTags, tag] });
                    }
                    setTagInput('');
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] rounded-lg transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 relative z-10">
          {(filters.tags || []).map((tag) => (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-void)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 border border-[var(--color-border)] text-xs font-bold tracking-wide text-[var(--color-text-primary)] transition-colors cursor-pointer shadow-sm"
              onClick={() => handleTagRemove(tag)}
              title="Click to remove"
            >
              {tag}
              <X className="w-3 h-3 opacity-70" />
            </motion.span>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      {/* PLATFORMS SECTION */}
      <div>
        <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-slate-300" />
          Platforms
        </h3>
        <div className="flex flex-col gap-2.5 relative z-10">
          {PLATFORMS.map((platformInfo) => {
            const p = platformInfo.key as Platform;
            const info = PLATFORM_MAP[p];
            const isSelected = (filters.platforms || []).includes(p);
            return (
              <button
                key={p}
                onClick={() => handlePlatformSelect(p)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-sm font-bold tracking-wide",
                  isSelected 
                    ? "bg-[var(--color-void)] border-slate-200 text-[var(--color-text-primary)] shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                    : "bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-void)]/50 hover:text-[var(--color-text-primary)]"
                )}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full transition-transform duration-300" 
                  style={{ 
                    backgroundColor: info?.color,
                    boxShadow: isSelected ? `0 0 10px ${info?.color}` : 'none',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                  }} 
                />
                {info?.name || p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      <div>
        <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
          <Swords className="w-4 h-4 text-slate-100" />
          Difficulty Tier
        </h3>
        <div className="flex flex-col gap-2 relative z-10">
          {tiers.map((t) => {
            const isSelected = filters.tier === t.level;
            return (
              <button
                key={t.level}
                onClick={() => updateFilters({ tier: t.level })}
                className={cn(
                  "relative overflow-hidden flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 text-sm font-bold tracking-wide",
                  isSelected 
                    ? `bg-[var(--color-void)] border-[var(--color-border)] text-white shadow-lg` 
                    : "bg-transparent border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-void)]/50 hover:text-[var(--color-text-primary)]"
                )}
              >
                {isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${t.color} opacity-20`} />
                )}
                <span className="relative z-10">{t.label}</span>
                <span className="relative z-10 text-xs opacity-50 font-mono">T{t.level}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
