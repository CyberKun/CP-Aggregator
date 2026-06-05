'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Code, User, Trophy, LogIn, LogOut, LayoutDashboard, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const navItems = [
    { name: 'Contests', path: '/contests', icon: Calendar, active: true },
    { name: 'Practice', path: '/practice', icon: Trophy, active: true },
    { name: 'Analytics', path: '/analytics', icon: LineChart, active: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, active: true },
    { name: 'Profile', path: '/profile', icon: User, active: true },
  ];

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 border-r border-white/5 bg-[#050510]/80 backdrop-blur-xl flex flex-col pt-6 pb-6 px-4 z-40">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]">
          C
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          CP Arena
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path || item.active;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.active ? item.path : '#'} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative overflow-hidden",
                isActive 
                  ? "bg-white/5 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-white/[0.02]",
                !item.active && "opacity-50 cursor-not-allowed"
              )}>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600"
                  />
                )}
                <Icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "text-slate-500")} />
                <span className="font-medium text-sm">{item.name}</span>
                {!item.active && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold bg-white/10 px-2 py-0.5 rounded text-slate-400">Soon</span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 px-2 flex flex-col gap-3">
        {isAuthenticated ? (
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-400 hover:text-white hover:bg-white/[0.02] w-full text-left"
          >
            <LogOut className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        ) : (
          <Link 
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-400 hover:text-white hover:bg-white/[0.02] w-full"
          >
            <LogIn className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-sm">Login</span>
          </Link>
        )}
        <div className="flex items-center gap-3 glass p-3 rounded-xl border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold block text-white">Phase 1</span>
            Contest Calendar
          </div>
        </div>
      </div>
    </aside>
  );
}
