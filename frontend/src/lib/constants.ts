import type { PlatformInfo } from '@/types';

export const API_BASE_URL = '/api';

export const PLATFORMS: PlatformInfo[] = [
  {
    key: 'CODEFORCES',
    name: 'Codeforces',
    color: '#1F8ACB', // Official Blue
    icon: 'Code2',
    gradient: 'from-blue-400 to-blue-600',
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
    color: '#8B5CF6', // Vibrant Violet
    icon: 'Triangle',
    gradient: 'from-violet-400 to-violet-600',
  },
  {
    key: 'CODECHEF',
    name: 'CodeChef',
    color: '#10B981', // Vibrant Emerald Green
    icon: 'Hexagon',
    gradient: 'from-emerald-400 to-emerald-600',
  },
];

export const PLATFORM_MAP = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p])
) as Record<string, PlatformInfo>;
