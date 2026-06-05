'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Sun, Moon, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export function Topbar() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Contests', path: '/contests' },
    { name: 'Practice', path: '/practice' },
  ];

  return (
    <nav className="h-[72px] w-full bg-[var(--color-panel)] border-b border-[var(--color-border)] sticky top-0 z-50 flex items-center justify-between px-8">
      {/* Logo Area */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-6 h-6 flex flex-col justify-between">
          <div className="h-[4px] w-full bg-[#ffa116]"></div>
          <div className="h-[4px] w-full bg-[#ffa116] flex gap-1">
            <div className="h-full w-1/2 bg-transparent"></div>
            <div className="h-full w-1/2 bg-[#ffc01e]"></div>
          </div>
          <div className="h-[4px] w-3/4 bg-[#ffa116]"></div>
        </div>
        <span className="text-[var(--color-text-primary)] font-bold text-xl tracking-tight">CP Aggregator</span>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center h-full gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          
          return (
            <Link 
              key={link.name} 
              href={link.path}
              className={cn(
                "h-full flex items-center px-4 text-[15px] transition-colors border-b-2",
                isActive 
                  ? "text-[var(--color-text-primary)] border-[var(--color-text-primary)] font-medium" 
                  : "text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
              )}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {mounted && (
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--color-elevated)]"
            title="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
        
        {isAuthenticated ? (
          <Link href="/profile" className="w-9 h-9 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-primary)]">
            <span className="font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </Link>
        ) : (
          <Link href="/login" className="w-9 h-9 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)]">
            <User className="w-4 h-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}

