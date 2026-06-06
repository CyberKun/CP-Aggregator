'use client';

import React from 'react';
import { ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Contest } from '@/types';
import { Badge } from '../ui/Badge';
import { CountdownTimer } from './CountdownTimer';
import { CalendarSyncMenu } from './CalendarSyncMenu';
import { getPlatformColor, formatDate, formatDuration } from '@/lib/utils';
import { PLATFORMS } from '@/lib/constants';

interface ContestCardProps {
  contest: Contest;
  index: number;
  clashingWith?: string[];
}

export function ContestCard({ contest, index, clashingWith }: ContestCardProps) {
  const platformColor = getPlatformColor(contest.platform);
  const platformInfo = PLATFORMS.find(p => p.key === contest.platform);
  const isLive = contest.phase === 'CODING';
  const isPast = contest.phase === 'FINISHED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.05, ease: 'easeOut' } }}
      exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.1, y: -12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      layout
      className="relative bg-[var(--color-panel)] rounded-xl overflow-visible border border-[var(--color-border)] shadow-md flex flex-col h-full hover:border-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/20 transition-colors z-0 hover:z-10"
    >
      {/* Top accent bar */}
      <div 
        className="absolute left-0 top-0 right-0 h-1 rounded-t-xl overflow-hidden" 
        style={{ backgroundColor: platformColor }} 
      />

      <div className="p-5 pt-6 flex flex-col h-full">
        {/* Top Row: Badges & Time */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <Badge 
              label={platformInfo?.name || contest.platform} 
              color={platformColor} 
              variant="solid" 
            />
            {contest.contestType && (
              <Badge 
                label={contest.contestType} 
                color="#8a8a8a" 
                variant="outline" 
              />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] bg-[var(--color-elevated)] px-3 py-1.5 rounded-md border border-[var(--color-border)]">
            <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span>{formatDate(contest.startTime)}</span>
          </div>
        </div>

        {/* Main Content: Title */}
        <div className="flex-1 my-2 pb-5 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2" title={contest.name}>
            {contest.name}
          </h3>
          
          {/* Clash Warning */}
          {clashingWith && clashingWith.length > 0 && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-slate-200/10 text-slate-200 border border-slate-200/20 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">Clashes with:</span>
                <span>{clashingWith.join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row: Duration & Status/Actions */}
        <div className="flex items-center justify-between flex-wrap gap-y-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-elevated)] border border-[var(--color-border)] px-3 py-1.5 rounded-md">
              {formatDuration(contest.durationSeconds || ((new Date(contest.endTime || contest.startTime).getTime() - new Date(contest.startTime).getTime()) / 1000))}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-y-2 gap-x-4 justify-end">
            {!isPast && contest.phase === 'BEFORE' && (
              <CountdownTimer targetDate={contest.startTime} />
            )}
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 text-white border border-white/20">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold tracking-wider">LIVE NOW</span>
              </div>
            )}
            {isPast && (
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Ended</span>
            )}

            <div className="flex items-center gap-2 pl-2">
              {!isPast && <CalendarSyncMenu contest={contest} />}
              <a
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full hover:bg-[var(--color-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-colors"
                title="Open Contest Page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
