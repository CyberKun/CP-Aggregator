'use client';

import React, { useState } from 'react';
import { Platform } from '@/types';
import { Checkbox } from '@/components/ui/Checkbox';
import { DualSlider } from '@/components/ui/DualSlider';
import { PLATFORM_MAP } from '@/lib/constants';
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

  // Now enforces a single platform selection
  const handlePlatformSelect = (platform: Platform) => {
    updateFilters({ platforms: [platform] });
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
  const isCF = activePlatform === 'CODEFORCES';
  const isLC = activePlatform === 'LEETCODE';

  return (
    <div className="w-full max-w-[280px] flex-shrink-0 flex flex-col gap-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-4 flex items-center gap-2">
          <LayoutGrid className="w-3.5 h-3.5" />
          Select Platform
        </h3>
        <div className="flex flex-col gap-2.5">
          {(['CODEFORCES', 'LEETCODE'] as Platform[]).map((p) => {
            const info = PLATFORM_MAP[p];
            const isSelected = activePlatform === p;
            return (
              <button
                key={p}
                onClick={() => handlePlatformSelect(p)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 text-sm font-medium",
                  isSelected 
                    ? "bg-white/10 border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                    : "bg-transparent border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/80"
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

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-4">
          Status
        </h3>
        <div className="flex bg-white/[0.02] p-1 rounded-xl border border-white/5">
          {['all', 'unsolved', 'solved'].map((s) => (
            <button
              key={s}
              onClick={() => updateFilters({ status: s })}
              className={cn(
                "flex-1 text-xs font-medium py-1.5 rounded-lg capitalize transition-all",
                (filters.status || 'all') === s 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Platform-specific filters */}
      <motion.div
        key={activePlatform}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isCF && (
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-4">
              Rating Range
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={filters.minRating || 800}
                onChange={(e) => updateFilters({ minRating: parseInt(e.target.value) })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
              >
                {Array.from({ length: 28 }, (_, i) => 800 + i * 100).map(rating => (
                  <option key={`min-${rating}`} value={rating} className="bg-[#050510]">{rating}</option>
                ))}
              </select>
              <span className="text-white/50 text-sm">to</span>
              <select
                value={filters.maxRating || 3500}
                onChange={(e) => updateFilters({ maxRating: parseInt(e.target.value) })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
              >
                {Array.from({ length: 28 }, (_, i) => 800 + i * 100).map(rating => (
                  <option key={`max-${rating}`} value={rating} className="bg-[#050510]">{rating}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isLC && (
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-4">
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

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-4">
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
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all"
          />
          {showSuggestions && suggestedTags.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-[160px] overflow-y-auto bg-[#0a0a1a] border border-white/10 rounded-xl shadow-2xl z-50 p-1">
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
                  className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 border border-transparent text-xs font-medium text-white/80 transition-colors cursor-pointer"
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
