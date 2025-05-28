"use client";

import { useWordOfDay } from '@/utils/hooks/useWordOfDay';
import type { WordConfig } from '@/utils/types/words';

interface WordOfDayProps extends WordConfig {
  className?: string;
}

export function WordOfDay({ startDate, cycleLength, currentDate, className }: WordOfDayProps) {
  const word = useWordOfDay({ startDate, cycleLength, currentDate });

  return (
    <span className={className}>
      {word}
    </span>
  );
} 