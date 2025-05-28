"use client";

import { useEffect, useState } from "react";

export function useIntro() {
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем куки только в браузере
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const introCompleted = cookies.some(cookie => 
        cookie.trim().startsWith('intro_completed=true')
      );
      
      setShouldShowIntro(!introCompleted);
      setIsLoading(false);
    }
  }, []);

  const completeIntro = () => {
    // Устанавливаем куки на 1 год
    document.cookie = "intro_completed=true; path=/; max-age=" + (60 * 60 * 24 * 365);
    setShouldShowIntro(false);
  };

  const resetIntro = () => {
    // Удаляем куки (для тестирования)
    document.cookie = "intro_completed=; path=/; max-age=0";
    setShouldShowIntro(true);
  };

  return {
    shouldShowIntro,
    isLoading,
    completeIntro,
    resetIntro
  };
} 