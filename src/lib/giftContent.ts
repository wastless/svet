import { promises as fs } from 'fs';
import path from 'path';
import type { GiftContent } from '~/types/gift';

// Базовая папка для хранения контента подарков
const CONTENT_BASE_DIR = path.join(process.cwd(), 'static', 'gift-content');

// Функция для загрузки контента подарка по пути
export async function loadGiftContent(contentPath: string): Promise<GiftContent | null> {
  try {
    const fullPath = path.join(CONTENT_BASE_DIR, contentPath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const content = JSON.parse(fileContent) as GiftContent;
    return content;
  } catch (error) {
    console.error(`Ошибка загрузки контента подарка: ${contentPath}`, error);
    return null;
  }
}

// Функция для сохранения контента подарка
export async function saveGiftContent(contentPath: string, content: GiftContent): Promise<boolean> {
  try {
    const fullPath = path.join(CONTENT_BASE_DIR, contentPath);
    const dir = path.dirname(fullPath);
    
    // Создаем папку, если её нет
    await fs.mkdir(dir, { recursive: true });
    
    // Сохраняем контент с красивым форматированием
    await fs.writeFile(fullPath, JSON.stringify(content, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Ошибка сохранения контента подарка: ${contentPath}`, error);
    return false;
  }
}

// Функция для генерации пути к файлу контента на основе ID подарка
export function generateContentPath(giftId: string): string {
  return `${giftId}.json`;
}

// Функция для проверки существования файла контента
export async function contentExists(contentPath: string): Promise<boolean> {
  try {
    const fullPath = path.join(CONTENT_BASE_DIR, contentPath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
} 