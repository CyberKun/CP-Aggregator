'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Contest, Platform, ContestPhase } from '@/types';
import { contestApi } from '@/lib/api';
import { PLATFORMS } from '@/lib/constants';


export function useContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(
    new Set(PLATFORMS.map(p => p.key as Platform))
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
      setError('Failed to fetch contests. Please try again.');
      setIsLoading(false);
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

  const now = Date.now();
  const getComputedPhase = (c: any): ContestPhase => {
    const start = new Date(c.startTime).getTime();
    const end = c.endTime ? new Date(c.endTime).getTime() : (c.durationSeconds ? start + (c.durationSeconds * 1000) : start);
    if (now < start) return 'BEFORE';
    if (now >= start && now <= end) return 'CODING';
    return 'FINISHED';
  };

  const filtered = contests
    .filter((c) => selectedPlatforms.has(c.platform))
    .map((c) => ({ ...c, phase: getComputedPhase(c) }));

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
      if (prev.size === PLATFORMS.length) {
        return new Set();
      }
      return new Set(PLATFORMS.map(p => p.key as Platform));
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
