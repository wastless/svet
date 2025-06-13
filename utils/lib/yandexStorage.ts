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
    console.error('Ошибка инициализации Yandex Object Storage:', error);
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
    
    console.log(`Загрузка файла в Yandex Object Storage: ${storageFileName}`);
    
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
    console.error(`Ошибка загрузки файла ${fileName} в Yandex Object Storage:`, error);
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
    console.error(`Ошибка удаления файла из Yandex Object Storage:`, error);
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
      console.log(`Инициализация S3 для удаления файлов подарка ${giftId}...`);
      await initS3();
    }
    
    console.log(`Удаление файлов подарка ${giftId} из Yandex Object Storage...`);
    
    // Получаем все файлы
    console.log('Получаем список всех файлов из бакета...');
    const response = await s3.GetList('');
    
    console.log('Ответ от API:', response);
    
    // Проверяем структуру ответа
    let files: Array<{ Key: string; Location?: string }> = [];
    
    if (response && typeof response === 'object') {
      // Проверяем формат ответа AWS SDK v2
      if ('Contents' in response && Array.isArray(response.Contents)) {
        console.log(`Получен ответ в формате AWS SDK v2 с ${response.Contents.length} файлами`);
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
        console.log(`Получен массив с ${response.length} файлами`);
        files = response;
      } 
      // Если другой формат, логируем и возвращаем пустой массив
      else {
        console.log('Неизвестный формат ответа от GetList:', response);
        return 0;
      }
    } else {
      console.log('Нет файлов для удаления или ошибка получения списка файлов');
      return 0;
    }
    
    console.log(`Обработано ${files.length} файлов из бакета`);
    
    // Выводим все ключи файлов для отладки
    console.log('Все файлы в бакете:');
    files.forEach((file: { Key: string; Location?: string }, index: number) => {
      console.log(`${index + 1}. ${file.Key}`);
    });
    
    // Фильтруем файлы по ID подарка
    const giftFiles = files.filter((file: { Key: string; Location?: string }) => {
      const key = file.Key;
      // Проверяем разные варианты префикса
      const isGiftFile = 
        key.startsWith(`${giftId}_`) || 
        key.startsWith(`/${giftId}_`) || 
        key.includes(`/${giftId}_`);
      
      if (isGiftFile) {
        console.log(`Найден файл подарка: ${key}`);
      }
      
      return isGiftFile;
    });
    
    console.log(`Найдено ${giftFiles.length} файлов для удаления`);
    
    if (giftFiles.length === 0) {
      console.log(`Не найдено файлов для подарка ${giftId}`);
      return 0;
    }
    
    // Удаляем каждый файл
    let deletedCount = 0;
    
    for (const file of giftFiles) {
      const key = file.Key;
      try {
        console.log(`Удаляем файл: ${key}`);
        
        const result = await s3.Remove(key);
        console.log(`Результат удаления файла ${key}: ${result}`);
        
        if (result === true) {
          deletedCount++;
          console.log(`Успешно удален файл: ${key}`);
        } else {
          console.error(`Не удалось удалить файл: ${key}, результат: ${result}`);
          
          // Пробуем альтернативный метод удаления
          console.log(`Пробуем альтернативный метод удаления для ${key}...`);
          try {
            // Некоторые реализации S3 требуют полный URL вместо ключа
            if (file.Location) {
              const url = file.Location;
              const urlObj = new URL(url);
              const filePath = urlObj.pathname.startsWith('/') 
                ? urlObj.pathname.substring(1) 
                : urlObj.pathname;
              
              console.log(`Пытаемся удалить по пути: ${filePath}`);
              const altResult = await s3.Remove(filePath);
              
              if (altResult === true) {
                deletedCount++;
                console.log(`Успешно удален файл (альтернативный метод): ${filePath}`);
              } else {
                console.error(`Не удалось удалить файл (альтернативный метод): ${filePath}`);
              }
            }
          } catch (altError) {
            console.error(`Ошибка при альтернативном удалении: ${altError}`);
          }
        }
      } catch (error) {
        console.error(`Ошибка удаления файла ${key}:`, error);
      }
    }
    
    console.log(`Удалено ${deletedCount} файлов из ${giftFiles.length}`);
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
    const files = await s3.GetList();
    
    if (!files || !Array.isArray(files)) {
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
    console.error(`Ошибка получения списка файлов из Yandex Object Storage:`, error);
    return [];
  }
}

/**
 * Загружает JSON-контент в Yandex Object Storage
 * @param giftId - ID подарка
 * @param content - Контент для загрузки
 * @returns URL загруженного файла
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
    
    // Преобразуем контент в строку JSON
    const contentJson = JSON.stringify(content, null, 2);
    const buffer = Buffer.from(contentJson, 'utf-8');
    
    // Формируем имя файла
    const storageFileName = `${giftId}_content.json`;
    
    console.log(`Загрузка контента в Yandex Object Storage: ${storageFileName}`);
    
    // Загружаем файл в хранилище
    const upload = await s3.Upload({
      buffer,
      name: storageFileName,
      ContentType: 'application/json'
    }, '');
    
    if (!upload || typeof upload === 'boolean' || !('Location' in upload)) {
      throw new Error('Не удалось загрузить контент в Yandex Object Storage');
    }
    
    return upload.Location as string;
  } catch (error) {
    console.error(`Ошибка загрузки контента для подарка ${giftId} в Yandex Object Storage:`, error);
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
    // Инициализируем S3, если еще не инициализирован
    if (!s3) {
      await initS3();
    }
    
    // Формируем имя файла
    const storageFileName = `${giftId}_content.json`;
    
    console.log(`Загрузка контента из Yandex Object Storage: ${storageFileName}`);
    
    // Получаем файл из хранилища
    const download = await s3.GetObject(storageFileName);
    
    if (!download || typeof download !== 'object' || !('Body' in download)) {
      return null;
    }
    
    // Преобразуем содержимое в строку
    const contentJson = download.Body.toString('utf-8');
    
    // Преобразуем JSON в объект
    return JSON.parse(contentJson);
  } catch (error) {
    console.error(`Ошибка загрузки контента для подарка ${giftId} из Yandex Object Storage:`, error);
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
    const storageFileName = `${giftId}_content.json`;
    
    // Проверяем существование файла
    const exists = await s3.FileExists(storageFileName);
    return exists === true;
  } catch (error) {
    console.error(`Ошибка проверки существования контента для подарка ${giftId} в Yandex Object Storage:`, error);
    return false;
  }
} 