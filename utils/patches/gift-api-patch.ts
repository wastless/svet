"use client";

// Кеши для разных типов запросов
interface CacheStore {
  [url: string]: {
    data: any;
    timestamp: number;
  };
}

// Интерфейс для элемента кеша в localStorage
interface CacheEntry {
  data: any;
  timestamp: number;
}

// Кеш для разных типов запросов
const apiCache: CacheStore = {};

// Время кеширования для разных типов запросов (в мс)
const CACHE_TTL = {
  GIFT: 10 * 60 * 1000, // 10 минут для данных подарка
  GIFT_CONTENT: 30 * 60 * 1000, // 30 минут для контента подарка
  DEFAULT: 5 * 60 * 1000, // 5 минут по умолчанию
};

// Получаем TTL для URL
function getTTL(url: string): number {
  if (url.includes('/api/gifts/')) {
    return CACHE_TTL.GIFT;
  }
  if (url.includes('/api/gift-content/')) {
    return CACHE_TTL.GIFT_CONTENT;
  }
  return CACHE_TTL.DEFAULT;
}

// Оригинальная функция fetch
const originalFetch = globalThis.fetch;

/**
 * Применяет патч для кеширования запросов к API подарков
 */
export function applyGiftApiPatch() {
  // Не применяем патч, если он уже был применен
  if ((globalThis.fetch as any).__giftPatched) return;
  
  // Загружаем кеш из localStorage при инициализации
  loadCacheFromStorage();
  
  // Создаем новую реализацию fetch
  globalThis.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : String(input);
    const method = init?.method || 'GET';
    
    // Кешируем только GET-запросы к нашему API
    if (method === 'GET' && (
        url.includes('/api/gifts') || 
        url.includes('/api/gift-content')
    )) {
      console.log('🎁 Intercepting gift API request:', url);
      
      // Проверяем наличие данных в кеше
      if (apiCache[url]) {
        const { data, timestamp } = apiCache[url];
        const ttl = getTTL(url);
        
        // Проверяем, не устарел ли кеш
        if (Date.now() - timestamp < ttl) {
          console.log('🟢 Returning cached gift data');
          return new Response(JSON.stringify(data), {
            status: 200,
            statusText: "OK",
            headers: new Headers({
              'Content-Type': 'application/json',
            }),
          });
        } else {
          console.log('🟠 Cache expired, fetching fresh data');
        }
      }
      
      // Делаем реальный запрос
      console.log('🔵 Making real gift API request');
      const response = await originalFetch(input, init);
      
      // Если запрос успешен, кешируем результат
      if (response.ok) {
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          
          // Сохраняем в кеш
          apiCache[url] = {
            data,
            timestamp: Date.now(),
          };
          
          // Сохраняем в localStorage
          saveCacheToStorage();
          
          console.log('💾 Gift data cached');
        } catch (e) {
          console.error('Error caching gift data:', e);
        }
      }
      
      return response;
    }
    
    // Для всех остальных запросов используем оригинальный fetch
    return originalFetch(input, init);
  };
  
  // Помечаем, что патч был применен
  (globalThis.fetch as any).__giftPatched = true;
  
  console.log('✅ Gift API patch applied');
  
  // Регистрируем обработчик события beforeunload для сохранения кеша перед закрытием страницы
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => saveCacheToStorage());
  }
}

/**
 * Сохраняет кеш в localStorage
 */
function saveCacheToStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    // Сохраняем только данные и метки времени
    const simplifiedCache: Record<string, CacheEntry> = {};
    
    // Ограничиваем размер кеша
    const keys = Object.keys(apiCache);
    if (keys.length > 20) {
      // Если в кеше больше 20 записей, оставляем только 10 самых свежих
      const sortedKeys = keys.sort((a, b) => {
        const cacheA = apiCache[a];
        const cacheB = apiCache[b];
        return cacheB?.timestamp ?? 0 - (cacheA?.timestamp ?? 0);
      });
      const keysToKeep = sortedKeys.slice(0, 10);
      
      for (const key of keysToKeep) {
        // Добавляем в упрощенный кеш только существующие записи
        if (apiCache[key]) {
          simplifiedCache[key] = apiCache[key];
        }
      }
    } else {
      // Если кеш небольшой, копируем все элементы по одному
      for (const key of keys) {
        if (apiCache[key]) {
          simplifiedCache[key] = apiCache[key];
        }
      }
    }
    
    localStorage.setItem('gift_api_cache', JSON.stringify(simplifiedCache));
  } catch (e) {
    console.error('Error saving gift cache to localStorage:', e);
  }
}

/**
 * Загружает кеш из localStorage
 */
function loadCacheFromStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    const savedCache = localStorage.getItem('gift_api_cache');
    if (savedCache) {
      // Используем any для parsed, так как мы потом проверяем тип
      const parsed = JSON.parse(savedCache) as Record<string, unknown>;
      
      // Проверяем каждую запись на актуальность
      for (const [url, entry] of Object.entries(parsed)) {
        const ttl = getTTL(url);
        
        // Проверяем, что у объекта есть необходимые поля
        if (entry && typeof entry === 'object' && 'data' in entry && 'timestamp' in entry) {
          const typedEntry = entry as CacheEntry;
          
          // Если кеш не устарел, добавляем его
          if (Date.now() - typedEntry.timestamp < ttl) {
            apiCache[url] = { 
              data: typedEntry.data, 
              timestamp: typedEntry.timestamp 
            };
          }
        }
      }
      
      console.log(`🔄 Loaded ${Object.keys(apiCache).length} gift cache entries from storage`);
    }
  } catch (e) {
    console.error('Error loading gift cache from localStorage:', e);
  }
}

/**
 * Очищает кеш для подарков и их контента
 */
export function invalidateGiftCache(giftId?: string) {
  if (giftId) {
    // Если указан ID подарка, очищаем только его
    const keysToDelete = Object.keys(apiCache).filter(url => 
      url.includes(`/api/gifts/${giftId}`) || url.includes(`/api/gift-content/${giftId}`)
    );
    
    keysToDelete.forEach(key => delete apiCache[key]);
    console.log(`🗑️ Invalidated cache for gift ${giftId}`);
  } else {
    // Иначе очищаем весь кеш
    Object.keys(apiCache).forEach(key => delete apiCache[key]);
    console.log('🗑️ Entire gift cache invalidated');
  }
  
  // Сохраняем изменения в localStorage
  saveCacheToStorage();
} 