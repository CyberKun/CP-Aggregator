'use client';

import React, { useState } from 'react';
import { Platform } from '@/types';
import { Checkbox } from '@/components/ui/Checkbox';
import { DualSlider } from '@/components/ui/DualSlider';
import { PLATFORM_MAP, PLATFORMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { X, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProblemFilterPanelProps {
  filters: {
    platforms: Platform[];
    difficulties?: string[];
    tags?: string[];
    minRating?: number;
    maxRating?: number;
    status?: 'all' | 'solved' | 'unsolved';
  };
  updateFilters: (filters: any) => void;
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

  // Now enforces a single platform selection and resets rating bounds
  const handlePlatformSelect = (platform: Platform) => {
    updateFilters({ 
      platforms: [platform],
      minRating: getMinDefault(platform),
      maxRating: getMaxDefault(platform)
    });
  };

  const handleDifficultyToggle = (diff: string) => {
    const currentDiffs = filters.difficulties || [];
    const newDiffs = currentDiffs.includes(diff)
      ? currentDiffs.filter((d) => d !== diff)
      : [...currentDiffs, diff];
    updateFilters({ difficulties: newDiffs });
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

  // Only the first platform is active
  const usesRating = ['CODEFORCES', 'ATCODER', 'CODECHEF'].includes(activePlatform);
  const isLC = activePlatform === 'LEETCODE';

  const getRatingOptions = (platform: string) => {
    switch (platform) {
      case 'CODEFORCES': return Array.from({ length: 28 }, (_, i) => 800 + i * 100);
      case 'ATCODER': return Array.from({ length: 41 }, (_, i) => i * 100);
      case 'CODECHEF': return Array.from({ length: 51 }, (_, i) => i * 100);
      default: return [];
    }
  };

  const getMinDefault = (platform: string) => platform === 'CODEFORCES' ? 800 : 0;
  const getMaxDefault = (platform: string) => {
    if (platform === 'CODEFORCES') return 3500;
    if (platform === 'ATCODER') return 4000;
    return 5000;
  };

  const ratingOptions = getRatingOptions(activePlatform);

  return (
    <div className="w-full max-w-[280px] flex-shrink-0 flex flex-col gap-8 p-6 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] backdrop-blur-xl">
      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
          <LayoutGrid className="w-3.5 h-3.5" />
          Select Platform
        </h3>
        <div className="flex flex-col gap-2.5">
          {PLATFORMS.map((platformInfo) => {
            const p = platformInfo.key as Platform;
            const info = PLATFORM_MAP[p];
            const isSelected = activePlatform === p;
            return (
              <button
                key={p}
                onClick={() => handlePlatformSelect(p)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 text-sm font-medium",
                  isSelected 
                    ? "bg-[var(--color-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] shadow-[0_0_15px_rgba(0,0,0,0.2)]" 
                    : "bg-transparent border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <div 
                  className="w-2 h-2 rounded-full transition-transform duration-300" 
                  style={{ 
                    backgroundColor: info?.color,
                    boxShadow: isSelected ? `0 0 8px ${info?.color}` : 'none',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                  }} 
                />
                {info?.name || p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px w-full bg-[var(--color-border)]" />

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] mb-4">
          Status
        </h3>
        <div className="flex bg-[var(--color-void)] p-1 rounded-xl border border-[var(--color-border)]">
          {['all', 'unsolved', 'solved'].map((s) => (
            <button
              key={s}
              onClick={() => updateFilters({ status: s })}
              className={cn(
                "flex-1 text-xs font-medium py-1.5 rounded-lg capitalize transition-all",
                (filters.status || 'all') === s 
                  ? "bg-[var(--color-elevated)] text-[var(--color-text-primary)] shadow-sm" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)]"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-[var(--color-border)]" />

      {/* Platform-specific filters */}
      <motion.div
        key={activePlatform}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {usesRating && (
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] mb-4">
              Rating Range
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={filters.minRating || getMinDefault(activePlatform)}
                onChange={(e) => updateFilters({ minRating: parseInt(e.target.value) })}
                className="w-full bg-[var(--color-void)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-blue)] appearance-none cursor-pointer"
              >
                {ratingOptions.map(rating => (
                  <option key={`min-${rating}`} value={rating} className="bg-[var(--color-void)]">{rating}</option>
                ))}
              </select>
              <span className="text-[var(--color-text-secondary)] text-sm">to</span>
              <select
                value={filters.maxRating || getMaxDefault(activePlatform)}
                onChange={(e) => updateFilters({ maxRating: parseInt(e.target.value) })}
                className="w-full bg-[var(--color-void)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-blue)] appearance-none cursor-pointer"
              >
                {ratingOptions.map(rating => (
                  <option key={`max-${rating}`} value={rating} className="bg-[var(--color-void)]">{rating}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isLC && (
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] mb-4">
              Difficulty
            </h3>
            <div className="flex flex-col gap-3">
              {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                <Checkbox
                  key={diff}
                  label={diff.charAt(0) + diff.slice(1).toLowerCase()}
                  checked={(filters.difficulties || []).includes(diff)}
                  onCheckedChange={() => handleDifficultyToggle(diff)}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="h-px w-full bg-[var(--color-border)]" />

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] mb-4">
          Tags
        </h3>
        <div className="relative mb-4">
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
            placeholder="e.g. dp, greedy (Press Enter)"
            className="w-full bg-[var(--color-void)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-brand-blue)] focus:bg-[var(--color-elevated)] transition-all"
          />
          {showSuggestions && suggestedTags.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-[160px] overflow-y-auto bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 p-1">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing before click
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    if (!currentTags.includes(tag)) {
                      updateFilters({ tags: [...currentTags, tag] });
                    }
                    setTagInput('');
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] rounded-lg transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(filters.tags || []).map((tag) => (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-elevated)] hover:bg-red-500/20 hover:text-red-400 border border-transparent text-xs font-medium text-[var(--color-text-primary)] transition-colors cursor-pointer"
              onClick={() => handleTagRemove(tag)}
              title="Click to remove"
            >
              {tag}
              <X className="w-3 h-3 opacity-50" />
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};
