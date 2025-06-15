"use client";

// ==================== ОБЩАЯ ЧАСТЬ ====================

// Оригинальная функция fetch
const originalFetch = globalThis.fetch;

// Типы для кеша
interface CacheEntry {
  data: any;
  timestamp: number;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Кеш запросов
const requestCache: Record<string, CacheEntry> = {};

// Текущие запросы
const pendingRequests: Record<string, Promise<Response>> = {};

// ==================== НАСТРОЙКИ КЕШИРОВАНИЯ ====================

// Настройки кеширования для разных типов запросов (в мс)
const CACHE_TTL = {
  SESSION: 30 * 60 * 1000, // 30 минут для сессии
  GIFT: 10 * 60 * 1000, // 10 минут для данных подарка
  GIFT_CONTENT: 30 * 60 * 1000, // 30 минут для контента подарка
  DEFAULT: 5 * 60 * 1000, // 5 минут по умолчанию
};

// Получаем кеш ключ для URL
function getCacheKey(url: string, init?: RequestInit): string {
  // Добавляем в ключ заголовки Authorization, если они есть
  let authHeader: string | null = null;
  
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      authHeader = init.headers.get('Authorization');
    } else if (typeof init.headers === 'object') {
      const headers = init.headers as Record<string, string>;
      authHeader = headers['Authorization'] || null;
    }
  }
  
  return authHeader ? `${url}|${authHeader}` : url;
}

// Определяем TTL для URL
function getTTL(url: string): number {
  if (!url) return CACHE_TTL.DEFAULT;
  
  if (url.includes('/api/auth/session')) {
    return CACHE_TTL.SESSION;
  }
  if (url.includes('/api/gifts/')) {
    return CACHE_TTL.GIFT;
  }
  if (url.includes('/api/gift-content/')) {
    return CACHE_TTL.GIFT_CONTENT;
  }
  return CACHE_TTL.DEFAULT;
}

// Проверяем, должен ли URL кешироваться
function shouldCacheUrl(url: string, method: string): boolean {
  if (method !== 'GET') return false;
  
  // В продакшн режиме отключаем кэширование сессии
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return false;
  }
  
  // Кешируем только сессию, но не запросы к подаркам
  return url.includes('/api/auth/session');
  
  // Отключаем кеширование для подарков
  // url.includes('/api/gifts') || 
  // url.includes('/api/gift-content')
}

// Для отладки
let requestId = 0;

// Извлекаем URL из ключа кеша
function getUrlFromCacheKey(cacheKey: string): string {
  const parts = cacheKey.split('|');
  return parts[0] || '';
}

// ==================== ПАТЧ ДЛЯ FETCH ====================

/**
 * Применяет единый патч для fetch с кешированием всех запросов к API
 */
