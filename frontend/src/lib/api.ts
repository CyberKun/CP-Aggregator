import axios from 'axios';
import { API_BASE_URL } from './constants';
import type { Contest, ProblemFilterRequest, Page, Problem } from '@/types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const contestApi = {
  getAll: (platforms?: string[], phases?: string[]) =>
    api.get<Contest[]>('/contests', {
      params: {
        platforms: platforms?.join(','),
        phases: phases?.join(','),
      },
    }),

  getUpcoming: () => api.get<Contest[]>('/contests/upcoming'),

  getLive: () => api.get<Contest[]>('/contests/live'),

  refresh: () => api.post('/contests/refresh'),
};

export const problemApi = {
  search: (filters: ProblemFilterRequest) => api.post<Page<Problem>>('/problems/search', filters),
};

export const authApi = {
  login: (data: any) => api.post<any>('/auth/login', data),
  register: (data: any) => api.post<any>('/auth/register', data),
};

export const userApi = {
  getMe: () => api.get<any>('/users/me'),
  linkPlatform: (data: { platform: string; handle: string }) => api.post<any>('/users/me/platforms', data),
  syncData: () => api.post<any>('/users/me/sync'),
  getAttemptedContests: () => api.get<string[]>('/users/me/contests/attempted'),
  getSolvedProblems: () => api.get<string[]>('/users/me/problems/solved'),
};

export default api;
