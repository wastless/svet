"use client";

import { useCountdown } from '@/utils/hooks/useCountdown';
import type { CountdownConfig } from '@/utils/types/countdown';

interface CountdownProps extends CountdownConfig {
  className?: string;
}

export function Countdown({ targetDate, currentDate, updateInterval, className }: CountdownProps) {
  const timeLeft = useCountdown({ targetDate, currentDate, updateInterval });

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  return (
    <div className={className}>
      <span>{formatTimeUnit(timeLeft.days, 'day')}</span>
      <span>, </span>
      <span>{formatTimeUnit(timeLeft.hours, 'hour')}</span>
      <span>, </span>
      <span>{formatTimeUnit(timeLeft.minutes, 'minute')}</span>
      <span>, </span>
      <span>{formatTimeUnit(timeLeft.seconds, 'second')}</span>
    </div>
  );
} 