import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "../../../../env.js";
import { deleteFileFromYandexStorage } from "@/utils/lib/yandexStorage";

// Функция для получения всех файлов из бакета
async function getAllFilesFromStorage(): Promise<Array<{url: string, key: string}>> {
  try {
    // Инициализируем S3, если еще не инициализирован
    const { default: EasyYandexS3 } = await import('easy-yandex-s3');
    
    const s3 = new EasyYandexS3({
      auth: {
        accessKeyId: env.YANDEX_ACCESS_KEY_ID || '',
        secretAccessKey: env.YANDEX_SECRET_ACCESS_KEY || '',
      },
      Bucket: env.YANDEX_BUCKET_NAME || '',
      debug: process.env.NODE_ENV !== 'production',
    });
    
    // Получаем все файлы из бакета
    const response = await s3.GetList('');
    
    // Проверяем структуру ответа
    let files: Array<{ Key: string; Location?: string }> = [];
    
    if (response && typeof response === 'object') {
      // Проверяем формат ответа AWS SDK v2
      if ('Contents' in response && Array.isArray(response.Contents)) {
        files = response.Contents.map((item: any) => {
          const bucketName = env.YANDEX_BUCKET_NAME || '';
          return {
            Key: item.Key,
            Location: `https://${bucketName}.storage.yandexcloud.net/${item.Key}`
          };
        });
      } 
      // Если это массив, используем его напрямую
      else if (Array.isArray(response)) {
        files = response;
      }
    }
    
    // Возвращаем объекты с URL и ключом файла
    return files
      .filter(file => file && typeof file === 'object' && 'Key' in file && 'Location' in file)
      .map(file => ({
        url: file.Location as string,
        key: file.Key as string
      }))
      .filter(item => Boolean(item.url) && Boolean(item.key));
  } catch (error) {
    console.error('Ошибка при получении всех файлов из бакета:', error);
    return [];
  }
}

// Функция для загрузки JSON-контента по URL
async function loadJsonContent(url: string): Promise<any | null> {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Ошибка при загрузке JSON-контента по URL ${url}:`, error);
    return null;
  }
}

// Функция для извлечения всех URL из объекта контента (рекурсивно)
function extractAllUrlsFromObject(obj: any): string[] {
  const urls: string[] = [];
  
  // Если obj не объект или null, возвращаем пустой массив
  if (!obj || typeof obj !== 'object') {
    return urls;
  }
  
  // Если obj - массив, обрабатываем каждый элемент
  if (Array.isArray(obj)) {
    for (const item of obj) {
      urls.push(...extractAllUrlsFromObject(item));
    }
    return urls;
  }
  
  // Обрабатываем каждое свойство объекта
  for (const key in obj) {
    const value = obj[key];
    
    // Если значение - строка и похоже на URL
    if (typeof value === 'string' && 
        (value.startsWith('http') || value.includes('.jpg') || value.includes('.png') || 
         value.includes('.jpeg') || value.includes('.gif') || value.includes('.mp3') || 
         value.includes('.mp4') || value.includes('.webm') || value.includes('.ogg') || 
         value.includes('.wav'))) {
      urls.push(value);
    }
    // Если значение - объект или массив, рекурсивно извлекаем URL
    else if (value && typeof value === 'object') {
      urls.push(...extractAllUrlsFromObject(value));
    }
  }
  
  return urls;
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
    
    console.log(`Найдено ${gifts.length} подарков в базе данных`);
    
    // Получаем все файлы из хранилища
    const allFiles = await getAllFilesFromStorage();
    console.log(`Найдено ${allFiles.length} файлов в бакете`);
    
    // Группируем файлы по ID подарка
    const filesByGiftId: Record<string, Array<{url: string, key: string}>> = {};
    
    for (const file of allFiles) {
      // Извлекаем ID подарка из имени файла
      const match = file.key.match(/^([a-z0-9-]+)_/);
      if (match && match[1]) {
        const giftId = match[1];
        
        if (!filesByGiftId[giftId]) {
          filesByGiftId[giftId] = [];
        }
        
        filesByGiftId[giftId].push(file);
      }
    }
    
    console.log(`Файлы сгруппированы по ${Object.keys(filesByGiftId).length} ID подарков`);
    
    // Определяем, какие ID подарков существуют в базе данных
    const existingGiftIds = new Set(gifts.map(gift => gift.id));
    
    // Собираем файлы для удаления (из несуществующих подарков)
    const filesToDelete: Array<{url: string, key: string}> = [];
    
    // Обрабатываем каждую группу файлов
    for (const [giftId, files] of Object.entries(filesByGiftId)) {
      // Если подарка нет в базе данных, все его файлы можно удалить
      if (!existingGiftIds.has(giftId)) {
        console.log(`Подарок ${giftId} не найден в базе данных, удаляем все его файлы (${files.length})`);
        filesToDelete.push(...files);
        continue;
      }
      
      // Если подарок существует, ищем его JSON-контент
      const contentJsonFile = files.find(file => file.key.endsWith('_content.json'));
      
      // Если JSON-контент не найден, пропускаем (это странная ситуация)
      if (!contentJsonFile) {
        console.log(`Для подарка ${giftId} не найден файл контента, пропускаем`);
        continue;
      }
      
      // Загружаем контент из JSON-файла
      const content = await loadJsonContent(contentJsonFile.url);
      
      if (!content) {
        console.log(`Не удалось загрузить контент для подарка ${giftId}, пропускаем`);
        continue;
      }
      
      // Извлекаем все URL из контента
      const urlsFromContent = extractAllUrlsFromObject(content);
      console.log(`Извлечено ${urlsFromContent.length} URL из контента подарка ${giftId}`);
      
      // Создаем множество ключей файлов, которые нужно сохранить
      const keysToKeep = new Set<string>();
      
      // Добавляем ключ самого JSON-файла
      keysToKeep.add(contentJsonFile.key);
      
      // Обрабатываем каждый URL из контента
      for (const url of urlsFromContent) {
        // Находим файл, соответствующий этому URL
        for (const file of files) {
          // Проверяем, содержит ли URL имя файла
          const filename = file.key.split('/').pop() || '';
          
          if (url.includes(filename)) {
            keysToKeep.add(file.key);
            console.log(`Сохраняем файл ${file.key} (найден в контенте)`);
            break;
          }
        }
      }
      
      // Находим файлы этого подарка, которые не используются в контенте
      const unusedFiles = files.filter(file => !keysToKeep.has(file.key));
      
      if (unusedFiles.length > 0) {
        console.log(`Для подарка ${giftId} найдено ${unusedFiles.length} неиспользуемых файлов`);
        filesToDelete.push(...unusedFiles);
      }
    }
    
    console.log(`Всего файлов для удаления: ${filesToDelete.length}`);
    
    // Удаляем неиспользуемые файлы
    const deletionResults = [];
    for (const file of filesToDelete) {
      try {
        console.log(`Удаление файла: ${file.key}`);
        const result = await deleteFileFromYandexStorage(file.url);
        deletionResults.push({
          url: file.url,
          key: file.key,
          deleted: result,
        });
      } catch (error) {
        deletionResults.push({
          url: file.url,
          key: file.key,
          deleted: false,
          error: (error as Error).message,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      totalFiles: allFiles.length,
      filesForDeletion: filesToDelete.length,
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