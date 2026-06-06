import { useState, useEffect, useCallback, useRef } from 'react';
import { problemApi } from '@/lib/api';
import type { Problem, ProblemFilterRequest, Platform } from '@/types';

const USE_MOCK = false;

// 1: Beginner, 2: Novice, 3: Intermediate, 4: Advanced, 5: Expert
export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

function getTierMapping(platform: Platform, tier: DifficultyTier) {
  if (platform === 'CODEFORCES') {
    switch(tier) {
      case 1: return { minRating: 800, maxRating: 1100 };
      case 2: return { minRating: 1200, maxRating: 1500 };
      case 3: return { minRating: 1600, maxRating: 1900 };
      case 4: return { minRating: 2000, maxRating: 2300 };
      case 5: return { minRating: 2400, maxRating: 3500 };
    }
  }
  if (platform === 'LEETCODE') {
    switch(tier) {
      case 1: return { difficulties: ['EASY'] };
      case 2: return { difficulties: ['EASY'] };
      case 3: return { difficulties: ['MEDIUM'] };
      case 4: return { difficulties: ['MEDIUM', 'HARD'] };
      case 5: return { difficulties: ['HARD'] };
    }
  }
  if (platform === 'ATCODER') {
    switch(tier) {
      case 1: return { minRating: 0, maxRating: 399 };
      case 2: return { minRating: 400, maxRating: 799 };
      case 3: return { minRating: 800, maxRating: 1599 };
      case 4: return { minRating: 1600, maxRating: 2399 };
      case 5: return { minRating: 2400, maxRating: 4000 };
    }
  }
  if (platform === 'CODECHEF') {
    switch(tier) {
      case 1: return { minRating: 0, maxRating: 1399 };
      case 2: return { minRating: 1400, maxRating: 1599 };
      case 3: return { minRating: 1600, maxRating: 1799 };
      case 4: return { minRating: 1800, maxRating: 2199 };
      case 5: return { minRating: 2200, maxRating: 5000 };
    }
  }
  return {};
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useProblems() {
  const [displayedProblems, setDisplayedProblems] = useState<Problem[]>([]);
  const [fetchedPool, setFetchedPool] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());

  // Default Forge filters
  const [filters, setFilters] = useState<{
    platforms: Platform[];
    tier: DifficultyTier;
    tags?: string[];
    status?: 'all' | 'solved' | 'unsolved';
  }>({
    platforms: ['CODEFORCES'],
    tier: 2,
    tags: [],
    status: 'unsolved',
  });

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      
      const promises = filters.platforms.map(platform => {
        const tierMapping = getTierMapping(platform, filters.tier);
        const apiFilters: any = {
          platforms: [platform],
          tags: filters.tags,
          status: filters.status === 'all' ? undefined : filters.status,
          ...tierMapping,
        };

        return problemApi.search({
          ...apiFilters,
          page: 0,
          size: 50, // Fetch up to 50 problems per platform to build a good random pool
        }).then(res => res.data.content).catch(err => {
          console.error(`Failed to fetch for ${platform}`, err);
          return [];
        });
      });

      const results = await Promise.all(promises);
      const content = results.flat();
      
      setFetchedPool(content);
      
      // Instantly shuffle and pick 10
      const shuffled = shuffleArray(content).slice(0, 10);
      setDisplayedProblems(shuffled);
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { userApi } = await import('@/lib/api');
          const meRes = await userApi.getMe();
          if (meRes.data && meRes.data.solvedProblemIds) {
            setSolvedProblemIds(new Set(meRes.data.solvedProblemIds));
          }
        } catch (e) {
          console.error("Failed to fetch solved problems", e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const shuffleProblems = () => {
    // If the pool is empty, maybe re-fetch or just do nothing
    if (fetchedPool.length > 0) {
      setLoading(true);
      setTimeout(() => {
        const shuffled = shuffleArray(fetchedPool).slice(0, 10);
        setDisplayedProblems(shuffled);
        setLoading(false);
      }, 400); // Small fake delay for UI effect
    } else {
      fetchProblems();
    }
  };

  return { 
    problems: displayedProblems, 
    loading, 
    filters, 
    updateFilters, 
    shuffleProblems, 
    solvedProblemIds 
  };
}
