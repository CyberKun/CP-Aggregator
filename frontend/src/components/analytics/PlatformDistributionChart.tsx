'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  CODEFORCES: '#3b82f6', // blue-500
  LEETCODE: '#f59e0b',   // amber-500
};

export function PlatformDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-6 rounded-2xl border border-white/5 h-[350px] flex items-center justify-center">
        <p className="text-gray-400">No platform data available.</p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 h-[350px] flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Platform Distribution</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name] || '#64748b'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
