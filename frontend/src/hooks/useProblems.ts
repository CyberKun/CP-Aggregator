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

  const [filters, setFilters] = useState<{
    platforms: Platform[];
    tier: DifficultyTier;
    tags?: string[];
  }>({
    platforms: ['CODEFORCES'] as Platform[],
    tier: 2,
    tags: [],
  });

  const isFirstMount = useRef(true);
  const currentFilters = useRef(filters);

  const fetchSolvedIds = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { userApi } = await import('@/lib/api');
      const meRes = await userApi.getMe();
      if (meRes.data && meRes.data.solvedProblemIds) {
        setSolvedProblemIds(new Set(meRes.data.solvedProblemIds));
      }
    } catch (e) {
      console.error("Failed to fetch solved problems", e);
    }
  }, []);

  const fetchProblemsFromApi = async (activeFilters: typeof filters) => {
    try {
      setLoading(true);
      const promises = activeFilters.platforms.map(platform => {
        const tierMapping = getTierMapping(platform, activeFilters.tier);
        const apiFilters: any = {
          platforms: [platform],
          tags: activeFilters.tags,
          status: 'unsolved', // Always only fetch unsolved problems
          ...tierMapping,
        };

        return problemApi.search({
          ...apiFilters,
          page: 0,
          size: 50,
        }).then(res => res.data.content).catch(err => []);
      });

      const results = await Promise.all(promises);
      const content = results.flat();
      
      setFetchedPool(content);
      localStorage.setItem('cp_practice_pool', JSON.stringify(content));
      
      const shuffled = shuffleArray(content).slice(0, 10);
      setDisplayedProblems(shuffled);
      localStorage.setItem('cp_practice_displayed', JSON.stringify(shuffled));
      
      await fetchSolvedIds();
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      let loadedFilters = { platforms: ['CODEFORCES'] as Platform[], tier: 2 as DifficultyTier, tags: [] as string[] };
      let loadedDisplayed: Problem[] = [];
      let loadedPool: Problem[] = [];
      
      try {
        const savedFilters = localStorage.getItem('cp_practice_filters');
        const savedDisplayed = localStorage.getItem('cp_practice_displayed');
        const savedPool = localStorage.getItem('cp_practice_pool');

        if (savedFilters) loadedFilters = JSON.parse(savedFilters);
        if (savedDisplayed) loadedDisplayed = JSON.parse(savedDisplayed);
        if (savedPool) loadedPool = JSON.parse(savedPool);
      } catch (e) {}

      setFilters(loadedFilters);
      currentFilters.current = loadedFilters;

      if (loadedDisplayed.length > 0) {
        setDisplayedProblems(loadedDisplayed);
        setFetchedPool(loadedPool);
        
        // Just refresh the solved statuses! Don't generate new problems.
        fetchSolvedIds().then(() => setLoading(false));
      } else {
        fetchProblemsFromApi(loadedFilters);
      }
    } else {
      // If filters changed, we fetch new problems
      fetchProblemsFromApi(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => {
      const next = { ...prev, ...newFilters };
      localStorage.setItem('cp_practice_filters', JSON.stringify(next));
      currentFilters.current = next;
      return next;
    });
  };

  const shuffleProblems = () => {
    if (fetchedPool.length > 0) {
      setLoading(true);
      setTimeout(() => {
        const shuffled = shuffleArray(fetchedPool).slice(0, 10);
        setDisplayedProblems(shuffled);
        localStorage.setItem('cp_practice_displayed', JSON.stringify(shuffled));
        setLoading(false);
      }, 400);
    } else {
      fetchProblemsFromApi(currentFilters.current);
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
