"use client";

import React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavVisibility } from "../../src/components/providers/nav-visibility-provider";
import { useRouter, usePathname } from "next/navigation";

/**
 * Класс для управления интро, основанный на паттерне из оригинального файла intro
 */
class Introduction {
  private static instance: Introduction;
  private introCompletedKey = 'intro_completed';
  private isDebug = false;
  private onStateChangeCallbacks: ((completed: boolean) => void)[] = [];

  /**
   * Получить экземпляр класса (синглтон)
   */
  public static getInstance(): Introduction {
    if (!Introduction.instance) {
      Introduction.instance = new Introduction();
    }
    return Introduction.instance;
  }

  /**
   * Проверить, должно ли быть показано интро
   */
  public shouldShowIntro(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.isDebug) return true;
    
    return !this.isIntroCompleted();
  }

  /**
   * Проверить, завершено ли интро пользователем
   */
  private isIntroCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => 
      cookie.trim().startsWith(`${this.introCompletedKey}=true`)
    );
  }

  /**
   * Отметить интро как завершенное
   */
  public completeIntro(): void {
    if (typeof window === 'undefined') return;
    
    // Устанавливаем куки на 1 год
    document.cookie = `${this.introCompletedKey}=true; path=/; max-age=${60 * 60 * 24 * 365}`;
    
    // Оповещаем слушателей
    this.dispatchIntroStateChange(true);
  }

  /**
   * Сбросить состояние интро (для отладки)
   */
  public resetIntro(): void {
    if (typeof window === 'undefined') return;
    
    // Удаляем куки
    document.cookie = `${this.introCompletedKey}=; path=/; max-age=0`;
    
    // Оповещаем слушателей
    this.dispatchIntroStateChange(false);
  }

  /**
   * Установить режим отладки
   */
  public setDebugMode(debug: boolean): void {
    this.isDebug = debug;
  }

  /**
   * Отправить событие изменения состояния интро
   */
  private dispatchIntroStateChange(completed: boolean): void {
    // Вызываем зарегистрированные колбэки
    this.onStateChangeCallbacks.forEach(callback => callback(completed));
    
    // Также отправляем событие в DOM, как в оригинальном коде
    if (typeof window !== 'undefined') {
      try {
        const event = new CustomEvent('introStateChange', {
          detail: { completed }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error dispatching intro state change event:', error);
      }
    }
  }

  /**
   * Добавить обработчик изменения состояния интро
   */
  public onStateChange(callback: (completed: boolean) => void): () => void {
    this.onStateChangeCallbacks.push(callback);
    
    // Возвращаем функцию для удаления обработчика
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Создаем контекст для React-компонентов
type IntroContextType = {
  shouldShowIntro: boolean;
  completeIntro: () => void;
  resetIntro: () => void;
}

const IntroContext = createContext<IntroContextType | null>(null);

/**
 * Хук для использования Introduction в React компонентах
 * (Это позволит сохранить совместимость с существующим кодом)
 */
export function useIntro() {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error('useIntro must be used within an IntroProvider');
  }
  
  const [isLoading, setIsLoading] = useState(true);
  const { setNavVisibility } = useNavVisibility();
  
  // Немедленно скрываем навигацию если показываем интро
  // Это выполняется при первом рендере, до useEffect
  if (context.shouldShowIntro) {
    // Используем setTimeout с нулевой задержкой чтобы отложить выполнение после текущего цикла рендеринга
    setTimeout(() => {
      setNavVisibility(false);
    }, 0);
  }
  
  useEffect(() => {
    // Управляем видимостью навигации в зависимости от состояния интро
    setNavVisibility(!context.shouldShowIntro);
    
    // Завершаем загрузку
    setIsLoading(false);
    
    // Следим за изменениями состояния интро
    const handleIntroStateChange = (event: CustomEvent) => {
      const { completed } = event.detail;
      if (completed) {
        // Используем небольшую задержку для плавного перехода
        setTimeout(() => {
          setNavVisibility(true);
        }, 300);
      } else {
        setNavVisibility(false);
      }
    };
    
    window.addEventListener('introStateChange', handleIntroStateChange as EventListener);
    
    return () => {
      window.removeEventListener('introStateChange', handleIntroStateChange as EventListener);
    };
  }, [context.shouldShowIntro, setNavVisibility]);
  
  return {
    shouldShowIntro: context.shouldShowIntro,
    isLoading,
    completeIntro: context.completeIntro,
    resetIntro: context.resetIntro
  };
}

// Добавляем тип для пропсов провайдера
interface IntroProviderProps {
  children: ReactNode;
}

/**
 * Провайдер для Introduction
 */
export function IntroProvider({ children }: IntroProviderProps) {
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const intro = Introduction.getInstance();
  
  useEffect(() => {
    // Проверяем начальное состояние
    setShouldShowIntro(intro.shouldShowIntro());
    
    // Подписываемся на изменения
    const unsubscribe = intro.onStateChange((completed) => {
      setShouldShowIntro(!completed);
    });
    
    return unsubscribe;
  }, []);
  
  const value: IntroContextType = {
    shouldShowIntro,
    completeIntro: () => intro.completeIntro(),
    resetIntro: () => intro.resetIntro()
  };
  
  return (
    <IntroContext.Provider value={value}>
      {children}
    </IntroContext.Provider>
  );
}

// Экспортируем класс для использования вне React
export const IntroductionManager = Introduction.getInstance();

/**
 * HOC для перенаправления на главную страницу, если интро не пройдено
 * @param Component Компонент, который нужно обернуть
 * @param options Опции для настройки поведения
 */
export function withIntroRedirect<P extends object>(
  Component: React.ComponentType<P>,
  options: { 
    excludePaths?: string[]; // Пути, которые не требуют прохождения интро
    homePath?: string; // Путь к главной странице с интро
  } = {}
) {
  const { excludePaths = [], homePath = '/' } = options;
  
  const WithIntroRedirect = (props: P) => {
    const { shouldShowIntro } = useIntro();
    const router = useRouter();
    const pathname = usePathname();
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    // Проверяем, находимся ли мы на главной странице
    const isHomePage = pathname === homePath;
    
    useEffect(() => {
      // Проверяем, нужно ли показывать интро и не находимся ли мы на главной странице
      if (shouldShowIntro && !isHomePage && !excludePaths.some(path => pathname.startsWith(path))) {
        setIsRedirecting(true);
        router.replace(homePath);
      }
    }, [shouldShowIntro, isHomePage, pathname, router, homePath]);
    
    // Если происходит перенаправление, можно показать индикатор загрузки или ничего не рендерить
    if (isRedirecting) {
      return null; // или компонент загрузки
    }
    
    // Если интро пройдено или мы на разрешенной странице, рендерим компонент
    return <Component {...props} />;
  };
  
  // Копируем displayName для лучшей отладки
  WithIntroRedirect.displayName = `withIntroRedirect(${Component.displayName || Component.name || 'Component'})`;
  
  return WithIntroRedirect;
} 