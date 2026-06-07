'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProblemFilterPanel } from '@/components/practice/ProblemFilterPanel';
import { ProblemGrid } from '@/components/practice/ProblemGrid';
import { useProblems } from '@/hooks/useProblems';
import { Shuffle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PracticePage() {
  const { problems, loading, filters, updateFilters, shuffleProblems, solvedProblemIds } = useProblems();

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 pb-12">
        <div className="flex flex-row items-center justify-between gap-6 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-slate-200 rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] mb-2 tracking-tight">
              Practice
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Hone your skills across platforms
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shuffleProblems}
            disabled={loading}
            className="group relative w-12 h-12 shrink-0 bg-[var(--color-void)] border border-slate-200/50 rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Shuffle Problems"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200/10 to-white/10 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
            
            {loading ? (
              <Loader2 className="w-5 h-5 text-slate-300 animate-spin relative z-10" />
            ) : (
              <Shuffle className="w-5 h-5 text-slate-300 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
            )}
          </motion.button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
          <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-[100px] z-20">
            <ProblemFilterPanel filters={filters} updateFilters={updateFilters} />
          </div>
          
          <div className="flex-1 w-full min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] animate-pulse" />
                ))}
              </div>
            ) : (
              <ProblemGrid
                problems={problems}
                solvedIds={solvedProblemIds}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
