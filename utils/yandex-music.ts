export interface YandexMusicMetadata {
  artist: string;
  trackName: string;
  coverUrl: string;
  duration?: number;
}

export interface YandexMusicResponse {
  success: boolean;
  metadata?: YandexMusicMetadata;
  error?: string;
}

/**
 * Получает метаданные трека из Яндекс.Музыки по URL
 */
export async function fetchYandexMusicMetadata(url: string): Promise<YandexMusicMetadata> {
  try {
    const response = await fetch('/api/yandex-music/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data: YandexMusicResponse = await response.json();
    
    if (data.success && data.metadata) {
      return data.metadata;
    } else {
      throw new Error(data.error || 'Не удалось получить метаданные трека');
    }
  } catch (error) {
    console.error('Error fetching Yandex Music metadata:', error);
    throw error;
  }
}

/**
 * Проверяет, является ли URL ссылкой на Яндекс.Музыку
 */
export function isYandexMusicUrl(url: string): boolean {
  const yandexMusicRegex = /^https?:\/\/(music\.yandex\.(ru|com|by|kz|ua))\/album\/\d+\/track\/\d+/;
  return yandexMusicRegex.test(url);
}

/**
 * Извлекает ID трека и альбома из URL Яндекс.Музыки
 */
export function extractYandexMusicIds(url: string): { albumId: string; trackId: string } | null {
  const match = url.match(/\/album\/(\d+)\/track\/(\d+)/);
  
  if (match && match[1] && match[2]) {
    return {
      albumId: match[1],
      trackId: match[2]
    };
  }
  
  return null;
} 