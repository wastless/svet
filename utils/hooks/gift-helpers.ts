/**
 * Проверяет, открыт ли подарок на текущую дату
 * @param openDate дата открытия подарка
 * @param currentDate текущая дата (для тестового режима)
 * @returns true, если подарок открыт
 */
export function isGiftOpen(openDate: Date, currentDate?: Date | null): boolean {
  if (!currentDate) return false; // Если дата не инициализирована, считаем подарок закрытым
  
  // Сравниваем полные даты с учетом времени
  const dateObj = new Date(openDate);
  return currentDate >= dateObj;
}

/**
 * Определяет номер недели для подарка относительно стартовой даты
 * @param openDate дата открытия подарка
 * @param startDate стартовая дата отсчета (по умолчанию из констант)
 * @returns номер недели (начиная с 1) или null, если дата раньше стартовой
 */
export function getGiftWeek(openDate: Date | string, startDate: string | Date): number | null {
  const giftDate = new Date(openDate);
  const baseDate = new Date(startDate);
  
  // Если дата открытия раньше стартовой даты, возвращаем null
  if (giftDate < baseDate) {
    return null;
  }
  
  // Вычисляем разницу в миллисекундах и конвертируем в дни
  const diffTime = giftDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Определяем номер недели (начиная с 1)
  return Math.floor(diffDays / 7) + 1;
} 