'use client';

import React, { useState, useMemo } from 'react';
import { useContests } from '@/hooks/useContests';
import { PlatformFilter } from './PlatformFilter';
import { ContestCard } from './ContestCard';
import { PLATFORMS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { checkClashes } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Telescope } from 'lucide-react';

export function ContestCalendar() {
  const { 
    live, 
    upcoming, 
    past, 
    selectedPlatforms, 
    togglePlatform, 
    toggleAllPlatforms,
    isLoading, 
    error,
    attemptedContestIds
  } = useContests();
  
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('upcoming');
  const [attemptedFilter, setAttemptedFilter] = useState<'all' | 'attempted' | 'not_attempted'>('not_attempted');

  const [pastPage, setPastPage] = useState(0);
  const pastPageSize = 15;

  const filteredPast = React.useMemo(() => {
    return past.filter((c) => {
      if (attemptedFilter === 'all') return true;
      const isAttempted = attemptedContestIds?.has(String(c.externalId)) ?? false;
      return attemptedFilter === 'attempted' ? isAttempted : !isAttempted;
    });
  }, [past, attemptedFilter, attemptedContestIds]);

  const totalPastPages = Math.ceil(filteredPast.length / pastPageSize);
  const currentPastContests = filteredPast.slice(pastPage * pastPageSize, (pastPage + 1) * pastPageSize);

  const clashesMap = useMemo(() => checkClashes(upcoming), [upcoming]);

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400">
        <h3 className="text-lg font-semibold mb-2">Failed to load contests</h3>
        <p>{error}</p>
      </div>
    );
  }

  const renderSection = (title: string, contests: any[], icon?: React.ReactNode) => {
    if (contests.length === 0 && !isLoading) {
      return null;
    }

    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">{title}</h2>
          {icon}
          <span className="bg-[var(--color-elevated)] text-[var(--color-text-secondary)] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[var(--color-border)]">
            {title === "Past Contests" ? filteredPast.length : contests.length}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {contests.map((contest, index) => (
                <ContestCard 
                  key={`${contest.platform}-${contest.externalId}`} 
                  contest={contest} 
                  index={index} 
                  clashingWith={title === 'Upcoming Contests' ? clashesMap[contest.externalId] : undefined}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination controls for Past Contests */}
        {title === 'Past Contests' && totalPastPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="flex items-center gap-2 bg-[var(--color-panel)] p-2 rounded-xl border border-[var(--color-border)] shadow-lg">
              <button
                onClick={() => setPastPage(p => Math.max(0, p - 1))}
                disabled={pastPage === 0}
                className="p-2 rounded-lg hover:bg-[var(--color-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
              
              <div className="flex gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPastPages) }).map((_, i) => {
                  let pageNum = pastPage;
                  if (pastPage < 2) pageNum = i;
                  else if (pastPage > totalPastPages - 3) pageNum = totalPastPages - 5 + i;
                  else pageNum = pastPage - 2 + i;
                  
                  if (pageNum < 0 || pageNum >= totalPastPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPastPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        pastPage === pageNum 
                          ? 'bg-gradient-to-r from-slate-200 to-white text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPastPage(p => Math.min(totalPastPages - 1, p + 1))}
                disabled={pastPage === totalPastPages - 1}
                className="p-2 rounded-lg hover:bg-[var(--color-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Filters Header - Sleek Glassmorphism */}
      <div className="pt-2">
        <PlatformFilter 
          selectedPlatforms={selectedPlatforms} 
          onToggle={togglePlatform} 
          onToggleAll={toggleAllPlatforms}
        />
      </div>
        
      {/* Tabs for Upcoming / Past & Attempted Filter (Sticky) */}
      <div className="sticky top-[72px] z-40 bg-[var(--color-void)]/80 backdrop-blur-2xl mt-6 pt-4 pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-[var(--color-border)] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-px">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('live')}
              className={`pb-3 text-[15px] font-semibold transition-colors border-b-2 ${
                activeTab === 'live' 
                  ? 'border-slate-200 text-[var(--color-text-primary)]' 
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 text-[15px] font-semibold transition-colors border-b-2 ${
                activeTab === 'upcoming' 
                  ? 'border-slate-200 text-[var(--color-text-primary)]' 
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => {
                setActiveTab('past');
                setPastPage(0);
              }}
              className={`pb-3 text-[15px] font-semibold transition-colors border-b-2 ${
                activeTab === 'past' 
                  ? 'border-slate-200 text-[var(--color-text-primary)]' 
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              Past
            </button>
          </div>
          
          <AnimatePresence>
            {activeTab === 'past' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-1 bg-[var(--color-panel)] rounded-lg p-1.5 border border-[var(--color-border)] mb-3"
              >
                <button
                  onClick={() => { setAttemptedFilter('all'); setPastPage(0); }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${attemptedFilter === 'all' ? 'bg-[var(--color-elevated)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  ALL
                </button>
                <button
                  onClick={() => { setAttemptedFilter('not_attempted'); setPastPage(0); }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${attemptedFilter === 'not_attempted' ? 'bg-[var(--color-elevated)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  UNATTEMPTED
                </button>
                <button
                  onClick={() => { setAttemptedFilter('attempted'); setPastPage(0); }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${attemptedFilter === 'attempted' ? 'bg-[var(--color-elevated)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  ATTEMPTED
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
      </div>
        
      {/* Stats bar */}
      <div className="flex items-center gap-6 mt-5 mb-8 text-xs font-semibold text-[var(--color-text-secondary)]">
          <span className="uppercase tracking-widest text-[10px]">Total {activeTab} Contests:</span>
          {PLATFORMS.map(p => {
            if (!selectedPlatforms.has(p.key)) return null;
            const sourceArray = activeTab === 'upcoming' ? upcoming : activeTab === 'live' ? live : filteredPast;
            const count = sourceArray.filter(c => c.platform === p.key).length;
            return (
              <div key={p.key} className="flex items-center gap-2 text-[var(--color-text-primary)] bg-[var(--color-panel)] px-2 py-1 rounded border border-[var(--color-border)]">
                <PlatformIcon platform={p.key} color={p.color} className="w-3.5 h-3.5" />
                <span className="text-xs">{count}</span>
              </div>
            );
          })}
      </div>

      {/* Sections */}
      {activeTab === 'live' && renderSection(
        "Live Now", 
        live, 
        <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_12px_#10b981]" />
      )}
      
      {activeTab === 'upcoming' && renderSection("Upcoming Contests", upcoming)}
      
      {activeTab === 'past' && renderSection("Past Contests", currentPastContests)}
      
      {!isLoading && (
        (activeTab === 'live' && live.length === 0) ||
        (activeTab === 'upcoming' && upcoming.length === 0) ||
        (activeTab === 'past' && filteredPast.length === 0)
      ) && (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="w-24 h-24 rounded-3xl bg-[var(--color-panel)] border border-[var(--color-border)] shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/10 to-white/10 rounded-3xl" />
            <Telescope className="w-10 h-10 text-slate-200 relative z-10" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">No contests found in this sector</h3>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto text-sm leading-relaxed">
            There are no {activeTab === 'past' ? attemptedFilter.replace('_', ' ') : activeTab} contests matching your current filters. Adjust your platform selections above to discover more events.
          </p>
        </div>
      )}
    </div>
  );
}
