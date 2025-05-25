// Типы для обратного отсчета
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Конфигурация для обратного отсчета
export interface CountdownConfig {
  targetDate: string;
  currentDate?: Date;
  updateInterval?: number;
} 