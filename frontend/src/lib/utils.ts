import type { Contest, Platform, ContestPhase } from '@/types';
import { PLATFORM_MAP } from './constants';

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const target = new Date(iso);
  const diffMs = target.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);

  const minutes = Math.floor(absDiffMs / 60000);
  const hours = Math.floor(absDiffMs / 3600000);
  const days = Math.floor(absDiffMs / 86400000);

  if (diffMs > 0) {
    if (minutes < 60) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h ${minutes % 60}m`;
    return `in ${days}d ${hours % 24}h`;
  } else {
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

export function buildGoogleCalendarUrl(contest: Contest): string {
  const startDate = new Date(contest.startTime);
  const endDate = contest.endTime
    ? new Date(contest.endTime)
    : new Date(startDate.getTime() + contest.durationSeconds * 1000);

  const formatGCalDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${contest.name} — ${getPlatformName(contest.platform)}`,
    dates: `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`,
    details: `Contest on ${getPlatformName(contest.platform)}\n\nLink: ${contest.url}`,
    location: contest.url,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function getPlatformColor(platform: Platform): string {
  return PLATFORM_MAP[platform]?.color ?? '#6366f1';
}

export function getPlatformName(platform: Platform): string {
  return PLATFORM_MAP[platform]?.name ?? platform;
}

export function getPhaseLabel(phase: ContestPhase): string {
  switch (phase) {
    case 'BEFORE':
      return 'Upcoming';
    case 'CODING':
      return 'Live';
    case 'FINISHED':
      return 'Ended';
    default:
      return phase;
  }
}

export function getPhaseColor(phase: ContestPhase): string {
  switch (phase) {
    case 'BEFORE':
      return '#3b82f6';
    case 'CODING':
      return '#22c55e';
    case 'FINISHED':
      return '#64748b';
    default:
      return '#64748b';
  }
}
