import { promises as fs } from 'fs';
import path from 'path';
import { env } from '../../src/env.js';

// Импортируем библиотеку easy-yandex-s3 с использованием динамического импорта
let s3: any;

async function initS3() {
  'use server';
  try {
    // Динамический импорт для поддержки ESM
    const EasyYandexS3 = (await import('easy-yandex-s3')).default;
    
    // Конфигурация для Yandex Object Storage
    s3 = new EasyYandexS3({
      auth: {
        accessKeyId: process.env.YANDEX_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY || '',
      },
      Bucket: process.env.YANDEX_BUCKET_NAME || '',
      debug: process.env.NODE_ENV !== 'production',
    });
    
    return s3;
  } catch (error) {
    console.error('Ошибка инициализации Yandex Object Storage');
    throw error;
  }
}

// Базовый путь для файлов подарков в хранилище
const GIFTS_BASE_PATH = 'gifts';

/**
 * Преобразует имя файла в безопасное имя без кириллицы и специальных символов
 * @param fileName - Исходное имя файла
 * @returns Безопасное имя файла
 */
function getSafeFileName(fileName: string): string {
  // Получаем расширение файла
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  
  // Заменяем кириллицу и специальные символы на латиницу
  const transliterate = (text: string): string => {
    const chars: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
      'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YO', 'Ж': 'ZH',
      'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
      'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'TS',
      'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU',
      'Я': 'YA',
      ' ': '_', '-': '_', '–': '_', '—': '_'
    };
    
    return text.split('').map(char => chars[char] || char).join('');
  };
  
  // Транслитерируем имя файла и заменяем все небезопасные символы на _
  const safeBaseName = transliterate(baseName)
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_'); // Заменяем множественные _ на одиночные
  
  // Добавляем временную метку для уникальности
  const timestamp = Date.now();
  
  return `${safeBaseName}_${timestamp}${ext}`;
}

/**
 * Загружает файл в Yandex Object Storage
 * @param buffer - Буфер с данными файла
 * @param fileName - Имя файла
 * @param giftId - ID подарка
 * @param subfolder - Опциональная подпапка (blocks или undefined)
 * @returns URL загруженного файла
 */
export async function uploadFileToYandexStorage(
  buffer: Buffer,
  fileName: string,
  giftId: string,
  subfolder?: string
): Promise<string> {
  'use server';
  try {
    // Инициализируем S3, если еще не инициализирован
    if (!s3) {
      await initS3();
    }
    
    // Преобразуем имя файла в безопасное
    const safeFileName = getSafeFileName(fileName);
    
    // Формируем имя файла с префиксом ID подарка
    // Если это файл блока, добавляем префикс block_
    const prefix = subfolder === 'blocks' ? 'block_' : '';
    const storageFileName = `${giftId}_${prefix}${safeFileName}`;
    
    // Определяем тип контента на основе расширения файла
    const ext = path.extname(fileName).toLowerCase();
    let contentType: string | undefined;
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.webm':
        contentType = 'video/webm';
        break;
      case '.ogg':
        contentType = 'audio/ogg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      // Можно добавить другие типы по необходимости
    }
    
    // Загружаем файл в хранилище без указания пути
    // Библиотека требует второй аргумент (route), даже если он не используется
    const upload = await s3.Upload({
      buffer,
      name: storageFileName,
      ContentType: contentType // Указываем тип контента, если определен
    }, '');
    
    if (!upload || typeof upload === 'boolean' || !('Location' in upload)) {
      throw new Error('Не удалось загрузить файл в Yandex Object Storage');
    }
    
    return upload.Location as string;
  } catch (error) {
    console.error(`Ошибка загрузки файла ${fileName}:`, error);
    throw error;
  }
}

/**
 * Удаляет файл из Yandex Object Storage
 * @param fileUrl - URL файла для удаления
 * @returns true в случае успеха
 */
export async function deleteFileFromYandexStorage(fileUrl: string): Promise<boolean> {
  'use server';
  try {
    // Инициализируем S3, если еще не инициализирован
    if (!s3) {
      await initS3();
    }
    
    // Извлекаем путь к файлу из URL
    const urlObj = new URL(fileUrl);
    const filePath = urlObj.pathname.startsWith('/') 
      ? urlObj.pathname.substring(1) 
      : urlObj.pathname;
    
    // Удаляем файл
    const result = await s3.Remove(filePath);
    return result === true;
  } catch (error) {
    console.error(`Ошибка удаления файла:`, error);
    return false;
  }
}

/**
 * Удаляет все файлы подарка из Yandex Object Storage
 * @param giftId - ID подарка
 * @returns Количество удаленных файлов
 */
