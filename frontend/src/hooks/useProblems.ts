import { useState, useEffect, useCallback } from 'react';
import { problemApi } from '@/lib/api';
import type { Problem, ProblemFilterRequest, Platform } from '@/types';

const USE_MOCK = false;

const MOCK_CF_PROBLEMS: Problem[] = Array.from({ length: 45 }).map((_, i) => ({
  id: 1000 + i,
  externalId: `1900${String.fromCharCode(65 + (i % 26))}`,
  platform: 'CODEFORCES',
  name: `Codeforces Problem ${i + 1}`,
  url: `https://codeforces.com/problemset/problem/1900/${String.fromCharCode(65 + (i % 26))}`,
  rating: 800 + (i % 28) * 100,
  difficulty: null,
  solvedCount: 15000 - i * 100,
  tags: ['implementation', 'math', 'greedy'].slice(0, (i % 3) + 1),
}));

const MOCK_LC_PROBLEMS: Problem[] = Array.from({ length: 45 }).map((_, i) => ({
  id: 2000 + i,
  externalId: `${i + 1}`,
  platform: 'LEETCODE',
  name: `LeetCode Problem ${i + 1}`,
  url: `https://leetcode.com/problems/problem-${i + 1}`,
  rating: null,
  difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard',
  solvedCount: 50000 - i * 200,
  tags: ['array', 'hash-table', 'dynamic-programming'].slice(0, (i % 3) + 1),
}));

export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());

  // Default to a single platform
  const [filters, setFilters] = useState<Omit<ProblemFilterRequest, 'page' | 'size'>>({
    platforms: ['CODEFORCES'],
    difficulties: [],
    tags: [],
    minRating: 800,
    maxRating: 3500,
    status: 'all',
  });

  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK) {
        await new Promise(res => setTimeout(res, 300));
        let mockData = [...MOCK_CF_PROBLEMS, ...MOCK_LC_PROBLEMS];
        
        // Filter by single platform
        const activePlatform = filters.platforms[0];
        mockData = mockData.filter(p => p.platform === activePlatform);
        
        // Filter by CF rating
        if (activePlatform === 'CODEFORCES' && filters.minRating !== undefined && filters.maxRating !== undefined) {
          mockData = mockData.filter(p => p.rating! >= filters.minRating! && p.rating! <= filters.maxRating!);
        }

        // Filter by LC difficulty
        if (activePlatform === 'LEETCODE' && filters.difficulties && filters.difficulties.length > 0) {
          mockData = mockData.filter(p => filters.difficulties!.includes(p.difficulty!));
        }
        
        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
          mockData = mockData.filter(p => p.tags.some(tag => filters.tags!.includes(tag)));
        }

        const start = page * pageSize;
        const pagedData = mockData.slice(start, start + pageSize);

        setProblems(pagedData);
        setTotalPages(Math.ceil(mockData.length / pageSize) || 1);
      } else {
        const apiFilters = { ...filters };
        const activePlatform = filters.platforms[0];
        if (activePlatform !== 'CODEFORCES') {
          delete apiFilters.minRating;
          delete apiFilters.maxRating;
        }

        const response = await problemApi.search({
          ...apiFilters,
          page: page,
          size: pageSize,
        });

        const { content, totalPages } = response.data;
        setProblems(content);
        setTotalPages(totalPages || 1);
        
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
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page on filter change
  };

  const nextPage = () => {
    if (page < totalPages - 1) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
    }
  };

  return { problems, loading, filters, updateFilters, page, totalPages, nextPage, prevPage, solvedProblemIds };
}
