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
      const response = await fetch("/api/gifts");
      if (!response.ok) {
        throw new Error("Ошибка загрузки подарков");
      }
      return response.json() as Promise<Gift[]>;
    },
    staleTime: 5 * 60 * 1000, // Кешируем на 5 минут
    refetchOnWindowFocus: false, // Не обновляем при фокусе окна
    refetchOnMount: false, // Не обновляем при монтировании компонента
    refetchOnReconnect: false, // Не обновляем при переподключении
  });
}

// Получение конкретного подарка по ID
export function useGift(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.GIFT(id),
    queryFn: async () => {
      const response = await fetch(`/api/gifts/${id}`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки подарка ${id}`);
      }
      return response.json() as Promise<Gift>;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // Кешируем на 10 минут
    refetchOnWindowFocus: false, // Не обновляем при фокусе окна
    refetchOnMount: false, // Не обновляем при монтировании компонента
    refetchOnReconnect: false, // Не обновляем при переподключении
  });
}

// Получение контента подарка
export function useGiftContent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.GIFT_CONTENT(id),
    queryFn: async () => {
      const response = await fetch(`/api/gift-content/${id}`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки контента подарка ${id}`);
      }
      return response.json() as Promise<GiftContent>;
    },
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // Кешируем на 30 минут
    refetchOnWindowFocus: false, // Не обновляем при фокусе окна
    refetchOnMount: false, // Не обновляем при монтировании компонента
    refetchOnReconnect: false, // Не обновляем при переподключении
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