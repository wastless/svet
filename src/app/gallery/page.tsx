"use client";

import { useState, useEffect } from "react";
import { PolaroidPhoto } from "~/components/gallery/polaroid-photo";
import { useDate } from "@/utils/hooks/useDateContext";
import Link from "next/link";
import * as Button from "~/components/ui/button";
import type { MemoryPhoto, Gift } from "@/utils/types/gift";

export default function GalleryPage() {
  const { currentDate } = useDate();
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Загружаем данные о подарках и их фотографиях
  useEffect(() => {
    async function fetchGifts() {
      try {
        setIsLoading(true);
        // Получаем все подарки с их фотографиями
        const response = await fetch('/api/gifts');
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные о подарках');
        }
        
        const gifts = await response.json();
        
        // Фильтруем только подарки с фотографиями и преобразуем строковые даты в объекты Date
        const giftsWithPhotos = gifts
          .filter((gift: any) => gift.memoryPhoto)
          .map((gift: any) => {
            // Преобразуем строковую дату открытия в объект Date
            if (gift.openDate && typeof gift.openDate === 'string') {
              gift.openDate = new Date(gift.openDate);
            }
            
            return {
              ...gift.memoryPhoto,
              gift: gift
            };
          })
          // Сортируем по ID подарка
          .sort((a: MemoryPhoto, b: MemoryPhoto) => {
            if (!a.gift || !b.gift) return 0;
            return a.gift.number - b.gift.number; // Сортировка по номеру подарка
          });
        
        setPhotos(giftsWithPhotos);
      } catch (error) {
        console.error("Ошибка при загрузке подарков:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchGifts();
  }, []);
  
  // Проверяем, открыт ли подарок (если текущая дата больше или равна дате открытия)
  const isGiftRevealed = (openDate: Date | string | undefined): boolean => {
    if (!currentDate || !openDate) return false;
    
    // Преобразуем строковую дату в объект Date, если необходимо
    const dateObj = typeof openDate === 'string' ? new Date(openDate) : openDate;
    
    return currentDate >= dateObj;
  };

  // Форматируем дату для компонента PolaroidPhoto
  const ensureDate = (date: Date | string | undefined): Date => {
    if (!date) return new Date();
    return typeof date === 'string' ? new Date(date) : date;
  };

  return (
    <div className="dark-container relative bg-bg-strong-950">
      <main className="min-h-screen bg-adaptive pb-12">
        {/* Заголовок в верхней части */}
        <div className="flex justify-center pt-[100px] mb-16">
          <h4 className="text-center font-founders text-title-h4 uppercase text-adaptive">
            remember
          </h4>
        </div>

        {/* Полароиды */}
        <div className="container mx-auto px-4 pb-20 pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="text-adaptive font-styrene">Loading...</div>
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {photos.map((photo) => {
                const revealed = isGiftRevealed(photo.gift?.openDate);
                
                return (
                  <div key={photo.id} className="flex justify-center">
                    {revealed ? (
                      <Link href={`/gift/${photo.giftId}`} className="cursor-pointer transition-all duration-500 ease-out hover:scale-105">
                        <PolaroidPhoto
                          memoryPhoto={photo}
                          isRevealed={revealed}
                          openDate={ensureDate(photo.gift?.openDate)}
                          size="small"
                        />
                      </Link>
                    ) : (
                      <div className="cursor-default transition-all duration-500 ease-out hover:scale-105">
                        <PolaroidPhoto
                          memoryPhoto={photo}
                          isRevealed={revealed}
                          openDate={ensureDate(photo.gift?.openDate)}
                          size="small"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="text-adaptive font-styrene">No photos yet</div>
            </div>
          )}
        </div>

        {/* Нижний текст */}
        <div className="dark-container flex flex-col items-center gap-8 bg-bg-strong-950 py-20 text-center text-adaptive">
          <span className="font-nyghtserif text-label-xl">***</span>
          <h2 className="font-founders text-title-h3 uppercase">
            Happiness <br />
            is nearby
          </h2>

          <Link href="/">
            <Button.Root>to the home</Button.Root>
          </Link>
        </div>
      </main>
    </div>
  );
}
