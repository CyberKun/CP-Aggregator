'use client';

import React from 'react';
import { Problem } from '@/types';
import { ExternalLink, CheckCircle2, CircleDashed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLATFORM_MAP } from '@/lib/constants';

interface ProblemGridProps {
  problems: Problem[];
  solvedIds: Set<string>;
}

export function ProblemGrid({ problems, solvedIds }: ProblemGridProps) {
  if (problems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[var(--color-panel)] rounded-3xl border border-[var(--color-border)] border-dashed">
        <div className="w-20 h-20 rounded-full bg-[var(--color-void)] flex items-center justify-center mb-4 border border-[var(--color-border)]">
          <span className="text-3xl opacity-50">🗡️</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No Problems Found</h3>
        <p className="text-[var(--color-text-secondary)] max-w-md text-sm">
          No problems match your current criteria. Try adjusting your platform or tier to summon new challenges.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full relative">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {problems.map((problem, index) => {
            const isSolved = solvedIds.has(problem.id);
            const pInfo = PLATFORM_MAP[problem.platform];
            
            return (
              <motion.a
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, delay: index * 0.05, ease: 'easeOut' } }}
                exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.1, y: -12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                key={problem.id}
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col p-5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] hover:border-slate-200/50 transition-colors hover:shadow-2xl hover:shadow-slate-200/20 overflow-hidden z-0 hover:z-10"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/0 to-white/0 group-hover:from-slate-200/5 group-hover:to-white/5 transition-colors duration-500" />
                
                {/* Platform accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b opacity-50" style={{ backgroundImage: `linear-gradient(to bottom, ${pInfo?.color}, transparent)` }} />

                <div className="relative z-10 flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border"
                      style={{ 
                        color: pInfo?.color || 'var(--color-text-primary)', 
                        borderColor: `${pInfo?.color}40`,
                        backgroundColor: `${pInfo?.color}10`
                      }}
                    >
                      {pInfo?.name || problem.platform}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-void)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                      {problem.platformId}
                    </span>
                  </div>
                  
                  {isSolved ? (
                    <div className="flex items-center gap-1.5 text-slate-100 text-xs font-bold bg-white/10 px-2 py-1 rounded-full border border-white/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SOLVED
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs font-bold bg-[var(--color-void)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                      <CircleDashed className="w-3.5 h-3.5" />
                      UNSOLVED
                    </div>
                  )}
                </div>

                <h4 className="relative z-10 text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-slate-300 transition-colors line-clamp-1 pr-6">
                  {problem.name}
                  <ExternalLink className="w-4 h-4 absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300" />
                </h4>

                <div className="relative z-10 flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-[var(--color-border)]">
                  {problem.rating && (
                    <span className="px-2 py-1 rounded-md text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-void)] border border-[var(--color-border)] shadow-sm">
                      Rating: <span className="text-slate-300">{problem.rating}</span>
                    </span>
                  )}
                  {problem.difficulty && !problem.rating && (
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border shadow-sm ${
                      problem.difficulty.toUpperCase() === 'HARD' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      problem.difficulty.toUpperCase() === 'MEDIUM' ? 'bg-white/10 text-slate-100 border-white/20' :
                      'bg-white/10 text-slate-100 border-white/20'
                    }`}>
                      {problem.difficulty.toUpperCase()}
                    </span>
                  )}

                  {problem.tags && problem.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-[10px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-void)] border border-[var(--color-border)] uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                  {problem.tags && problem.tags.length > 3 && (
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">
                      +{problem.tags.length - 3}
                    </span>
                  )}
                </div>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
