'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function TagRadarChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex items-center justify-center">
        <p className="text-gray-400">No tag data available.</p>
      </div>
    );
  }

  // To make a radar chart look good, we need at least 3 points. If we have 1 or 2, we should pad it with empty data.
  let chartData = [...data];
  if (chartData.length < 3) {
    chartData.push({ name: '', value: 0 });
    if (chartData.length < 3) {
      chartData.push({ name: ' ', value: 0 });
    }
  }

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Top Problem Tags</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis stroke="#334155" tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Radar
              name="Solved"
              dataKey="value"
              stroke="#06b6d4" // cyan-500
              fill="#06b6d4"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