export async function deleteGiftFilesFromYandexStorage(giftId: string): Promise<number> {
  'use server';
  try {
    // Инициализируем S3, если еще не инициализирован
    if (!s3) {
      await initS3();
    }
    
    // Получаем все файлы
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
      // Если другой формат, возвращаем пустой массив
      else {
        console.error('Неизвестный формат ответа от GetList');
        return 0;
      }
    } else {
      console.error('Нет файлов для удаления или ошибка получения списка файлов');
      return 0;
    }
    
    // Фильтруем файлы по ID подарка
    const giftFiles = files.filter((file: { Key: string; Location?: string }) => {
      const key = file.Key;
      // Проверяем разные варианты префикса
      return key.startsWith(`${giftId}_`) || 
             key.startsWith(`/${giftId}_`) || 
             key.includes(`/${giftId}_`);
    });
    
    if (giftFiles.length === 0) {
      return 0;
    }
    
    // Удаляем каждый файл
    let deletedCount = 0;
    
    for (const file of giftFiles) {
      const key = file.Key;
      try {
        const result = await s3.Remove(key);
        
        if (result === true) {
          deletedCount++;
        } else {
          // Пробуем альтернативный метод удаления
          try {
            // Некоторые реализации S3 требуют полный URL вместо ключа
            if (file.Location) {
              const url = file.Location;
              const urlObj = new URL(url);
              const filePath = urlObj.pathname.startsWith('/') 
                ? urlObj.pathname.substring(1) 
                : urlObj.pathname;
              
              const altResult = await s3.Remove(filePath);
              
              if (altResult === true) {
                deletedCount++;
              }
            }
          } catch (altError) {
            console.error(`Ошибка при альтернативном удалении файла:`, altError);
          }
        }
      } catch (error) {
        console.error(`Ошибка удаления файла:`, error);
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`Ошибка удаления файлов подарка ${giftId}:`, error);
    return 0;
  }
}

/**
 * Получает список файлов подарка из Yandex Object Storage
 * @param giftId - ID подарка
 * @param isBlock - Получить только файлы блоков
 * @returns Массив URL файлов
 */
export async function listFilesInYandexStorage(
  giftId: string, 
  isBlock: boolean = false
): Promise<string[]> {
  'use server';
  try {
    // Инициализируем S3, если еще не инициализирован
    if (!s3) {
      await initS3();
    }
    
    // Получаем все файлы
    const response = await s3.GetList('');
    
    // Проверяем структуру ответа
    if (!response || typeof response !== 'object') {
      console.error('Неверный формат ответа от S3 при получении списка файлов');
      return [];
    }
    
    // Получаем массив файлов из ответа
    const files = response.Contents;
    if (!files || !Array.isArray(files)) {
      console.error('Неверный формат поля Contents в ответе от S3');
      return [];
    }
    
    // Фильтруем файлы по ID подарка и типу (блок или нет)
    const prefix = isBlock ? `${giftId}_block_` : `${giftId}_`;
    const excludePrefix = isBlock ? '' : 'block_';
    
    return files
      .filter(file => {
        if (!file || typeof file !== 'object' || !('Key' in file) || !('Location' in file)) {
          return false;
        }
        
        const key = file.Key as string;
        
        // Если это файл блока и мы ищем блоки, или это не файл блока и мы не ищем блоки
        if (isBlock) {
          return key.startsWith(prefix);
        } else {
          return key.startsWith(prefix) && !key.includes(`_${excludePrefix}`);
        }
      })
      .map(file => file.Location as string)
      .filter(Boolean);
  } catch (error) {
    console.error(`Ошибка получения списка файлов:`, error);
    return [];
  }
}

/**
 * Загружает JSON-контент в Yandex Object Storage
 * @param giftId - ID подарка
 * @param content - Контент для загрузки
 * @returns URL загруженного контента
 */
