export type WordOfDay = string;

export interface WordConfig {
  startDate: string;
  cycleLength: number;
  currentDate?: Date | null;
} 