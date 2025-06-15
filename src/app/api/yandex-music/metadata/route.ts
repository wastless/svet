import { NextResponse } from "next/server";

interface YandexMusicMetadata {
  artist: string;
  trackName: string;
  coverUrl: string;
  duration?: number;
}

// Функция для извлечения ID трека из URL Яндекс.Музыки
function extractTrackId(url: string): { albumId: string; trackId: string } | null {
  // Поддерживаемые форматы:
  // https://music.yandex.ru/album/1193829/track/10994777
  // https://music.yandex.com/album/1193829/track/10994777
  const trackRegex = /\/album\/(\d+)\/track\/(\d+)/;
  const trackMatch = trackRegex.exec(url);
  
  if (trackMatch?.[1] && trackMatch[2]) {
    return {
      albumId: trackMatch[1],
      trackId: trackMatch[2]
    };
  }
  
  return null;
}

// Функция для получения метаданных через веб-скрапинг
async function fetchTrackMetadata(albumId: string, trackId: string): Promise<YandexMusicMetadata | null> {
  try {
    const url = `https://music.yandex.ru/album/${albumId}/track/${trackId}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'https://music.yandex.ru/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'max-age=0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Яндекс блокирует прямые запросы к страницам. Для решения проблемы нужно настроить прокси-сервер или использовать обходное решение. Пока введите данные вручную.');
      }
      throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Извлекаем данные из HTML
    const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
    const ogImageRegex = /<meta property="og:image" content="([^"]+)"/i;
    const ogTitleRegex = /<meta property="og:title" content="([^"]+)"/i;
    const descriptionRegex = /<meta name="description" content="([^"]+)"/i;
    
    // Дополнительные источники данных
    const h1Regex = /<h1[^>]*class="[^"]*track[^"]*"[^>]*>([^<]+)<\/h1>/i;
    const artistLinkRegex = /<a[^>]*class="[^"]*artist[^"]*"[^>]*>([^<]+)<\/a>/i;
    
    const titleMatch = titleRegex.exec(html);
    const ogImageMatch = ogImageRegex.exec(html);
    const ogTitleMatch = ogTitleRegex.exec(html);
    const descriptionMatch = descriptionRegex.exec(html);
    const h1Match = h1Regex.exec(html);
    const artistLinkMatch = artistLinkRegex.exec(html);
    
    console.log('Debug info:', {
      title: titleMatch?.[1],
      ogTitle: ogTitleMatch?.[1],
      description: descriptionMatch?.[1],
      h1: h1Match?.[1],
      artistLink: artistLinkMatch?.[1]
    });
    
    if (!titleMatch?.[1]) {
      throw new Error('Could not extract track title');
    }
    
    let artist = 'Неизвестный исполнитель';
    let trackName = 'Неизвестный трек';
    
    // Стратегия 1: Парсинг og:title (обычно более точный)
    if (ogTitleMatch?.[1]) {
      const ogTitle = ogTitleMatch[1];
      console.log('Parsing og:title:', ogTitle);
      
      // og:title обычно в формате "Название трека, Исполнитель" или "Исполнитель — Название трека"
      if (ogTitle.includes(' — ')) {
        const parts = ogTitle.split(' — ');
        if (parts.length >= 2 && parts[0] && parts[1]) {
          artist = parts[0].trim();
          trackName = parts[1].trim();
          console.log('Parsed from og:title with —:', { artist, trackName });
        }
      } else if (ogTitle.includes(', ')) {
        const parts = ogTitle.split(', ');
        if (parts.length >= 2 && parts[0] && parts[1]) {
          trackName = parts[0].trim();
          artist = parts[1].trim();
          console.log('Parsed from og:title with ,:', { artist, trackName });
        }
      }
    }
    
    // Стратегия 2: Если og:title не сработал, пробуем title
    if (artist === 'Неизвестный исполнитель' || trackName === 'Неизвестный трек') {
      const fullTitle = titleMatch[1];
      console.log('Parsing title:', fullTitle);
      
      // Убираем стандартные суффиксы Яндекс.Музыки
      const cleanTitle = fullTitle
        .replace(/\s+слушать онлайн на Яндекс Музыке?$/i, '')
        .replace(/\s+—\s+Яндекс Музыка$/i, '')
        .replace(/\s+\|\s+Яндекс Музыка$/i, '')
        .trim();
      
      console.log('Cleaned title:', cleanTitle);
      
      // Новый подход: ищем паттерн "Название ИСПОЛНИТЕЛЬ"
      // где ИСПОЛНИТЕЛЬ написан заглавными буквами или в конце
      const titleArtistRegex = /^(.+?)\s+([А-ЯA-Z][А-ЯA-Z\s]+)$/;
      const titleArtistMatch = titleArtistRegex.exec(cleanTitle);
      if (titleArtistMatch?.[1] && titleArtistMatch[2]) {
        trackName = titleArtistMatch[1].trim();
        artist = titleArtistMatch[2].trim();
        console.log('Parsed with title-artist pattern:', { artist, trackName });
      } else {
        // Пробуем разные разделители
        if (cleanTitle.includes(' — ')) {
          const parts = cleanTitle.split(' — ');
          if (parts.length >= 2 && parts[0] && parts[1]) {
            // Обычно формат: "Название трека — Исполнитель"
            trackName = parts[0].trim();
            artist = parts[1].trim();
            console.log('Parsed from title with —:', { artist, trackName });
          }
        } else if (cleanTitle.includes(' - ')) {
          const parts = cleanTitle.split(' - ');
          if (parts.length >= 2 && parts[0] && parts[1]) {
            trackName = parts[0].trim();
            artist = parts[1].trim();
            console.log('Parsed from title with -:', { artist, trackName });
          }
        } else if (cleanTitle.includes(', ')) {
          const parts = cleanTitle.split(', ');
          if (parts.length >= 2 && parts[0] && parts[1]) {
            trackName = parts[0].trim();
            artist = parts[1].trim();
            console.log('Parsed from title with ,:', { artist, trackName });
          }
        }
      }
    }
    
    // Стратегия 3: Попробуем извлечь из description
    if ((artist === 'Неизвестный исполнитель' || trackName === 'Неизвестный трек') && descriptionMatch?.[1]) {
      const description = descriptionMatch[1];
      console.log('Parsing description:', description);
      
      // description часто содержит "Слушайте «Название трека» от Исполнитель"
      const descRegex1 = /Слушайте\s+[«"']([^«"']+)[«"']\s+от\s+(.+?)(?:\s+в|$)/i;
      const descMatch1 = descRegex1.exec(description);
      if (descMatch1?.[1] && descMatch1[2]) {
        trackName = descMatch1[1].trim();
        artist = descMatch1[2].trim();
        console.log('Parsed from description pattern 1:', { artist, trackName });
      } else {
        // Или "Исполнитель — Название трека"
        const descRegex2 = /^([^—]+)\s+—\s+(.+?)(?:\s+слушать|$)/i;
        const descMatch2 = descRegex2.exec(description);
        if (descMatch2?.[1] && descMatch2[2]) {
          artist = descMatch2[1].trim();
          trackName = descMatch2[2].trim();
          console.log('Parsed from description pattern 2:', { artist, trackName });
        }
      }
    }
    
    // Стратегия 4: Попробуем найти JSON-LD данные
    const jsonLdRegex = /<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/i;
    const jsonLdMatch = jsonLdRegex.exec(html);
    if (jsonLdMatch?.[1] && (artist === 'Неизвестный исполнитель' || trackName === 'Неизвестный трек')) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        console.log('Found JSON-LD:', jsonData);
        
        if (jsonData?.name) {
          trackName = jsonData.name;
        }
        if (jsonData?.byArtist?.name) {
          artist = jsonData.byArtist.name;
        }
        console.log('Parsed from JSON-LD:', { artist, trackName });
      } catch (e) {
        console.log('Failed to parse JSON-LD:', e);
      }
    }
    
    // Финальная очистка
    artist = artist.replace(/\s+слушать.*$/i, '').trim();
    trackName = trackName.replace(/\s+слушать.*$/i, '').trim();
    
    // Если всё ещё не удалось извлечь, используем fallback
    if (artist === 'Неизвестный исполнитель' && trackName === 'Неизвестный трек') {
      const fullTitle = titleMatch[1];
      const cleanTitle = fullTitle
        .replace(/\s+слушать онлайн на Яндекс Музыке?$/i, '')
        .replace(/\s+—\s+Яндекс Музыка$/i, '')
        .trim();
      
      trackName = cleanTitle;
      console.log('Using fallback:', { trackName });
    }
    
    console.log('Final result:', { artist, trackName });
    
    // Получаем URL обложки
    let coverUrl = '/images/default-album-cover.jpg'; // дефолтная обложка
    if (ogImageMatch?.[1]) {
      coverUrl = ogImageMatch[1];
      // Убираем размер из URL обложки и ставим больший размер
      coverUrl = coverUrl.replace(/\/\d+x\d+$/, '/400x400');
    }
    
    return {
      artist,
      trackName,
      coverUrl
    };
    
  } catch (error) {
    console.error('Error fetching track metadata:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Извлекаем ID трека из URL
    const trackIds = extractTrackId(url);
    if (!trackIds) {
      return NextResponse.json(
        { error: 'Неверный формат URL Яндекс.Музыки' },
        { status: 400 }
      );
    }
    
    // Получаем метаданные
    const metadata = await fetchTrackMetadata(trackIds.albumId, trackIds.trackId);
    if (!metadata) {
      return NextResponse.json(
        { error: 'Не удалось получить метаданные трека' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      metadata
    });
    
  } catch (error) {
    console.error('Error in yandex-music metadata API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 