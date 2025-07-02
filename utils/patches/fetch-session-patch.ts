"use client";

// Храним промис последнего запроса к сессии
let pendingSessionRequest: Promise<Response> | null = null;
let lastSessionData: any = null;
const originalFetch = globalThis.fetch;

/**
 * Патч для перехвата запросов к сессии.
 * Все запросы к /api/auth/session будут возвращать кешированный ответ.
 */
export function applySessionFetchPatch() {
  // Не применяем патч, если он уже был применен
  if ((globalThis.fetch as any).__patched) return;
  
  // Создаем новую реализацию fetch
  globalThis.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : String(input);
    
    // Если это запрос к сессии
    if (url.includes('/api/auth/session')) {
      
      // Если уже есть выполняющийся запрос, возвращаем его результат
      if (pendingSessionRequest) {
        const response = await pendingSessionRequest;
        
        // Клонируем ответ, так как Response можно использовать только один раз
        return new Response(JSON.stringify(lastSessionData), {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers),
        });
      }
      
      // Если есть кешированные данные, возвращаем их
      if (lastSessionData) {
        return new Response(JSON.stringify(lastSessionData), {
          status: 200,
          statusText: "OK",
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        });
      }
      
      // Создаем промис для запроса
      pendingSessionRequest = originalFetch(input, init).then(async (response) => {
        // Сохраняем результат запроса
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          lastSessionData = data;
        } catch (e) {
          console.error('Error parsing session response:', e);
        }
        
        // Возвращаем оригинальный ответ
        return response;
      }).finally(() => {
        // Очищаем ссылку на текущий запрос
        pendingSessionRequest = null;
      });
      
      // Дожидаемся выполнения запроса и возвращаем ответ
      const response = await pendingSessionRequest;
      
      // Клонируем ответ для возврата
      return new Response(JSON.stringify(lastSessionData), {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
    }
    
    // Для всех остальных запросов используем оригинальный fetch
    return originalFetch(input, init);
  };
  
  // Помечаем, что патч был применен
  (globalThis.fetch as any).__patched = true;
}

/**
 * Очищает кеш сессии, чтобы следующий запрос получил свежие данные
 */
export function invalidateSessionCache() {
  pendingSessionRequest = null;
  lastSessionData = null;
} 