import type { PlatformInfo } from '@/types';

export const API_BASE_URL = '/api';

export const PLATFORMS: PlatformInfo[] = [
  {
    key: 'CODEFORCES',
    name: 'Codeforces',
    color: '#22c55e', // Green
    icon: 'Code2',
    gradient: 'from-green-400 to-green-600',
  },
  {
    key: 'LEETCODE',
    name: 'LeetCode',
    color: '#ffa116', // Leetcode Orange
    icon: 'Terminal',
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    key: 'ATCODER',
    name: 'AtCoder',
    color: '#222222', // Black/dark gray
    icon: 'Triangle',
    gradient: 'from-gray-700 to-gray-900',
  },
  {
    key: 'CODECHEF',
    name: 'CodeChef',
    color: '#5B4638', // Brown
    icon: 'Hexagon',
    gradient: 'from-amber-700 to-amber-900',
  },
];

export const PLATFORM_MAP = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p])
) as Record<string, PlatformInfo>;
