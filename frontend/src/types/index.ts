export type Platform = 'CODEFORCES' | 'LEETCODE' | 'ATCODER' | 'CODECHEF';
export type ContestPhase = 'BEFORE' | 'CODING' | 'FINISHED';

export interface Contest {
  id: number;
  externalId: string;
  platform: Platform;
  name: string;
  url: string;
  phase: ContestPhase;
  startTime: string; // ISO 8601
  endTime: string | null;
  durationSeconds: number;
  contestType: string | null;
  frozen: boolean;
}

export interface PlatformInfo {
  key: Platform;
  name: string;
  color: string;
  icon: string; // lucide icon name
  gradient: string;
}

export interface Problem {
  id: number;
  externalId: string;
  platform: Platform;
  name: string;
  url: string;
  rating: number | null;
  difficulty: string | null;
  solvedCount: number;
  tags: string[];
  isSolved?: boolean;
}

export interface ProblemFilterRequest {
  platforms: Platform[];
  minRating?: number;
  maxRating?: number;
  difficulties?: string[];
  tags?: string[];
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: 'all' | 'solved' | 'unsolved';
  page: number;
  size: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page
}

export interface PlatformLink {
  platform: Platform;
  handle: string;
  syncedAt: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  totalSolved: number;
  platforms?: PlatformLink[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
