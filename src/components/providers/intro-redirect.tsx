"use client";

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useIntro } from "../../../utils/hooks/useIntro";

interface IntroRedirectProps {
  children: React.ReactNode;
  excludePaths?: string[];
  homePath?: string;
}

/**
 * Компонент для перенаправления на главную страницу, если интро не пройдено
 */
export function IntroRedirect({ 
  children, 
  excludePaths = [], 
  homePath = '/' 
}: IntroRedirectProps) {
  const { shouldShowIntro } = useIntro();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);
  
  // Проверяем, находимся ли мы на главной странице
  const isHomePage = pathname === homePath;
  
  // Проверяем, находимся ли мы на исключенном пути
  const isExcludedPath = excludePaths.some(path => pathname.startsWith(path));
  
  useEffect(() => {
    // Проверяем, нужно ли показывать интро и не находимся ли мы на главной странице
    // Также проверяем, что редирект еще не был выполнен в этой сессии
    if (shouldShowIntro && !isHomePage && !isExcludedPath && !hasRedirectedRef.current) {
      // Устанавливаем флаг, что редирект уже выполнен
      hasRedirectedRef.current = true;
      
      // Используем replace вместо push, чтобы не добавлять запись в историю браузера
      router.replace(homePath);
    }
  }, [shouldShowIntro, isHomePage, isExcludedPath, router, homePath]);
  
  // Просто рендерим детей, интро будет показано на главной странице
  return <>{children}</>;
} 