'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import api from '@/lib/api';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard/global');
        setUsers(response.data);
      } catch (err: any) {
        setError('Failed to fetch leaderboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Global Leaderboard</h1>
          <p className="text-gray-400">See how you stack up against the competition.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <LeaderboardTable users={users} loading={loading} />
      </div>
    </AppShell>
  );
}
