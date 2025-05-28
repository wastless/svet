"use client";

import { useMemo } from 'react';
import type { WordConfig } from '../types/words';
import { DAILY_WORDS } from '../data/words';
import { COUNTDOWN_CONFIG } from '../data/constants';

export function useWordOfDay({ startDate, cycleLength, currentDate }: WordConfig) {
  const wordOfDay = useMemo(() => {
    // Если дата еще не инициализирована, возвращаем fallback
    if (!currentDate) {
      return DAILY_WORDS[0] || 'Loading...';
    }
    
    const now = currentDate;
    const start = new Date(startDate);
    const targetDate = new Date(COUNTDOWN_CONFIG.TARGET_DATE);
    
    // Проверяем, является ли текущая дата днем рождения
    const isBirthday = now.toDateString() === targetDate.toDateString();
    
    if (isBirthday) {
      return 'Happy Birthday';
    }
    
    // Вычисляем количество дней с начальной даты
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Если текущая дата раньше начальной, возвращаем первое слово
    if (diffDays < 0) {
      return DAILY_WORDS[0];
    }
    
    // Вычисляем индекс слова в цикле
    const wordIndex = diffDays % cycleLength;
    
    // Возвращаем слово или первое слово, если индекс выходит за границы массива
    return DAILY_WORDS[wordIndex] || DAILY_WORDS[0];
  }, [startDate, cycleLength, currentDate]);

  return wordOfDay;
} 