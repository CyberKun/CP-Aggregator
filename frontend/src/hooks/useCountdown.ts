'use client';

import { useState, useEffect, useRef } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  isExpired: boolean;
  totalSeconds: number;
}

export function useCountdown(targetDate: string): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() =>
    calculateTimeLeft(targetDate)
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));

    intervalRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: string): CountdownResult {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUrgent: false,
      isExpired: true,
      totalSeconds: 0,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isUrgent: totalSeconds < 3600,
    isExpired: false,
    totalSeconds,
  };
}
