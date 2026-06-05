'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Contest, Platform } from '@/types';
import { contestApi } from '@/lib/api';

const USE_MOCK = true;

function generateMockContests(): Contest[] {
  const now = new Date();

  return [
    {
      id: 1,
      externalId: 'cf-1923',
      platform: 'CODEFORCES',
      name: 'Codeforces Round 923 (Div. 2)',
      url: 'https://codeforces.com/contest/1923',
      phase: 'CODING',
      startTime: new Date(now.getTime() - 45 * 60000).toISOString(),
      endTime: new Date(now.getTime() + 75 * 60000).toISOString(),
      durationSeconds: 7200,
      contestType: 'Div. 2',
      frozen: false,
    },
    {
      id: 2,
      externalId: 'lc-weekly-401',
      platform: 'LEETCODE',
      name: 'Weekly Contest 401',
      url: 'https://leetcode.com/contest/weekly-contest-401',
      phase: 'BEFORE',
      startTime: new Date(now.getTime() + 2 * 3600000).toISOString(),
      endTime: new Date(now.getTime() + 3.5 * 3600000).toISOString(),
      durationSeconds: 5400,
      contestType: 'Weekly',
      frozen: false,
    },
    {
      id: 3,
      externalId: 'cf-1924',
      platform: 'CODEFORCES',
      name: 'Educational Codeforces Round 165',
      url: 'https://codeforces.com/contest/1924',
      phase: 'BEFORE',
      startTime: new Date(now.getTime() + 26 * 3600000).toISOString(),
      endTime: new Date(now.getTime() + 28 * 3600000).toISOString(),
      durationSeconds: 7200,
      contestType: 'Educational',
      frozen: false,
    },

    {
      id: 6,
      externalId: 'lc-biweekly-131',
      platform: 'LEETCODE',
      name: 'Biweekly Contest 131',
      url: 'https://leetcode.com/contest/biweekly-contest-131',
      phase: 'BEFORE',
      startTime: new Date(now.getTime() + 5 * 86400000).toISOString(),
      endTime: new Date(now.getTime() + 5 * 86400000 + 5400000).toISOString(),
      durationSeconds: 5400,
      contestType: 'Biweekly',
      frozen: false,
    },
    {
      id: 7,
      externalId: 'cf-1922',
      platform: 'CODEFORCES',
      name: 'Codeforces Round 922 (Div. 1 + Div. 2)',
      url: 'https://codeforces.com/contest/1922',
      phase: 'FINISHED',
      startTime: new Date(now.getTime() - 2 * 86400000).toISOString(),
      endTime: new Date(now.getTime() - 2 * 86400000 + 9000000).toISOString(),
      durationSeconds: 9000,
      contestType: 'Div. 1 + Div. 2',
      frozen: false,
    },
    {
      id: 8,
      externalId: 'lc-weekly-400',
      platform: 'LEETCODE',
      name: 'Weekly Contest 400',
      url: 'https://leetcode.com/contest/weekly-contest-400',
      phase: 'FINISHED',
      startTime: new Date(now.getTime() - 5 * 86400000).toISOString(),
      endTime: new Date(now.getTime() - 5 * 86400000 + 5400000).toISOString(),
      durationSeconds: 5400,
      contestType: 'Weekly',
      frozen: false,
    },
  ];
}

export function useContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(
    new Set(['CODEFORCES', 'LEETCODE'])
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptedContestIds, setAttemptedContestIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchContests = useCallback(async () => {
    try {
      setError(null);
      const response = await contestApi.getAll();
      setContests(response.data);
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { userApi } = await import('@/lib/api');
          const meRes = await userApi.getMe();
          if (meRes.data && meRes.data.attemptedContestIds) {
            setAttemptedContestIds(new Set(meRes.data.attemptedContestIds));
          }
        } catch (e) {
          console.error("Failed to fetch attempted contests", e);
        }
      }
      
      setIsLoading(false);
    } catch {
      if (USE_MOCK) {
        setContests(generateMockContests());
        setIsLoading(false);
      } else {
        setError('Failed to fetch contests. Please try again.');
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchContests();
    intervalRef.current = setInterval(fetchContests, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchContests]);

  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  }, []);

  const filtered = contests.filter((c) => selectedPlatforms.has(c.platform));

  const live = filtered
    .filter((c) => c.phase === 'CODING')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const upcoming = filtered
    .filter((c) => c.phase === 'BEFORE')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const past = filtered
    .filter((c) => c.phase === 'FINISHED')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const toggleAllPlatforms = useCallback(() => {
    setSelectedPlatforms((prev) => {
      if (prev.size === 2) {
        return new Set();
      }
      return new Set(['CODEFORCES', 'LEETCODE']);
    });
  }, []);

  return {
    contests: filtered,
    live,
    upcoming,
    past,
    selectedPlatforms,
    togglePlatform,
    toggleAllPlatforms,
    isLoading,
    error,
    refetch: fetchContests,
    attemptedContestIds,
  };
}
