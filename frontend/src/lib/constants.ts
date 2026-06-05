import type { PlatformInfo } from '@/types';

export const API_BASE_URL = '/api';

export const PLATFORMS: PlatformInfo[] = [
  {
    key: 'CODEFORCES',
    name: 'Codeforces',
    color: '#1A8FDB',
    icon: 'Code2',
    gradient: 'from-blue-400 to-cyan-400',
  },
  {
    key: 'LEETCODE',
    name: 'LeetCode',
    color: '#FFA116',
    icon: 'Terminal',
    gradient: 'from-orange-400 to-amber-400',
  },
];

export const PLATFORM_MAP = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p])
) as Record<string, PlatformInfo>;
