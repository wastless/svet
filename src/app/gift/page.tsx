"use client";

import Link from "next/link";
import * as Button from "~/components/ui/button";
import { RoadmapGrid } from "~/components/roadmap/RoadmapGrid";
import type { Gift } from "@prisma/client";
import { useState, useEffect } from "react";
import { Spinner } from "~/components/ui/spinner";
import { useAuth } from "~/components/providers/auth-provider";

export default function GiftPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.username === "admin";

  // Загружаем данные о подарках
  useEffect(() => {
    async function fetchGifts() {
      try {
        setIsLoading(true);
        // Добавляем timestamp, чтобы избежать кеширования
        const timestamp = Date.now();
        const response = await fetch(`/api/gifts?_t=${timestamp}`);
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные о подарках');
        }
        
        const giftsData = await response.json();
        // Сортировка по номеру
        giftsData.sort((a: Gift, b: Gift) => a.number - b.number);
        setGifts(giftsData);
      } catch (error) {
        console.error("Ошибка при загрузке подарков:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    void fetchGifts();
  }, []);

  if (isLoading) {
    return (
      <div className="relative bg-bg-white-0 min-h-screen">
        <div className="fixed bottom-6 right-6 z-50">
          <Spinner className="text-adaptive w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-bg-white-0">
      <main className="min-h-screen bg-adaptive">
        {/* Заголовок в верхней части */}
        <div className="flex justify-center pt-24 md:pt-20 lg:pt-24 mb-8 md:mb-16">
          <h4 className="text-center font-founders text-title-h4 uppercase text-adaptive">
          gift roadmap
          </h4>
        </div>

        {/* Основной контент сетка с подарками */}
        <div className="pb-6">
          <RoadmapGrid gifts={gifts} />
        </div>

        {/* Нижний текст */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-28 text-center px-4">
          <span className="font-nyghtserif text-label-xl">***</span>
          <h2 className="font-founders text-title-h4 md:text-title-h3 uppercase">
          To feel the  <br />
          sunlight
          </h2>

          <Link href="/">
            <Button.Root>go home</Button.Root>
          </Link>
        </div>
      </main>
    </div>
  );
}
