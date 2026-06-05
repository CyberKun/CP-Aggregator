'use client';

import React from 'react';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-text-primary)] flex flex-col font-sans">
      <Topbar />
      
      <main className="flex-1 w-full relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
