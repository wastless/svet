"use client";

import { useState } from "react";
import { RoadmapItem } from "./RoadmapItem";
import type { Gift } from "@prisma/client";
import { isGiftOpen, getGiftWeek } from "@/utils/hooks/gift-helpers";
import * as IconButton from "~/components/ui/icon-button";
import { WORD_SYSTEM } from "@/utils/data/constants";

interface RoadmapGridProps {
  gifts: Gift[];
}

export function RoadmapGrid({ gifts }: RoadmapGridProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  
  // Фильтруем подарки по неделе, если выбрана
  const filteredGifts = selectedWeek !== null
    ? gifts.filter(gift => {
        // Определяем неделю для подарка
        const giftWeek = getGiftWeek(gift.openDate, WORD_SYSTEM.START_DATE);
        // Если подарок не попадает в неделю, его не показываем
        return giftWeek === selectedWeek;
      })
    : gifts;

  // Добавляем пустые элементы для сетки, чтобы всегда было 12 элементов в сетке
  const totalItems = 12;
  const emptyItems = Math.max(0, totalItems - filteredGifts.length);
  
  return (
    <div className="w-full">
      {/* Кнопки для фильтрации по неделям */}
      <div className="flex justify-center gap-6 mb-12">
        <IconButton.Root 
          onClick={() => setSelectedWeek(null)}
          className={selectedWeek === null ? 'opacity-100' : 'opacity-50'}
        >
          ALL
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => setSelectedWeek(selectedWeek === 1 ? null : 1)}
          className={selectedWeek === 1 ? 'opacity-100' : 'opacity-50'}
        >
          1 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => setSelectedWeek(selectedWeek === 2 ? null : 2)}
          className={selectedWeek === 2 ? 'opacity-100' : 'opacity-50'}
        >
          2 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => setSelectedWeek(selectedWeek === 3 ? null : 3)}
          className={selectedWeek === 3 ? 'opacity-100' : 'opacity-50'}
        >
          3 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => setSelectedWeek(selectedWeek === 4 ? null : 4)}
          className={selectedWeek === 4 ? 'opacity-100' : 'opacity-50'}
        >
          4 WEEK
        </IconButton.Root>
      </div>

      {/* Сетка с подарками */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {filteredGifts.map((gift) => (
          <RoadmapItem
            key={gift.id}
            id={gift.id}
            number={gift.number}
            hintImageUrl={gift.hintImageUrl}
            imageCover={gift.imageCover || ""}
            openDate={gift.openDate}
            title={gift.title || undefined}
          />
        ))}
        
        {/* Добавляем пустые элементы для заполнения сетки */}
        {Array.from({ length: emptyItems }).map((_, index) => (
          <div key={`empty-${index}`} className="w-full aspect-square bg-transparent"></div>
        ))}
      </div>
    </div>
  );
} 