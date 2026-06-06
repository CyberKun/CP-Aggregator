'use client';

import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#10b981',      // white
  Medium: '#f59e0b',    // slate-200
  Hard: '#ef4444',      // red-500
  Advanced: '#8b5cf6',  // violet-500
  Unknown: '#64748b',   // slate-500
};

export function DifficultyBarChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-6 rounded-2xl border border-white/5 h-[350px] flex items-center justify-center">
        <p className="text-gray-400">No difficulty data available.</p>
      </div>
    );
  }

  // Define sort order
  const order = ['Easy', 'Medium', 'Hard', 'Advanced', 'Unknown'];
  const sortedData = [...data].sort((a, b) => {
    let ia = order.indexOf(a.name);
    let ib = order.indexOf(b.name);
    if (ia === -1) ia = 99;
    if (ib === -1) ib = 99;
    return ia - ib;
  });

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 h-[350px] flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Problems by Difficulty</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#334155', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[entry.name] || '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
