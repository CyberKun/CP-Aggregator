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

const getDifficultyColor = (diff: string | null, rating: number | null) => {
  if (rating !== null) {
    if (rating < 1200) return 'text-gray-300 bg-gray-500/10 border-gray-500/20';
    if (rating < 1400) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (rating < 1600) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (rating < 1900) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (rating < 2100) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (rating < 2400) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  }
  
  switch (diff?.toLowerCase()) {
    case 'easy':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'hard':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
};

export const ProblemTable: React.FC<ProblemTableProps> = ({ problems, loading, page, totalPages, onNextPage, onPrevPage, solvedProblemIds }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl relative">
        {loading && (
          <div className="absolute inset-0 bg-[#050510]/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-h-[500px]">
            <thead>
              <tr className="border-b border-white/5 text-sm text-white/50 bg-white/[0.01]">
                <th className="px-6 py-4 font-medium w-2/5">Problem</th>
                <th className="px-6 py-4 font-medium w-32">Difficulty</th>
                <th className="px-6 py-4 font-medium w-28">Status</th>
                <th className="px-6 py-4 font-medium flex-1">Tags</th>
                <th className="px-6 py-4 font-medium text-right w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => {
                const info = PLATFORM_MAP[problem.platform];
                const IconComponent = info ? (LucideIcons as any)[info.icon] || LucideIcons.Code : LucideIcons.Code;
                const isSolved = solvedProblemIds?.has(String(problem.externalId)) ?? false;

                return (
                  <motion.tr
                    key={`${problem.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors group"
                  >
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors truncate" title={problem.name}>
                          {problem.name}
                        </span>
                        <span className="text-xs text-white/40">
                          {problem.externalId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider border",
                        getDifficultyColor(problem.difficulty, problem.rating)
                      )}>
                        {problem.rating !== null ? problem.rating : problem.difficulty || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {isSolved ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <LucideIcons.CheckCircle className="w-3.5 h-3.5" />
                          Solved
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <LucideIcons.Circle className="w-3.5 h-3.5" />
                          Unsolved
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {problem.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/60 border border-white/5 truncate max-w-[80px]" title={tag}>
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 2 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/60 border border-white/5">
                            +{problem.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/90 transition-all active:scale-95 border border-white/5"
                      >
                        Solve
                        <ExternalLink className="w-3.5 h-3.5 text-white/50" />
                      </a>
                    </td>
                  </motion.tr>
                );
              })}
              {problems.length === 0 && !loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="p-12 text-center text-white/50 text-sm flex flex-col items-center justify-center min-h-[300px]">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.01]">
          <span className="text-xs font-medium text-white/50">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPage}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextPage}
              disabled={page >= totalPages - 1 || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
