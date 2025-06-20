/**
 * Константы проекта
 */

/**
 * Настройки для системы слов
 */
export const WORD_SYSTEM = {
  START_DATE: '2025-07-01', // Начальная дата для отсчета
  CYCLE_LENGTH: 365, // Количество дней в цикле (полный год)
} as const;

/**
 * Настройки для работы с датами
 */
export const DATE_CONFIG = {
  DEFAULT_LOCALE: 'ru-RU',
  DATE_FORMAT: 'YYYY-MM-DD',
  TIMEZONE: 'Asia/Yekaterinburg', // Челябинск (UTC+5)
} as const;

/**
 * Настройки для таймера обратного отсчета
 */
export const COUNTDOWN_CONFIG = {
  TARGET_DATE: '2025-08-01', // Дата дня рождения или целевая дата
  UPDATE_INTERVAL: 1000, // Интервал обновления в миллисекундах
} as const;

/**
 * Приветствия на разных языках для интро
 */
export const GREETINGS = [
  "Hi",
  "Hey",
  "Hola",
  "Bonjour",
  "Hallo",
  "Ciao",
  "Olá",
  "Czesc",
  "Privet",
  "Merhaba",
  "Salam",
  "Shalom",
  "Ni hao",
  "Namaste",
  "Sawadee",
  "Halo",
  "Jambo",
  "Yia sou",
  "Halló",
  "Hej",
  "Hej",
  "Ahoj",
  "Helló",
] as const; 