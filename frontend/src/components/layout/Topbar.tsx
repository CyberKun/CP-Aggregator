'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Contests', path: '/contests' },
    { name: 'Practice', path: '/practice' },
  ];

  return (
    <nav className="h-[72px] w-full bg-[var(--color-panel)] border-b border-[var(--color-border)] sticky top-0 z-50 flex items-center justify-between px-4 md:px-8">
      {/* Logo Area */}
      <Link href="/" className="flex items-center gap-3 group">
        <img 
          src="/logo.png" 
          alt="CP Times Logo" 
          className="h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
        />
        <span className="text-[var(--color-text-primary)] font-bold text-xl tracking-tight hidden sm:block sr-only">CP Times</span>
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
      <div className="flex items-center gap-2 md:gap-4">

        
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-9 h-9 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-text-secondary)] overflow-hidden"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-[var(--color-border)]">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.username}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-text-primary)]">
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsProfileDropdownOpen(false);
                    }} 
                    className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-elevated)] hover:text-red-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="w-9 h-9 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)]">
            <User className="w-4 h-4" />
          </Link>
        )}

        <button
          className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-[var(--color-panel)] border-b border-[var(--color-border)] flex flex-col md:hidden shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "p-4 border-b border-[var(--color-border)] text-base font-medium transition-colors",
                  isActive 
                    ? "text-[var(--color-text-primary)] bg-[var(--color-elevated)]" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

