'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Problem } from '@/types';
import { PLATFORM_MAP } from '@/lib/constants';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface ProblemTableProps {
  problems: Problem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  solvedProblemIds?: Set<string>;
}

const getDifficultyColor = (platform: string, diff: string | null, rating: number | null) => {
  if (rating !== null) {
    if (platform === 'CODEFORCES') {
      if (rating < 1200) return 'text-[#808080]'; // Newbie
      if (rating < 1400) return 'text-[#008000]'; // Pupil
      if (rating < 1600) return 'text-[#03a89e]'; // Specialist
      if (rating < 1900) return 'text-[#0000ff]'; // Expert
      if (rating < 2100) return 'text-[#aa00aa]'; // Candidate Master
      if (rating < 2400) return 'text-[#ff8c00]'; // Master
      return 'text-[#ff0000]'; // Grandmaster
    }
    if (platform === 'ATCODER') {
      if (rating < 400) return 'text-[#808080]'; // Gray
      if (rating < 800) return 'text-[#804000]'; // Brown
      if (rating < 1200) return 'text-[#008000]'; // Green
      if (rating < 1600) return 'text-[#00C0C0]'; // Cyan
      if (rating < 2000) return 'text-[#0000FF]'; // Blue
      if (rating < 2400) return 'text-[#C0C000]'; // Yellow
      if (rating < 2800) return 'text-[#FF8000]'; // Orange
      return 'text-[#FF0000]'; // Red
    }
    if (platform === 'CODECHEF') {
      if (rating < 1400) return 'text-[#666666]'; // 1*
      if (rating < 1600) return 'text-[#1E7D22]'; // 2*
      if (rating < 1800) return 'text-[#3366CC]'; // 3*
      if (rating < 2000) return 'text-[#684273]'; // 4*
      if (rating < 2200) return 'text-[#FFBF00]'; // 5*
      if (rating < 2500) return 'text-[#FF7F00]'; // 6*
      return 'text-[#D0011B]'; // 7*
    }
  }
  
  switch (diff?.toLowerCase()) {
    case 'easy':
      return 'text-[#00b8a3]';
    case 'medium':
      return 'text-[#ffc01e]';
    case 'hard':
      return 'text-[#ff375f]';
    default:
      return 'text-[#8a8a8a]';
  }
};

export const ProblemTable: React.FC<ProblemTableProps> = ({ problems, loading, page, totalPages, onNextPage, onPrevPage, solvedProblemIds }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-[var(--color-void)]/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-brand-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left border-collapse min-h-[500px] bg-[var(--color-void)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] font-medium">
                <th className="px-6 py-3 w-[45%] font-medium">Title</th>
                <th className="px-6 py-3 w-[15%] font-medium">Difficulty</th>
                <th className="px-6 py-3 w-[25%] font-medium">Tags</th>
                <th className="px-6 py-3 w-[15%] font-medium text-right">Problem Link</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => {
                const info = PLATFORM_MAP[problem.platform];
                const IconComponent = info ? (LucideIcons as any)[info.icon] || LucideIcons.Code : LucideIcons.Code;
                const isSolved = solvedProblemIds?.has(String(problem.externalId)) ?? false;
                const isOdd = index % 2 === 0;

                return (
                  <motion.tr
                    key={`${problem.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={cn(
                      "transition-colors problem-row-hover border-b border-[var(--color-border)] last:border-none",
                      isOdd ? "problem-row-odd" : "problem-row-even"
                    )}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-5 flex-shrink-0 flex justify-center">
                          {isSolved && <LucideIcons.Check className="w-5 h-5 text-[#22c55e]" strokeWidth={3} />}
                        </div>
                        <span className="text-[15px] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-brand-blue)] transition-colors truncate" title={problem.name}>
                          {index + 1 + (page * 20)}. {problem.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={cn(
                        "text-[14px] font-medium tracking-wide",
                        getDifficultyColor(problem.platform, problem.difficulty, problem.rating)
                      )}>
                        {problem.rating !== null ? problem.rating : (problem.difficulty === 'Medium' ? 'Med.' : problem.difficulty || 'N/A')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {problem.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-full text-xs bg-[var(--color-elevated)] text-[var(--color-text-secondary)] truncate max-w-[120px] transition-colors hover:text-[var(--color-text-primary)] cursor-default" title={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-full hover:bg-[var(--color-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-95"
                        title="Solve Problem"
                      >
                        <LucideIcons.ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </motion.tr>
                );
              })}
              {problems.length === 0 && !loading && (
                <tr>
                  <td colSpan={4}>
                    <div className="p-12 text-center text-[var(--color-text-secondary)] text-sm flex flex-col items-center justify-center min-h-[300px]">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-panel)] flex items-center justify-center mb-4">
                        <span className="text-xl">🔍</span>
                      </div>
                      No problems found matching your filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-void)] rounded-b-xl">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPage}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-elevated)] text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNextPage}
              disabled={page >= totalPages - 1 || loading}
              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-elevated)] text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

