import { promises as fs } from 'fs';
import path from 'path';
import type { GiftContent } from '../types/gift';
import { 
  uploadFileToYandexStorage, 
  deleteFileFromYandexStorage,
  uploadContentToYandexStorage,
  loadContentFromYandexStorage,
  contentExistsInYandexStorage
} from './yandexStorage';
import { env } from '../../src/env.js';

// Базовая папка для хранения всех данных подарков
const GIFTS_BASE_DIR = path.join(process.cwd(), 'static', 'gifts');

// Функция для получения пути к папке подарка
export function getGiftDir(giftId: string): string {
  return path.join(GIFTS_BASE_DIR, giftId);
}

// Функция для получения пути к файлу контента подарка
export function getGiftContentPath(giftId: string): string {
  return path.join(getGiftDir(giftId), 'content.json');
}

// Функция для получения пути к папке медиа блоков
export function getGiftBlocksDir(giftId: string): string {
  return path.join(getGiftDir(giftId), 'blocks');
}

// Функция для загрузки контента подарка по ID
export async function loadGiftContent(giftId: string): Promise<GiftContent | null> {
  'use server';
  try {
    // Пытаемся загрузить из Yandex Object Storage, если настроен
    if (env.YANDEX_ACCESS_KEY_ID && env.YANDEX_SECRET_ACCESS_KEY && env.YANDEX_BUCKET_NAME) {
      const content = await loadContentFromYandexStorage(giftId);
      if (content) {
        return content as GiftContent;
      }
    }
    
    // Используем локальный файл как запасной вариант
    const contentPath = getGiftContentPath(giftId);
    const fileContent = await fs.readFile(contentPath, 'utf-8');
    const content = JSON.parse(fileContent) as GiftContent;
    return content;
  } catch (error) {
    console.error(`Ошибка загрузки контента подарка: ${giftId}`, error);
    return null;
  }
}

// Функция для сохранения контента подарка
export async function saveGiftContent(giftId: string, content: GiftContent): Promise<boolean> {
  'use server';
  try {
    // Сохраняем в Yandex Object Storage, если настроен
    if (env.YANDEX_ACCESS_KEY_ID && env.YANDEX_SECRET_ACCESS_KEY && env.YANDEX_BUCKET_NAME) {
      try {
        await uploadContentToYandexStorage(giftId, content);
        return true;
      } catch (error) {
        console.error(`Ошибка сохранения контента в Yandex Object Storage: ${giftId}`, error);
      }
    }
    
    // Используем локальное хранилище как запасной вариант
    const giftDir = getGiftDir(giftId);
    const contentPath = getGiftContentPath(giftId);
    
    // Создаем папку подарка, если её нет
    await fs.mkdir(giftDir, { recursive: true });
    
    // Сохраняем контент с красивым форматированием
    await fs.writeFile(contentPath, JSON.stringify(content, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Ошибка сохранения контента подарка: ${giftId}`, error);
    return false;
  }
}

// Функция для генерации пути к файлу контента на основе ID подарка (для совместимости с API)
export async function generateContentPath(giftId: string): Promise<string> {
  'use server';
  return giftId; // Теперь просто возвращаем ID подарка
}

// Функция для проверки существования файла контента
export async function contentExists(giftId: string): Promise<boolean> {
  'use server';
  try {
    // Проверяем в Yandex Object Storage, если настроен
    if (env.YANDEX_ACCESS_KEY_ID && env.YANDEX_SECRET_ACCESS_KEY && env.YANDEX_BUCKET_NAME) {
      const exists = await contentExistsInYandexStorage(giftId);
      if (exists) {
        return true;
      }
    }
    
    // Используем локальный файл как запасной вариант
    const contentPath = getGiftContentPath(giftId);
    await fs.access(contentPath);
    return true;
  } catch {
    return false;
  }
}

// Функция для сохранения файла в папку подарка
export async function saveGiftFile(
  giftId: string, 
  fileName: string, 
  buffer: Buffer,
  subfolder?: string
): Promise<string> {
  'use server';
  try {
    // Сохраняем в Yandex Object Storage
    if (env.YANDEX_ACCESS_KEY_ID && env.YANDEX_SECRET_ACCESS_KEY && env.YANDEX_BUCKET_NAME) {
      const url = await uploadFileToYandexStorage(buffer, fileName, giftId, subfolder);
      return url;
    }
    
    // Если Yandex Object Storage не настроен, выбрасываем ошибку
    throw new Error('Yandex Object Storage is not configured');
  } catch (error) {
    console.error(`Ошибка сохранения файла ${fileName} для подарка ${giftId}:`, error);
    throw error;
  }
}

// Функция для получения списка файлов в папке подарка
export async function getGiftFiles(giftId: string, subfolder?: string): Promise<string[]> {
  'use server';
  try {
    const targetDir = subfolder 
      ? path.join(getGiftDir(giftId), subfolder)
      : getGiftDir(giftId);
    
    const files = await fs.readdir(targetDir);
    return files.filter(file => !file.startsWith('.'));
  } catch (error) {
    console.error(`Ошибка получения файлов подарка ${giftId}:`, error);
    return [];
  }
}

// Функция для удаления папки подарка
export async function deleteGiftDir(giftId: string): Promise<boolean> {
  'use server';
  try {
    const giftDir = getGiftDir(giftId);
    await fs.rm(giftDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`Ошибка удаления папки подарка ${giftId}:`, error);
    return false;
  }
} 