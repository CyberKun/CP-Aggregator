'use client';

import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Contest } from '@/types';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { CountdownTimer } from './CountdownTimer';
import { GoogleCalendarButton } from './GoogleCalendarButton';
import { getPlatformColor, formatDate, formatDuration } from '@/lib/utils';
import { PLATFORMS } from '@/lib/constants';

interface ContestCardProps {
  contest: Contest;
  index: number;
}

export function ContestCard({ contest, index }: ContestCardProps) {
  const platformColor = getPlatformColor(contest.platform);
  const platformInfo = PLATFORMS.find(p => p.key === contest.platform);
  const isLive = contest.phase === 'CODING';
  const isPast = contest.phase === 'FINISHED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      <GlassCard 
        hoverEffect 
        accentColor={platformColor}
        className={isLive ? `ring-1 ring-[${platformColor}]/30 shadow-[0_0_20px_rgba(var(--color-${contest.platform.toLowerCase()}),0.15)]` : ''}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Top Row: Badges & Time */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                label={platformInfo?.name || contest.platform} 
                color={platformColor} 
                variant={isLive ? 'glow' : 'solid'} 
              />
              {contest.contestType && (
                <Badge 
                  label={contest.contestType} 
                  color="#64748b" 
                  variant="outline" 
                />
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(contest.startTime)}</span>
            </div>
          </div>

          {/* Main Content: Title */}
          <div className="flex-1 mb-6">
            <h3 className="text-lg font-bold text-white leading-snug line-clamp-2" title={contest.name}>
              {contest.name}
            </h3>
          </div>

          {/* Bottom Row: Duration & Status/Actions */}
          <div className="flex items-center justify-between flex-wrap gap-y-3 mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 bg-slate-800/50 px-2 py-1 rounded whitespace-nowrap">
                {formatDuration(contest.durationSeconds)}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-y-2 gap-x-3 justify-end">
              {!isPast && contest.phase === 'BEFORE' && (
                <CountdownTimer targetDate={contest.startTime} />
              )}
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-xs font-bold tracking-wider">LIVE NOW</span>
                </div>
              )}
              {isPast && (
                <span className="text-sm font-medium text-slate-500">Ended</span>
              )}

              <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-3">
                {!isPast && <GoogleCalendarButton contest={contest} />}
                <a
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 text-slate-400 transition-colors"
                  title="Open Contest Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
