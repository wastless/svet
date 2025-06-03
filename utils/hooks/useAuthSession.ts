"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

// Ключ для запроса сессии
export const AUTH_SESSION_KEY = "auth-session";

// Получаем сохраненную сессию из localStorage, если она есть
const getSavedSession = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('auth_session_cache');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Проверяем, что сессия не устарела
      const expiresAt = new Date(parsed.expiresAt || 0);
      if (expiresAt > new Date()) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.error('Ошибка при получении кешированной сессии:', e);
  }
  
  return null;
};

// Сохраняем сессию в localStorage для персистентности между перезагрузками
const saveSession = (data: any) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Устанавливаем срок жизни кеша - 30 минут
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    localStorage.setItem('auth_session_cache', JSON.stringify({
      data,
      expiresAt: expiresAt.toISOString(),
    }));
  } catch (e) {
    console.error('Ошибка при сохранении кешированной сессии:', e);
  }
};

/**
 * Хук для получения информации о сессии пользователя
 * с кешированием для избежания дублирующихся запросов
 */
export function useAuthSession() {
  // Функция для получения сессии
  const fetchSession = useCallback(async () => {
    console.log('🔑 Fetching session data');
    const res = await fetch('/api/auth/session');
    const session = await res.json();
    
    const data = {
      user: session?.user || null,
      isAuthenticated: !!session?.user,
      expires: session?.expires || null,
    };
    
    // Сохраняем сессию в localStorage
    saveSession(data);
    
    return data;
  }, []);

  return useQuery({
    queryKey: [AUTH_SESSION_KEY],
    queryFn: fetchSession,
    // Используем начальные данные из localStorage, если они есть
    initialData: getSavedSession,
    staleTime: 30 * 60 * 1000, // Кешируем на 30 минут
    gcTime: 60 * 60 * 1000, // Хранить в кеше 1 час
    refetchOnWindowFocus: false, // Не обновляем при фокусе окна
    refetchOnMount: false, // Не обновляем при монтировании компонента
    refetchOnReconnect: false, // Не обновляем при переподключении
  });
} 