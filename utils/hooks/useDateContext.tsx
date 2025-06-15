"use client";

import { createContext, useContext, useState, useEffect, useRef, memo } from 'react';
import type { ReactNode } from 'react';

// Контекст для секундомера (обновляется каждую секунду)
interface TimerContextType {
  currentDate: Date | null;
  setCurrentDate: (date: Date) => void;
  isTestMode: boolean;
  setIsTestMode: (mode: boolean) => void;
}

// Контекст для подарков (обновляется раз в день)
interface GiftsContextType {
  giftsDate: Date | null;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);
const GiftsContext = createContext<GiftsContextType | undefined>(undefined);

// Мемоизированный провайдер для подарков, чтобы предотвратить лишние ререндеры
const GiftsProvider = memo(function GiftsProvider({ 
  children, 
  giftsDate 
}: { 
  children: ReactNode; 
  giftsDate: Date | null;
}) {
  return (
    <GiftsContext.Provider value={{ giftsDate }}>
      {children}
    </GiftsContext.Provider>
  );
});

// Компонент-провайдер для обоих контекстов
export function DateProvider({ children }: { children: ReactNode }) {
  const [isTestMode, setIsTestMode] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [giftsDate, setGiftsDate] = useState<Date | null>(null);
  const lastDayRef = useRef<string | null>(null);

  // Инициализируем даты только на клиенте
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setGiftsDate(now);
    lastDayRef.current = formatDateKey(now);
  }, []);

  // Функция для создания ключа даты (год-месяц-день)
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  // Синхронизация giftsDate с currentDate в тестовом режиме
  useEffect(() => {
    if (isTestMode && currentDate) {
      setGiftsDate(currentDate);
    }
  }, [isTestMode, currentDate]);

  // Автоматическое обновление времени в обычном режиме
  useEffect(() => {
    if (isTestMode) return; // В тестовом режиме не обновляем автоматически

    // Функция обновления текущего времени
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentDate(now);
      
      // Проверяем, изменился ли день
      const currentDateKey = formatDateKey(now);
      if (lastDayRef.current !== currentDateKey) {
        console.log('День изменился, обновляем дату для подарков');
        setGiftsDate(now);
        lastDayRef.current = currentDateKey;
      }
    };

    // Обновляем время каждую секунду для корректной работы секундомера
    const interval = setInterval(updateCurrentTime, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isTestMode]);

  return (
    <TimerContext.Provider value={{ currentDate, setCurrentDate, isTestMode, setIsTestMode }}>
      <GiftsProvider giftsDate={giftsDate}>
        {children}
      </GiftsProvider>
    </TimerContext.Provider>
  );
}

// Хук для доступа к контексту таймера (секундомера)
export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a DateProvider');
  }
  return context;
}

// Хук для доступа к контексту подарков
export function useGifts() {
  const context = useContext(GiftsContext);
  if (context === undefined) {
    throw new Error('useGifts must be used within a DateProvider');
  }
  return context;
}

// Обратная совместимость для существующего кода
export function useDate() {
  const timerContext = useContext(TimerContext);
  const giftsContext = useContext(GiftsContext);
  
  if (timerContext === undefined || giftsContext === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  
  return {
    ...timerContext,
    ...giftsContext
  };
} 