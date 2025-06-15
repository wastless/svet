"use client";

/**
 * Полностью очищает весь кеш сессии в localStorage и других хранилищах
 */
export function clearAllSessionCache() {
  if (typeof window === 'undefined') return;
  
  // Очищаем кеш в localStorage
  try {
    localStorage.removeItem('auth_session_cache');
  } catch (e) {
    console.error('Ошибка при очистке кеша сессии в localStorage:', e);
  }
  
  // Очищаем кеши в sessionStorage
  try {
    sessionStorage.removeItem('next-auth.session-token');
    sessionStorage.removeItem('next-auth.callback-url');
    sessionStorage.removeItem('next-auth.csrf-token');
  } catch (e) {
    console.error('Ошибка при очистке кеша сессии в sessionStorage:', e);
  }
  
  // Очищаем куки для Next Auth
  document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = '__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  console.log('🧹 Весь кеш сессии очищен');
} 