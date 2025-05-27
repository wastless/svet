import { NextRequest, NextResponse } from "next/server";

// Функция для извлечения ID трека из URL Яндекс.Музыки
function extractTrackId(url: string): { albumId: string; trackId: string } | null {
  const trackMatch = url.match(/\/album\/(\d+)\/track\/(\d+)/);
  
  if (trackMatch && trackMatch[1] && trackMatch[2]) {
    return {
      albumId: trackMatch[1],
      trackId: trackMatch[2]
    };
  }
  
  return null;
}

export async function POST(request: NextRequest) {
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
        { error: 'Invalid Yandex Music URL format' },
        { status: 400 }
      );
    }
    
    const yandexUrl = `https://music.yandex.ru/album/${trackIds.albumId}/track/${trackIds.trackId}`;
    
    const response = await fetch(yandexUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Извлекаем все возможные данные
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
    const descriptionMatch = html.match(/<meta name="description" content="([^"]+)"/i);
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    const jsonLdMatches = html.match(/<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi);
    
    // Ищем все возможные элементы с классами, содержащими "track" или "artist"
    const trackElements = html.match(/<[^>]*class="[^"]*track[^"]*"[^>]*>([^<]*)<\/[^>]*>/gi);
    const artistElements = html.match(/<[^>]*class="[^"]*artist[^"]*"[^>]*>([^<]*)<\/[^>]*>/gi);
    
    return NextResponse.json({
      success: true,
      debug: {
        url: yandexUrl,
        title: titleMatch?.[1] || null,
        ogTitle: ogTitleMatch?.[1] || null,
        description: descriptionMatch?.[1] || null,
        ogImage: ogImageMatch?.[1] || null,
        h1Elements: h1Matches || [],
        trackElements: trackElements || [],
        artistElements: artistElements || [],
        jsonLdElements: jsonLdMatches || [],
        // Первые 1000 символов HTML для анализа
        htmlSample: html.substring(0, 1000)
      }
    });
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 