"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as Button from "~/components/ui/button";
import { Countdown } from "~/components/home/countdown";
import { WordOfDay } from "~/components/home/word-of-day";
import { IntroOverlay } from "~/components/home/intro-overlay";
import { useIntro } from "@/utils/hooks/useIntro";
import { COUNTDOWN_CONFIG, WORD_SYSTEM } from "@/utils/data/constants";
import { useTimer, useGifts } from "@/utils/hooks/useDateContext";
import { FullScreenLoader } from "~/components/ui/spinner";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isGiftOpen } from "@/utils/hooks/gift-helpers";

// Тип для подарка из API
interface GiftData {
  id: string;
  openDate: string | Date;
  number: number;
  // другие поля подарка...
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const router = useRouter();
  const { currentDate, isTestMode } = useTimer();
  const { giftsDate } = useGifts();
  const { shouldShowIntro, isLoading, completeIntro } = useIntro();
  
  // Состояние для контента
  const [contentVisible, setContentVisible] = useState(true);
  const [availableGiftId, setAvailableGiftId] = useState<string | null>(null);
  
  // Рефы для анимации
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const countdownRef = useRef(null);
  const buttonRef = useRef(null);
  const contentRef = useRef(null);
  
  // Эффект для получения доступного сегодня подарка
  useEffect(() => {
    const fetchAvailableGift = async () => {
      try {
        // Получаем все подарки
        const res = await fetch('/api/gifts');
        if (!res.ok) throw new Error('Failed to fetch gifts');
        
        const gifts = await res.json() as GiftData[];
        
        if (!giftsDate) return;
        
        // Находим последний доступный подарок
        const availableGifts = gifts
          .filter((gift: GiftData) => {
            return isGiftOpen(new Date(gift.openDate), giftsDate);
          })
          .sort((a: GiftData, b: GiftData) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
        
        if (availableGifts.length > 0 && availableGifts[0]) {
          setAvailableGiftId(availableGifts[0].id);
        }
      } catch (error) {
        console.error('Error fetching available gift:', error);
      }
    };
    
    if (giftsDate) {
      fetchAvailableGift();
    }
  }, [giftsDate]);
  
  // Анимация элементов страницы
  useEffect(() => {
    // Проверяем, чтобы не запускать анимацию при наличии интро
    if (!shouldShowIntro && !isLoading && contentVisible) {
      // Таймлайн для последовательной анимации
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      // Анимация заголовка
      tl.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 }
      );
      
      // Анимация слова дня
      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5" // Запускаем немного раньше завершения предыдущей анимации
      );
      
      // Анимация счетчика
      tl.fromTo(
        countdownRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.3"
      );
      
      // Анимация кнопки
      tl.fromTo(
        buttonRef.current,
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6 },
        "-=0.2"
      );
    }
  }, [shouldShowIntro, isLoading, contentVisible]);

  // Показываем лоадер пока проверяем куки или дата не инициализирована
  if (isLoading || !currentDate) {
    return <FullScreenLoader />;
  }
  
  // Функция для обработки клика по кнопке
  const handleButtonClick = () => {
    if (status === "loading") return;
    
    // Проверяем авторизацию пользователя
    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      router.push('/signin');
      return;
    }
    
    // Анимация исчезновения контента (перемещение вверх)
    const contentElements = [titleRef.current, subtitleRef.current, countdownRef.current, buttonRef.current];
    
    gsap.to(contentElements, {
      y: -100,
      opacity: 0,
      duration: 0.6, // Ускоряем анимацию исчезновения
      stagger: 0.05, // Уменьшаем задержку между элементами
      ease: "power3.in",
      onComplete: () => {
        setContentVisible(false);
        // Переходим на страницу подарка с параметром from=home
        if (availableGiftId) {
          router.push(`/gift/${availableGiftId}?from=home`);
        } else {
          // Если нет доступных подарков, перенаправляем на страницу со всеми подарками
          router.push('/gift');
        }
      }
    });
  };

  return (
      <div className="relative">
        {/* Интро оверлей */}
        {shouldShowIntro && (
          <IntroOverlay onComplete={completeIntro} />
        )}
        
        <main className="bg-adaptive min-h-screen">
          <div className="flex min-h-screen flex-col items-center justify-center">
            {contentVisible && (
              <div ref={contentRef} className="flex flex-col items-center justify-center gap-12">
                <div className="flex flex-col items-center justify-center">
                  <h2 ref={subtitleRef} className="text-adaptive font-nyghtserif text-label-lg text-center italic">
                    <WordOfDay
                      startDate={WORD_SYSTEM.START_DATE}
                      cycleLength={WORD_SYSTEM.CYCLE_LENGTH}
                      currentDate={giftsDate}
                    />
                  </h2>
                  <h1 ref={titleRef} className="text-adaptive text-title-h1 font-founders text-center -mt-2">
                    LESYA
                    <br />
                    SVET
                  </h1>
                </div>
                
                <h2 ref={countdownRef} className="text-adaptive font-styrene text-paragraph-md font-bold text-center uppercase">
                  Before the birthday:
                  <br />
                  <Countdown
                    targetDate={COUNTDOWN_CONFIG.TARGET_DATE}
                    updateInterval={COUNTDOWN_CONFIG.UPDATE_INTERVAL}
                  />
                </h2>
              </div>
            )}
          </div>
        </main>

        {/* Кнопка фиксирована к viewport */}
        <div className="pointer-events-none fixed inset-0 z-50">
          <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
            <div ref={buttonRef}>
              <Button.Root 
                onClick={handleButtonClick}
                disabled={!contentVisible || status === "loading"}
              >
                Let's GO
              </Button.Root>
            </div>
          </div>
        </div>
      </div>
  );
}
