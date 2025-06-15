"use client";

// Импортируем патч сессии в самом начале
import "@/utils/patches/session-patch-init";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useAuthSession, AUTH_SESSION_KEY } from "@/utils/hooks/useAuthSession";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateSessionCache } from "@/utils/patches/unified-fetch-patch";

// Создаем контекст для передачи данных о сессии
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  invalidateSession: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  invalidateSession: () => {}
});

/**
 * Компонент, который предоставляет доступ к сессии через SessionProvider
 * и одновременно кеширует данные сессии в React Query
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    // Отключаем автоматическую синхронизацию сессии в NextAuth
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false} refetchWhenOffline={false}>
      <AuthDataProvider>
        {children}
      </AuthDataProvider>
    </SessionProvider>
  );
}

/**
 * Внутренний компонент, который обращается к сессии и кеширует ее
 */
function AuthDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  // Получаем данные сессии через React Query для кеширования
  const { data, isLoading } = useAuthSession();

  // Функция для инвалидации кеша сессии
  const invalidateSession = () => {
    // Очищаем перехваченный кеш fetch
    invalidateSessionCache();
    // Инвалидируем кеш React Query
    queryClient.invalidateQueries({ queryKey: [AUTH_SESSION_KEY] });
  };
  
  // Предоставляем данные о сессии через контекст
  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!data?.isAuthenticated, 
        isLoading,
        user: data?.user,
        invalidateSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для доступа к данным аутентификации
 */
export function useAuth() {
  return useContext(AuthContext);
} 