"use client";

import { useState, useEffect } from 'react';
import type { CountdownTime, CountdownConfig } from '~/types/countdown';

export function useCountdown({ targetDate, currentDate, updateInterval = 1000 }: CountdownConfig) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = (): CountdownTime => {
    // Если дата еще не инициализирована, возвращаем нули
    if (!currentDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const now = currentDate;
    const target = new Date(targetDate);
    const difference = target.getTime() - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  useEffect(() => {
    // Не запускаем таймер пока дата не инициализирована
    if (!currentDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, updateInterval);

    // Сразу вычисляем время при монтировании
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate, currentDate, updateInterval]);

  return timeLeft;
} 