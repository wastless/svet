"use client";

import { useState, useEffect, memo } from 'react';
import { useTimer } from '@/utils/hooks/useDateContext';
import type { CountdownTime, CountdownConfig } from '@/utils/types/countdown';

interface CountdownProps extends CountdownConfig {
  className?: string;
}

// Внутренний компонент для отображения времени, который не будет перерисовываться при изменении других компонентов
const CountdownDisplay = memo(function CountdownDisplay({ days, hours, minutes, seconds, className }: CountdownTime & { className?: string }) {
  const formatTimeUnit = (value: number, unit: string) => {
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  return (
    <div className={className}>
      <span>{formatTimeUnit(days, 'day')}</span>
      <span>, </span>
      <span>{formatTimeUnit(hours, 'hour')}</span>
      <span>, </span>
      <span>{formatTimeUnit(minutes, 'minute')}</span>
      <span>, </span>
      <span>{formatTimeUnit(seconds, 'second')}</span>
    </div>
  );
});

// Компонент-обертка, который будет обновляться каждую секунду
export function Countdown({ targetDate, updateInterval, className }: CountdownProps) {
  const { currentDate } = useTimer();
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  // Функция для расчета оставшегося времени
  const calculateTimeLeft = (): CountdownTime => {
    // Если дата еще не инициализирована, возвращаем нули
    if (!currentDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const now = currentDate;
    
    // Создаем целевую дату как начало дня (00:00:00.000) в челябинском часовом поясе
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

  // Эффект для обновления времени
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

  // Рендерим мемоизированный компонент отображения
  return <CountdownDisplay {...timeLeft} className={className} />;
} 