export function applyUnifiedFetchPatch() {
  // Не применяем патч, если он уже был применен
  if ((globalThis.fetch as any).__patchedUnified) return;
  
  // Очищаем кеш подарков при инициализации
  invalidateGiftCache();
  
  // Загружаем кеш из localStorage при инициализации
  loadCacheFromStorage();
  
  // Создаем новую реализацию fetch
  globalThis.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : String(input);
    const method = init?.method || 'GET';
    const id = ++requestId;
    
    // Получаем ключ для кеширования
    const cacheKey = getCacheKey(url, init);
    
    // Если это не запрос к нашему API, просто вызываем оригинальный fetch
    if (!shouldCacheUrl(url, method)) {
      return originalFetch(input, init);
    }
    
    // Логируем запрос
    console.log(`🔍[${id}] Intercepting API request: ${method} ${url}`);
    
    // Проверяем наличие данных в кеше
    if (requestCache[cacheKey]) {
      const entry = requestCache[cacheKey];
      const ttl = getTTL(url);
      
      // Проверяем, не устарел ли кеш
      if (Date.now() - entry.timestamp < ttl) {
        console.log(`🟢[${id}] Returning cached data for:`, url);
        
        // Возвращаем кешированный ответ
        return new Response(JSON.stringify(entry.data), {
          status: entry.status,
          statusText: entry.statusText,
          headers: new Headers(entry.headers),
        });
      } else {
        console.log(`🟠[${id}] Cache expired for:`, url);
      }
    }
    
    // Проверяем, есть ли уже выполняющийся запрос к этому URL
    if (pendingRequests[cacheKey]) {
      console.log(`🟣[${id}] Reusing pending request for:`, url);
      
      try {
        // Ожидаем выполнения запроса
        await pendingRequests[cacheKey];
        
        // Проверяем, что в кеше есть данные (они должны быть сохранены после выполнения запроса)
        if (requestCache[cacheKey]) {
          const entry = requestCache[cacheKey];
          
          console.log(`🟣[${id}] Using cached result from pending request for:`, url);
          
          // Клонируем ответ, так как Response можно использовать только один раз
          return new Response(JSON.stringify(entry.data), {
            status: entry.status,
            statusText: entry.statusText,
            headers: new Headers(entry.headers),
          });
        }
      } catch (e) {
        console.error(`⚠️[${id}] Error waiting for pending request:`, e);
      }
      
      // Если что-то пошло не так и данных в кеше нет, выполняем запрос заново
      console.log(`⚠️[${id}] Cache missing after pending request, retrying:`, url);
    }
    
    // Создаем новый запрос и сохраняем его промис
    console.log(`🔵[${id}] Making real request to:`, url);
    
    try {
      // Создаем промис запроса
      pendingRequests[cacheKey] = originalFetch(input, init);
      
      // Ожидаем ответ
      const response = await pendingRequests[cacheKey];
      
      // Если запрос успешен, кешируем результат
      if (response.ok) {
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          
          // Получаем заголовки
          const headers: Record<string, string> = {};
          clonedResponse.headers.forEach((value, key) => {
            headers[key] = value;
          });
          
          // Сохраняем в кеш
          requestCache[cacheKey] = {
            data,
            timestamp: Date.now(),
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers
          };
          
          // Сохраняем в localStorage
          saveCacheToStorage();
          
          console.log(`💾[${id}] Data cached for:`, url);
        } catch (e) {
          console.error(`⚠️[${id}] Error caching response:`, e);
        }
      }
      
      return response;
    } finally {
      // Удаляем запрос из списка ожидающих, когда он завершен
      delete pendingRequests[cacheKey];
    }
  };
  
  // Помечаем, что патч был применен
  (globalThis.fetch as any).__patchedUnified = true;
  
  console.log('✅ Unified fetch patch applied');
  
  // Регистрируем обработчик события beforeunload для сохранения кеша перед закрытием страницы
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => saveCacheToStorage());
  }
}

// ==================== РАБОТА С ХРАНИЛИЩЕМ ====================

/**
 * Сохраняет кеш в localStorage
 */
function saveCacheToStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    // Ограничиваем размер кеша
    const keys = Object.keys(requestCache);
    let cacheToSave = { ...requestCache };
    
    if (keys.length > 50) {
      // Если кеш слишком большой, оставляем только 20 самых свежих записей
      const freshKeys = keys
        .sort((a, b) => {
          // Безопасная сортировка с проверкой на undefined
          const timestampA = requestCache[a]?.timestamp || 0;
          const timestampB = requestCache[b]?.timestamp || 0;
          return timestampB - timestampA;
        })
        .slice(0, 20);
      
      cacheToSave = {};
      for (const key of freshKeys) {
        if (requestCache[key]) {
          cacheToSave[key] = requestCache[key];
        }
      }
    }
    
    localStorage.setItem('api_request_cache', JSON.stringify(cacheToSave));
    console.log(`💾 Saved ${Object.keys(cacheToSave).length} entries to localStorage`);
  } catch (e) {
    console.error('Error saving cache to localStorage:', e);
  }
}

/**
 * Загружает кеш из localStorage
 */
function loadCacheFromStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    const savedCache = localStorage.getItem('api_request_cache');
    if (savedCache) {
      const parsed = JSON.parse(savedCache) as Record<string, unknown>;
      
      // Проверяем каждую запись
      for (const [cacheKey, entry] of Object.entries(parsed)) {
        if (
          entry && 
          typeof entry === 'object' && 
          'data' in entry && 
          'timestamp' in entry &&
          'status' in entry &&
          'statusText' in entry &&
          'headers' in entry
        ) {
          const typedEntry = entry as CacheEntry;
          // Извлекаем URL из ключа кеша
          const url = getUrlFromCacheKey(cacheKey);
          const ttl = getTTL(url);
          
          // Добавляем в кеш только актуальные записи
          if (Date.now() - typedEntry.timestamp < ttl) {
            requestCache[cacheKey] = typedEntry;
          }
        }
      }
      
      console.log(`🔄 Loaded ${Object.keys(requestCache).length} entries from localStorage`);
    }
  } catch (e) {
    console.error('Error loading cache from localStorage:', e);
  }
}

// ==================== УТИЛИТЫ ДЛЯ РАБОТЫ С КЕШЕМ ====================

/**
 * Очищает весь кеш
 */
export function invalidateAllCache() {
  Object.keys(requestCache).forEach(key => delete requestCache[key]);
  localStorage.removeItem('api_request_cache');
  console.log('🗑️ Entire cache invalidated');
}

/**
 * Инвалидирует кеш сессии
 */
export function invalidateSessionCache() {
  if (typeof window === 'undefined') return;
  
  console.log('🔄 Invalidating session cache');
  
  // Удаляем все записи с URL, содержащим /api/auth/session
  Object.keys(requestCache).forEach(key => {
    if (key.includes('/api/auth/session')) {
      delete requestCache[key];
    }
  });
  
  // Удаляем сохраненную сессию из localStorage
  try {
    localStorage.removeItem('auth_session_cache');
  } catch (e) {
    console.error('Error removing session from localStorage:', e);
  }
  
  // Удаляем все cookie связанные с авторизацией
  if (typeof document !== 'undefined') {
    document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = '__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
  }
}

/**
 * Очищает кеш для подарков
 */
export function invalidateGiftCache(giftId?: string) {
  if (giftId) {
    // Если указан ID подарка, очищаем только его
    const keysToDelete = Object.keys(requestCache).filter(key => {
      const url = getUrlFromCacheKey(key);
      return url.includes(`/api/gifts/${giftId}`) || url.includes(`/api/gift-content/${giftId}`);
    });
    
    keysToDelete.forEach(key => delete requestCache[key]);
    console.log(`🗑️ Invalidated cache for gift ${giftId}`);
    
    // Принудительно очищаем localStorage для этого подарка
    try {
      const savedCache = localStorage.getItem('api_request_cache');
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        let changed = false;
        
        Object.keys(parsed).forEach(key => {
          const url = getUrlFromCacheKey(key);
          if (url.includes(`/api/gifts/${giftId}`) || url.includes(`/api/gift-content/${giftId}`)) {
            delete parsed[key];
            changed = true;
          }
        });
        
        if (changed) {
          localStorage.setItem('api_request_cache', JSON.stringify(parsed));
          console.log(`🗑️ LocalStorage cache cleared for gift ${giftId}`);
        }
      }
    } catch (e) {
      console.error('Error clearing localStorage cache:', e);
    }
  } else {
    // Иначе очищаем весь кеш подарков
    const keysToDelete = Object.keys(requestCache).filter(key => {
      const url = getUrlFromCacheKey(key);
      return url.includes('/api/gifts') || url.includes('/api/gift-content');
    });
    
    keysToDelete.forEach(key => delete requestCache[key]);
    console.log('🗑️ Gift cache invalidated');
    
    // Принудительно очищаем localStorage для всех подарков
    try {
      const savedCache = localStorage.getItem('api_request_cache');
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        let changed = false;
        
        Object.keys(parsed).forEach(key => {
          const url = getUrlFromCacheKey(key);
          if (url.includes('/api/gifts') || url.includes('/api/gift-content')) {
            delete parsed[key];
            changed = true;
          }
        });
        
        if (changed) {
          localStorage.setItem('api_request_cache', JSON.stringify(parsed));
          console.log('🗑️ LocalStorage cache cleared for all gifts');
        }
      }
    } catch (e) {
      console.error('Error clearing localStorage cache:', e);
    }
  }
  
  saveCacheToStorage();
} 