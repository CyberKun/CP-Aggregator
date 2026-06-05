'use client';

import React, { useState } from 'react';
import { useContests } from '@/hooks/useContests';
import { PlatformFilter } from './PlatformFilter';
import { ContestCard } from './ContestCard';
import { PLATFORMS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [attemptedFilter, setAttemptedFilter] = useState<'all' | 'attempted' | 'not_attempted'>('all');

  const filteredPast = React.useMemo(() => {
    return past.filter((c) => {
      if (attemptedFilter === 'all') return true;
      const isAttempted = attemptedContestIds?.has(String(c.externalId)) ?? false;
      return attemptedFilter === 'attempted' ? isAttempted : !isAttempted;
    });
  }, [past, attemptedFilter, attemptedContestIds]);

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
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          {icon}
          <span className="bg-white/10 text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {contests.length}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {contests.slice(0, 50).map((contest, index) => (
                <ContestCard key={`${contest.platform}-${contest.externalId}`} contest={contest} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Filters Header */}
      <div className="mb-8 sticky top-16 z-20 bg-[#050510]/80 backdrop-blur-xl pt-4 pb-2 -mx-8 px-8 border-b border-white/5">
        <PlatformFilter 
          selectedPlatforms={selectedPlatforms} 
          onToggle={togglePlatform} 
          onToggleAll={toggleAllPlatforms}
        />
        
        {/* Tabs for Upcoming / Past & Attempted Filter */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-px">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'upcoming' 
                  ? 'border-cyan-400 text-cyan-400' 
                  : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              Upcoming Contests
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'past' 
                  ? 'border-cyan-400 text-cyan-400' 
                  : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              Past Contests
            </button>
          </div>
          
          <AnimatePresence>
            {activeTab === 'past' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-1 bg-white/5 rounded-lg p-1"
              >
                <button
                  onClick={() => setAttemptedFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${attemptedFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setAttemptedFilter('attempted')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${attemptedFilter === 'attempted' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Attempted
                </button>
                <button
                  onClick={() => setAttemptedFilter('not_attempted')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${attemptedFilter === 'not_attempted' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Not Attempted
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-4 text-xs font-medium text-slate-400">
          <span className="uppercase tracking-wider">Total {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Contests:</span>
          {PLATFORMS.map(p => {
            if (!selectedPlatforms.has(p.key)) return null;
            const sourceArray = activeTab === 'upcoming' ? upcoming : filteredPast;
            const count = sourceArray.filter(c => c.platform === p.key).length;
            return (
              <div key={p.key} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      {live.length > 0 && activeTab === 'upcoming' && renderSection(
        "Live Now", 
        live, 
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
      )}
      
      {activeTab === 'upcoming' && renderSection("Upcoming Contests", upcoming)}
      
      {activeTab === 'past' && renderSection("Past Contests", filteredPast)}
      
      {!isLoading && (
        (activeTab === 'upcoming' && live.length === 0 && upcoming.length === 0) ||
        (activeTab === 'past' && past.length === 0)
      ) && (
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No contests found</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            Try selecting more platforms from the filter above to see {activeTab} contests.
          </p>
        </div>
      )}
    </div>
  );
}
