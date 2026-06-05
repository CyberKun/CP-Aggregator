'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function Topbar() {
  const [time, setTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
    // In a real app, this would trigger a refetch
    window.dispatchEvent(new CustomEvent('force-refresh-contests'));
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-8">
      <h2 className="text-lg font-semibold text-white">Contest Calendar</h2>
      
      <div className="flex items-center gap-6">
        {time && (
          <div className="text-sm font-medium text-slate-400 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            {time.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
        
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none"
          title="Refresh Data"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
        </button>

        {isAuthenticated ? (
          <Link href="/profile" className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 hover:opacity-90 transition-opacity border border-white/20" title="Profile">
            <span className="text-sm font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </Link>
        ) : (
          <Link href="/login" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10" title="Login">
            <User className="w-4 h-4 text-slate-300" />
          </Link>
        )}
      </div>
    </header>
  );
}
