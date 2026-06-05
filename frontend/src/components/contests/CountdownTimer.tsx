'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isUrgent, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
        <span className="text-xs font-bold tracking-wider">LIVE NOW</span>
      </div>
    );
  }

  const renderDigit = (value: number, label: string) => (
    <div className={cn(
      "flex flex-col items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg border backdrop-blur-sm transition-colors",
      isUrgent 
        ? "bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]" 
        : "bg-slate-800/50 border-white/10"
    )}>
      <div className="relative h-6 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "text-lg font-bold font-mono block",
              isUrgent ? "text-red-400" : "text-white"
            )}
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5">
      {days > 0 && renderDigit(days, 'Days')}
      {renderDigit(hours, 'Hrs')}
      <div className={cn("text-lg font-bold pb-1", isUrgent ? "text-red-500/50" : "text-slate-600")}>:</div>
      {renderDigit(minutes, 'Min')}
      <div className={cn("text-lg font-bold pb-1", isUrgent ? "text-red-500/50" : "text-slate-600")}>:</div>
      {renderDigit(seconds, 'Sec')}
    </div>
  );
}
