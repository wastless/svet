"use client";

import { useWordOfDay } from '@/utils/hooks/useWordOfDay';
import type { WordConfig } from '@/utils/types/words';
import { useGifts } from '@/utils/hooks/useDateContext';

interface WordOfDayProps extends WordConfig {
  className?: string;
}

export function WordOfDay({ startDate, cycleLength, currentDate: externalCurrentDate, className }: WordOfDayProps) {
  // Используем дату из контекста подарков, если внешняя дата не предоставлена
  const { giftsDate } = useGifts();
  const currentDate = externalCurrentDate || giftsDate;
  
  const word = useWordOfDay({ startDate, cycleLength, currentDate });

  return (
    <span className={className}>
      {word}
    </span>
  );
} 