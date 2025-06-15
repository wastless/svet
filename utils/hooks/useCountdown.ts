"use client";

import { useState, useEffect } from 'react';
import type { CountdownTime, CountdownConfig } from '../types/countdown';
import { useTimer } from './useDateContext';

export function useCountdown({ targetDate, currentDate: externalCurrentDate, updateInterval = 1000 }: CountdownConfig) {
  // Получаем текущую дату из контекста таймера, если внешняя дата не предоставлена
  const { currentDate: contextCurrentDate } = useTimer();
  const currentDate = externalCurrentDate || contextCurrentDate;
  
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
    
    // Создаем целевую дату как начало дня (00:00:00.000) в челябинском часовом поясе
    // Добавляем время 00:00:00.000 к дате для точного отсчета до начала дня
    const target = new Date(`${targetDate}T00:00:00.000+05:00`); // +05:00 это UTC+5 для Челябинска
    
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