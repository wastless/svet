"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Gift, GiftContent } from "@/utils/types/gift";
import { useAuthSession } from "./useAuthSession";
import { invalidateGiftCache } from "../patches/unified-fetch-patch";
import { useMemo, useRef, useCallback } from "react";

// Ключи для запросов
export const QUERY_KEYS = {
  GIFTS: "gifts",
  GIFT: (id: string) => ["gift", id],
  GIFT_CONTENT: (id: string) => ["gift-content", id],
};

// Получение всех подарков
export function useGifts() {
  return useQuery({
    queryKey: [QUERY_KEYS.GIFTS],
    queryFn: async () => {
      // Добавляем случайный параметр к URL, чтобы обойти кеш браузера
      const timestamp = Date.now();
      const response = await fetch(`/api/gifts?_t=${timestamp}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки подарков");
      }
      return response.json() as Promise<Gift[]>;
    },
    staleTime: 0, // Отключаем кеширование
    gcTime: 0, // Отключаем хранение в кеше
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnMount: true, // Обновляем при монтировании компонента
    refetchOnReconnect: true, // Обновляем при переподключении
  });
}

// Получение конкретного подарка по ID
export function useGift(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.GIFT(id),
    queryFn: async () => {
      // Добавляем случайный параметр к URL, чтобы обойти кеш браузера
      const timestamp = Date.now();
      const response = await fetch(`/api/gifts/${id}?_t=${timestamp}`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки подарка ${id}`);
      }
      return response.json() as Promise<Gift>;
    },
    enabled: !!id,
    staleTime: 0, // Отключаем кеширование
    gcTime: 0, // Отключаем хранение в кеше (в новых версиях React Query cacheTime переименован в gcTime)
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnMount: true, // Обновляем при монтировании компонента
    refetchOnReconnect: true, // Обновляем при переподключении
  });
}

// Получение контента подарка
export function useGiftContent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.GIFT_CONTENT(id),
    queryFn: async () => {
      // Добавляем случайный параметр к URL, чтобы обойти кеш браузера
      const timestamp = Date.now();
      const response = await fetch(`/api/gift-content/${id}?_t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки контента подарка ${id}`);
      }
      
      // Если это редирект на contentUrl, следуем за ним
      if (response.redirected) {
        const contentResponse = await fetch(response.url);
        if (!contentResponse.ok) {
          throw new Error(`Ошибка загрузки контента подарка ${id} из облачного хранилища`);
        }
        return contentResponse.json() as Promise<GiftContent>;
      }
      
      return response.json() as Promise<GiftContent>;
    },
    enabled: !!id,
    staleTime: 0, // Отключаем кеширование
    gcTime: 0, // Отключаем хранение в кеше (в новых версиях React Query cacheTime переименован в gcTime)
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnMount: true, // Обновляем при монтировании компонента
    refetchOnReconnect: true, // Обновляем при переподключении
  });
}

// Получение полных данных подарка (основные данные + контент) в одном хуке
export function useGiftData(id: string) {
  const giftQuery = useGift(id);
  const contentQuery = useGiftContent(id);
  
  // Используем централизованный хук для проверки сессии
  const authQuery = useAuthSession();

  const isLoading = giftQuery.isLoading || contentQuery.isLoading || authQuery.isLoading;
  const isError = giftQuery.isError || contentQuery.isError || authQuery.isError;
  const error = giftQuery.error || contentQuery.error || authQuery.error;

  // Создаем мемоизированный объект data
  const data = useMemo(() => {
    if (isLoading || isError) return null;
    return {
      gift: giftQuery.data,
      content: contentQuery.data,
      isAuthenticated: authQuery.data?.isAuthenticated,
      memoryPhoto: giftQuery.data?.memoryPhoto,
    };
  }, [isLoading, isError, giftQuery.data, contentQuery.data, authQuery.data?.isAuthenticated]);

  // Сохраняем последнее значение cacheInvalidated
  const cacheInvalidatedRef = useRef(false);

  // Функция для обновления данных
  const refetch = useCallback(async () => {
    // Инвалидируем кеш только если он еще не был инвалидирован
    if (!cacheInvalidatedRef.current) {
      console.log(`🔄 Invalidating cache for gift ${id}`);
      invalidateGiftCache(id);
      cacheInvalidatedRef.current = true;
    }
    
    // Запускаем повторную загрузку данных
    await Promise.all([
      giftQuery.refetch(),
      contentQuery.refetch()
    ]);
    
    // Сбрасываем флаг после выполнения запросов
    setTimeout(() => {
      cacheInvalidatedRef.current = false;
    }, 500);
  }, [id, giftQuery, contentQuery]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch
  };
}

// Мутация для создания подарка
export function useCreateGift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (giftData: any) => {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(giftData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при создании подарка");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Инвалидируем кеш списка подарков
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GIFTS] });
      
      // Очищаем кеш API для списка подарков
      invalidateGiftCache();
    },
  });
}

// Мутация для обновления подарка
export function useUpdateGift(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (giftData: any) => {
      // Проверяем, что ID не пустой перед выполнением запроса
      if (!id) {
        throw new Error("ID подарка не указан");
      }
      
      const response = await fetch(`/api/gifts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(giftData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при обновлении подарка");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Проверяем, что ID не пустой перед обновлением кеша
      if (!id) return;
      
      // Обновляем кеш для этого конкретного подарка
      queryClient.setQueryData(QUERY_KEYS.GIFT(id), data);
      // Инвалидируем кеш списка всех подарков
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GIFTS] });
      // Инвалидируем кеш контента подарка
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GIFT_CONTENT(id) });
      
      // Очищаем кеш API для этого подарка
      invalidateGiftCache(id);
    },
  });
}

// Мутация для удаления подарка
export function useDeleteGift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/gifts/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Ошибка при удалении подарка");
      }
      
      return id;
    },
    onSuccess: (deletedId) => {
      // Инвалидируем кеш списка подарков
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GIFTS] });
      // Удаляем кеш для этого конкретного подарка
      queryClient.removeQueries({ queryKey: QUERY_KEYS.GIFT(deletedId) });
      // Удаляем кеш контента подарка
      queryClient.removeQueries({ queryKey: QUERY_KEYS.GIFT_CONTENT(deletedId) });
      
      // Очищаем кеш API для этого подарка
      invalidateGiftCache(deletedId);
    },
  });
} 