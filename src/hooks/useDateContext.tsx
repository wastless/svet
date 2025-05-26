"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface DateContextType {
  currentDate: Date | null;
  setCurrentDate: (date: Date) => void;
  isTestMode: boolean;
  setIsTestMode: (mode: boolean) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [isTestMode, setIsTestMode] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // Инициализируем дату только на клиенте для избежания ошибок гидратации
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Автоматическое обновление времени в обычном режиме
  useEffect(() => {
    if (isTestMode) return; // В тестовом режиме не обновляем автоматически

    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // Обновляем каждую секунду

    return () => clearInterval(interval);
  }, [isTestMode]);

  return (
    <DateContext.Provider value={{ currentDate, setCurrentDate, isTestMode, setIsTestMode }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
} 