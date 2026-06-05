import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[var(--color-panel)] border-t border-[var(--color-border)] py-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} CP-Aggregator. All rights reserved.</p>
      </div>
    </footer>
  );
}

