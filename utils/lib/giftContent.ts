import { promises as fs } from 'fs';
import path from 'path';
import type { GiftContent } from '../types/gift';

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
  try {
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
  try {
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
export function generateContentPath(giftId: string): string {
  return giftId; // Теперь просто возвращаем ID подарка
}

// Функция для проверки существования файла контента
export async function contentExists(giftId: string): Promise<boolean> {
  try {
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
  try {
    const giftDir = getGiftDir(giftId);
    const targetDir = subfolder ? path.join(giftDir, subfolder) : giftDir;
    
    // Создаем нужную папку
    await fs.mkdir(targetDir, { recursive: true });
    
    // Сохраняем файл
    const filePath = path.join(targetDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    // Возвращаем относительный URL для доступа
    const relativePath = subfolder 
      ? `/static/gifts/${giftId}/${subfolder}/${fileName}`
      : `/static/gifts/${giftId}/${fileName}`;
    
    return relativePath;
  } catch (error) {
    console.error(`Ошибка сохранения файла ${fileName} для подарка ${giftId}:`, error);
    throw error;
  }
}

// Функция для получения списка файлов в папке подарка
export async function getGiftFiles(giftId: string, subfolder?: string): Promise<string[]> {
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
  try {
    const giftDir = getGiftDir(giftId);
    await fs.rm(giftDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`Ошибка удаления папки подарка ${giftId}:`, error);
    return false;
  }
} 