export async function uploadContentToYandexStorage(
  giftId: string,
  content: any
): Promise<string> {
  'use server';
  try {
    // Инициализируем S3, если еще не инициализирован
    if (!s3) {
      await initS3();
    }
    
    // Формируем имя файла
    const contentFileName = `${giftId}_content.json`;
    
    // Преобразуем контент в JSON
    const contentJson = JSON.stringify(content);
    const buffer = Buffer.from(contentJson);
    
    // Загружаем контент в хранилище с несколькими попытками
    let uploadResult: any = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Загружаем контент в хранилище
        uploadResult = await s3.Upload({
          buffer,
          name: contentFileName,
          ContentType: 'application/json',
          // Устанавливаем кеширование на 5 минут для обновлений
          CacheControl: 'max-age=300'
        }, '');
        
        // Проверяем результат загрузки
        if (!uploadResult || typeof uploadResult === 'boolean' || !('Location' in uploadResult)) {
          console.error(`Неверный формат ответа от S3 при загрузке контента`);
          throw new Error('Неверный формат ответа от S3');
        }
        
        // Если дошли сюда, значит загрузка успешна
        break;
      } catch (error) {
        console.error(`Ошибка при попытке ${attempts}/${maxAttempts} загрузки контента:`, error);
        
        // Если это последняя попытка, пробрасываем ошибку дальше
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Иначе делаем паузу перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!uploadResult || !('Location' in uploadResult)) {
      throw new Error('Не удалось загрузить контент после нескольких попыток');
    }
    
    // Проверяем, что контент действительно сохранился
    const exists = await contentExistsInYandexStorage(giftId);
    if (!exists) {
      console.error(`Контент был загружен, но проверка существования не удалась для ${giftId}`);
      throw new Error('Контент был загружен, но проверка существования не удалась');
    }
    
    return uploadResult.Location as string;
  } catch (error) {
    console.error(`Ошибка загрузки контента для подарка ${giftId}:`, error);
    throw error;
  }
}

/**
 * Загружает JSON-контент из Yandex Object Storage
 * @param giftId - ID подарка
 * @returns Контент подарка или null, если контент не найден
 */
export async function loadContentFromYandexStorage(giftId: string): Promise<any | null> {
  'use server';
  try {
    // Проверяем, существует ли контент
    const exists = await contentExistsInYandexStorage(giftId);
    if (!exists) {
      return null;
    }
    
    // Формируем URL для загрузки
    const bucketName = env.YANDEX_BUCKET_NAME || '';
    // Добавляем случайный параметр для обхода кеша сразу в URL
    const timestamp = Date.now();
    const contentUrl = `https://${bucketName}.storage.yandexcloud.net/${giftId}_content.json?_t=${timestamp}`;
    
    // Выполняем загрузку с несколькими попытками
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Добавляем дополнительный случайный параметр для обхода кеша
        const additionalTimestamp = Date.now();
        const urlWithNoCache = `${contentUrl}&_r=${additionalTimestamp}`;
        
        // Устанавливаем таймаут 10 секунд
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(urlWithNoCache, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          signal: controller.signal
        });
        
        // Очищаем таймаут
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки контента: ${response.status} ${response.statusText}`);
        }
        
        const contentData = await response.json();
        return contentData;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Неизвестная ошибка');
        console.error(`Ошибка при попытке ${attempts}/${maxAttempts} загрузки контента:`, error);
        
        // Если это не последняя попытка, делаем паузу перед следующей
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Если дошли сюда, значит все попытки не удались
    console.error(`Не удалось загрузить контент после ${maxAttempts} попыток`);
    return null;
  } catch (error) {
    console.error(`Ошибка загрузки контента для подарка ${giftId}:`, error);
    return null;
  }
}

/**
 * Проверяет существование контента в Yandex Object Storage
 * @param giftId - ID подарка
 * @returns true, если контент существует, иначе false
 */
export async function contentExistsInYandexStorage(giftId: string): Promise<boolean> {
  'use server';
  try {
    // Инициализируем S3, если еще не инициализирован
    if (!s3) {
      await initS3();
    }
    
    // Формируем имя файла
    const contentFileName = `${giftId}_content.json`;
    
    // Выполняем проверку с несколькими попытками
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Проверяем существование файла через получение списка файлов
        const response = await s3.GetList('');
        
        // Проверяем структуру ответа
        if (!response || typeof response !== 'object') {
          console.error('Неверный формат ответа от S3 при получении списка файлов');
          throw new Error('Неверный формат ответа от S3');
        }
        
        // Получаем массив файлов из ответа
        const files = response.Contents;
        if (!files || !Array.isArray(files)) {
          console.error('Неверный формат поля Contents в ответе от S3');
          throw new Error('Неверный формат ответа от S3');
        }
        
        // Ищем наш файл в списке
        const exists = files.some(file => file && typeof file === 'object' && 'Key' in file && file.Key === contentFileName);
        
        return exists;
      } catch (error) {
        console.error(`Ошибка при попытке ${attempts}/${maxAttempts} проверки существования контента:`, error);
        
        // Если это последняя попытка, возвращаем false
        if (attempts >= maxAttempts) {
          return false;
        }
        
        // Иначе делаем паузу перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Ошибка проверки существования контента для подарка ${giftId}:`, error);
    return false;
  }
} 