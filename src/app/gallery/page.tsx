"use client";

import { useState, useEffect } from "react";
import { PolaroidPhoto } from "~/components/gallery/polaroid-photo";
import { useDate } from "@/utils/hooks/useDateContext";
import Link from "next/link";
import * as Button from "~/components/ui/button";
import type { MemoryPhoto, Gift } from "@/utils/types/gift";
import { Spinner } from "~/components/ui/spinner";

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
    <div className="relative bg-white">
      {isLoading && (
        <div className="fixed bottom-6 right-6 z-50">
          <Spinner className="text-black w-8 h-8" />
        </div>
      )}
      
      {!isLoading && (
        <main className="min-h-screen">
          {/* Заголовок в верхней части */}
          <div className="flex justify-center pt-24 md:pt-20 lg:pt-24 mb-8 md:mb-16">
            <h4 className="text-center font-founders text-title-h4 uppercase text-black">
              remember?
            </h4>
          </div>

          {/* Полароиды */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20 pt-4 sm:pt-6">
            {photos.length > 0 ? (
              <div className="flex flex-col items-center sm:grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-y-12 sm:gap-6 md:gap-8">
                {photos.map((photo) => {
                  const revealed = isGiftRevealed(photo.gift?.openDate);
                  
                  return (
                    <div key={photo.id} className="mb-8 sm:mb-0">
                      {revealed ? (
                        <Link href={`/gift/${photo.giftId}`} className="cursor-pointer block">
                          <PolaroidPhoto
                            memoryPhoto={photo}
                            isRevealed={revealed}
                            openDate={ensureDate(photo.gift?.openDate)}
                            size="small"
                          />
                        </Link>
                      ) : (
                        <div className="cursor-default block">
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
  <></>
            )}
          </div>

          {/* Нижний текст */}
          <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-28 text-center px-4">
            <span className="font-nyghtserif text-label-xl">***</span>
            <h2 className="font-founders text-title-h4 md:text-title-h3 uppercase">
              Happiness <br />
              is nearby
            </h2>

            <Link href="/" className="mt-2 sm:mt-4">
              <Button.Root>go home</Button.Root>
            </Link>
          </div>
        </main>
      )}
    </div>
  );
}
