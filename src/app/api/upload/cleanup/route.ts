import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "../../../../env.js";
import { listFilesInYandexStorage, deleteFileFromYandexStorage } from "@/utils/lib/yandexStorage";

// Функция для получения всех URL из контента подарка
function extractUrlsFromContent(content: any): string[] {
  const urls: string[] = [];
  
  // Если контент - это массив блоков
  if (content && Array.isArray(content.blocks)) {
    for (const block of content.blocks) {
      // Извлекаем URL из разных типов блоков
      if (block.url) urls.push(block.url);
      if (block.coverUrl) urls.push(block.coverUrl);
      
      // Для блоков с несколькими изображениями
      if (block.images && Array.isArray(block.images)) {
        for (const image of block.images) {
          if (image.url) urls.push(image.url);
        }
      }
      
      // Для галерейных блоков
      if (block.gallery && Array.isArray(block.gallery)) {
        for (const image of block.gallery) {
          if (image.url) urls.push(image.url);
        }
      }
    }
  }
  
  return urls;
}

// Функция для проверки, используется ли URL в подарках
async function isUrlUsedInGifts(url: string, gifts: any[]): Promise<boolean> {
  for (const gift of gifts) {
    // Проверяем основные поля подарка
    if (gift.hintImageUrl === url) return true;
    if (gift.imageCover === url) return true;
    
    // Проверяем фото воспоминания
    if (gift.memoryPhoto && gift.memoryPhoto.photoUrl === url) return true;
    
    // Если у подарка есть contentUrl, загружаем и проверяем его содержимое
    if (gift.contentUrl) {
      try {
        const response = await fetch(gift.contentUrl);
        if (response.ok) {
          const content = await response.json();
          const contentUrls = extractUrlsFromContent(content);
          if (contentUrls.includes(url)) return true;
        }
      } catch (error) {
        console.error(`Ошибка при загрузке контента для подарка ${gift.id}:`, error);
      }
    }
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем, настроены ли ключи для Yandex Object Storage
    if (!env.YANDEX_ACCESS_KEY_ID || !env.YANDEX_SECRET_ACCESS_KEY || !env.YANDEX_BUCKET_NAME) {
      return NextResponse.json(
        { error: "Yandex Object Storage is not configured" },
        { status: 500 }
      );
    }
    
    // Получаем все подарки из базы данных
    const gifts = await db.gift.findMany({
      include: {
        memoryPhoto: true,
      },
    });
    
    // Получаем все файлы из хранилища
    const allFiles: string[] = [];
    for (const gift of gifts) {
      const giftFiles = await listFilesInYandexStorage(gift.id);
      const blockFiles = await listFilesInYandexStorage(gift.id, true);
      allFiles.push(...giftFiles, ...blockFiles);
    }
    
    // Фильтруем файлы, которые не используются в подарках
    const unusedFiles: string[] = [];
    for (const fileUrl of allFiles) {
      const isUsed = await isUrlUsedInGifts(fileUrl, gifts);
      if (!isUsed) {
        unusedFiles.push(fileUrl);
      }
    }
    
    // Удаляем неиспользуемые файлы
    const deletionResults = [];
    for (const fileUrl of unusedFiles) {
      try {
        const result = await deleteFileFromYandexStorage(fileUrl);
        deletionResults.push({
          url: fileUrl,
          deleted: result,
        });
      } catch (error) {
        deletionResults.push({
          url: fileUrl,
          deleted: false,
          error: (error as Error).message,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      totalFiles: allFiles.length,
      unusedFiles: unusedFiles.length,
      deletedFiles: deletionResults.filter(r => r.deleted).length,
      results: deletionResults,
    });
  } catch (error) {
    console.error("Error cleaning up files:", error);
    return NextResponse.json(
      { error: "Failed to clean up files", details: (error as Error).message },
      { status: 500 }
    );
  }
} 