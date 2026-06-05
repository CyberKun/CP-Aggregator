'use client';

import React from 'react';
import { Trophy, Code, Award, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function LeaderboardTable({ users, loading }: { users: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl border border-white/5 text-center">
        <p className="text-gray-400">No users found on the leaderboard yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 font-semibold text-slate-300 text-sm">Rank</th>
              <th className="py-4 px-6 font-semibold text-slate-300 text-sm">User</th>
              <th className="py-4 px-6 font-semibold text-slate-300 text-sm">Platforms</th>
              <th className="py-4 px-6 font-semibold text-slate-300 text-sm text-right">Total Solved</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const rank = index + 1;
              let rankStyle = "text-slate-400";
              let rankIcon = null;

              if (rank === 1) {
                rankStyle = "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
                rankIcon = <Trophy className="w-5 h-5 text-yellow-400" />;
              } else if (rank === 2) {
                rankStyle = "text-slate-300 font-bold drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]";
                rankIcon = <Award className="w-5 h-5 text-slate-300" />;
              } else if (rank === 3) {
                rankStyle = "text-amber-600 font-bold drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";
                rankIcon = <Award className="w-5 h-5 text-amber-600" />;
              }

              return (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 text-center ${rankStyle}`}>{rank}</span>
                      {rankIcon}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-lg">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {user.platforms?.map((p: any) => (
                        <span 
                          key={p.platform} 
                          className="px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold bg-white/10 text-slate-300 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          {p.platform}
                        </span>
                      ))}
                      {(!user.platforms || user.platforms.length === 0) && (
                        <span className="text-xs text-slate-500 italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20">
                      {user.totalSolved.toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
