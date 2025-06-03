"use client";

import { applyUnifiedFetchPatch } from "./unified-fetch-patch";

// Применяем объединенный патч немедленно при импорте файла
if (typeof window !== 'undefined') {
  console.log('🚀 Initializing unified fetch patch early...');
  applyUnifiedFetchPatch();
}

// Экспортируем фиктивную функцию для правильной работы импорта
export function initSessionPatch() {
  // Ничего не делаем, так как патч уже применен
  return true;
} 