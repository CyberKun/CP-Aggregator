'use client';

import React from 'react';
import { CalendarPlus } from 'lucide-react';
import { Contest } from '@/types';
import { buildGoogleCalendarUrl } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GoogleCalendarButtonProps {
  contest: Contest;
}

export function GoogleCalendarButton({ contest }: GoogleCalendarButtonProps) {
  const url = buildGoogleCalendarUrl(contest);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group relative flex items-center justify-center"
      title="Add to Google Calendar"
    >
      <CalendarPlus className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
      
      {/* Tooltip */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Add to Calendar
      </span>
    </motion.a>
  );
}
