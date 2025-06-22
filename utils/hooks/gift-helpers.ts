/**
 * Проверяет, открыт ли подарок на текущую дату
 * @param openDate дата открытия подарка
 * @param currentDate текущая дата (для тестового режима)
 * @param isAdmin флаг, указывающий что пользователь - администратор
 * @returns true, если подарок открыт или пользователь админ
 */
export function isGiftOpen(openDate: Date, currentDate?: Date | null, isAdmin: boolean = false): boolean {
  // Если пользователь админ, всегда возвращаем true
  if (isAdmin) return true;
  
  if (!currentDate) return false; // Если дата не инициализирована, считаем подарок закрытым
  
  // Сравниваем полные даты с учетом времени
  const dateObj = new Date(openDate);
  return currentDate >= dateObj;
}

/**
 * Определяет номер недели для подарка относительно стартовой даты
 * @param openDate дата открытия подарка
 * @param startDate стартовая дата отсчета (по умолчанию из констант)
 * @returns номер недели (начиная с 0 для первой недели) или null, если дата раньше стартовой
 */
export function getGiftWeek(openDate: Date | string, startDate: string | Date): number | null {
  const giftDate = new Date(openDate);
  const baseDate = new Date(startDate);
  
  // Нормализация дат (отбрасываем время)
  const normalizedGiftDate = new Date(
    giftDate.getFullYear(), 
    giftDate.getMonth(), 
    giftDate.getDate()
  );
  
  const normalizedBaseDate = new Date(
    baseDate.getFullYear(), 
    baseDate.getMonth(), 
    baseDate.getDate()
  );
  
  // Если дата открытия раньше стартовой даты, возвращаем null
  if (normalizedGiftDate < normalizedBaseDate) {
    return null;
  }
  
  // Вычисляем разницу в миллисекундах и конвертируем в дни
  const diffTime = normalizedGiftDate.getTime() - normalizedBaseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Определяем номер недели (начиная с 0)
  // 0 = первая неделя (день 0-6), 1 = вторая неделя (день 7-13), и т.д.
  return Math.floor(diffDays / 7);
} 