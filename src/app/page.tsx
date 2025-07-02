"use client";

import { useRouter } from "next/navigation";
import * as Button from "~/components/ui/button";
import { Countdown } from "~/components/home/countdown";
import { WordOfDay } from "~/components/home/word-of-day";
import { IntroOverlay } from "~/components/home/intro-overlay";
import { useIntro } from "@/utils/hooks/useIntro";
import { COUNTDOWN_CONFIG, WORD_SYSTEM } from "@/utils/data/constants";
import { useTimer, useGifts as useDateGifts } from "@/utils/hooks/useDateContext";
import { FullScreenLoader } from "~/components/ui/spinner";
import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { isGiftOpen } from "@/utils/hooks/gift-helpers";
import { useGifts } from "@/utils/hooks/useGiftQueries";
import { useAuth } from "~/components/providers/auth-provider";
import dynamic from "next/dynamic";

// Динамически импортируем Confetti для избежания проблем с SSR
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

// Тип для подарка из API
interface GiftData {
  id: string;
  openDate: string | Date;
  number: number;
  // другие поля подарка...
}

export default function HomePage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const isAdmin = user?.username === "admin";
  const router = useRouter();
  const { currentDate, isTestMode } = useTimer();
  const { giftsDate } = useDateGifts(); // Переименовываем чтобы избежать конфликта имен
  const { shouldShowIntro, isLoading: isIntroLoading, completeIntro } = useIntro();
  
  // Получаем список подарков с использованием React Query
  const { data: gifts, isLoading: isGiftsLoading, error: giftsError } = useGifts();
  
  // Состояние для контента
  const [contentVisible, setContentVisible] = useState(true);
  // Состояние для конфетти
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  // Рефы для анимации
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const countdownRef = useRef(null);
  const buttonRef = useRef(null);
  const contentRef = useRef(null);
  
  // Определяем доступный подарок с использованием useMemo
  const availableGiftId = useMemo(() => {
    if (!gifts || !giftsDate) return null;
    
    // Находим последний доступный подарок
    const availableGifts = gifts
      .filter((gift) => isGiftOpen(new Date(gift.openDate), giftsDate, isAdmin))
      .sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
    
    return availableGifts.length > 0 && availableGifts[0] ? availableGifts[0].id : null;
  }, [gifts, giftsDate, isAdmin]);
  
  // Проверка, является ли текущая дата днем рождения
  const isBirthdayToday = useMemo(() => {
    if (!giftsDate || !COUNTDOWN_CONFIG.TARGET_DATE) return false;
    
    const birthday = new Date(COUNTDOWN_CONFIG.TARGET_DATE);
    // Проверяем только день и месяц, игнорируя год
    return giftsDate.getDate() === birthday.getDate() && 
           giftsDate.getMonth() === birthday.getMonth();
  }, [giftsDate]);

  // Обновляем размеры окна для конфетти
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize(); // Вызываем сразу для установки начальных размеров
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Показываем конфетти, если сегодня день рождения
  useEffect(() => {
    if (isBirthdayToday) {
      setShowConfetti(true);
      console.log('Сегодня день рождения! Показываем конфетти!');
    } else {
      setShowConfetti(false);
    }
  }, [isBirthdayToday]);
  
  // Анимация элементов страницы
  useEffect(() => {
    // Проверяем, чтобы не запускать анимацию при наличии интро
    if (!shouldShowIntro && !isIntroLoading && contentVisible) {
      // Таймлайн для последовательной анимации
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      // Проверяем существование элементов перед анимацией
      if (titleRef.current) {
        // Анимация заголовка
        tl.fromTo(
          titleRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 }
        );
      }
      
      if (subtitleRef.current) {
        // Анимация слова дня
        tl.fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.5" // Запускаем немного раньше завершения предыдущей анимации
        );
      }
      
      if (countdownRef.current) {
        // Анимация счетчика
        tl.fromTo(
          countdownRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.3"
        );
      }
      
      if (buttonRef.current) {
        // Анимация кнопки
        tl.fromTo(
          buttonRef.current,
          { y: 20, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6 },
          "-=0.2"
        );
      }
    }
  }, [shouldShowIntro, isIntroLoading, contentVisible]);

  // Показываем лоадер пока проверяем куки или дата не инициализирована
  if (isIntroLoading || !currentDate || isGiftsLoading || isAuthLoading) {
    return <FullScreenLoader />;
  }
  
  // Функция для обработки клика по кнопке
  const handleButtonClick = () => {
    // Проверяем авторизацию пользователя
    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      router.push('/login');
      return;
    }
    
    // Анимация исчезновения контента (перемещение вверх)
    const contentElements: HTMLElement[] = [];
    
    // Проверяем существование элементов перед добавлением их в массив для анимации
    if (titleRef.current) contentElements.push(titleRef.current);
    if (subtitleRef.current) contentElements.push(subtitleRef.current);
    if (countdownRef.current) contentElements.push(countdownRef.current);
    if (buttonRef.current) contentElements.push(buttonRef.current);
    
    // Проверяем, есть ли элементы для анимации
    if (contentElements.length > 0) {
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
    } else {
      // Если нет элементов для анимации, просто выполняем переход
      setContentVisible(false);
      if (availableGiftId) {
        router.push(`/gift/${availableGiftId}?from=home`);
      } else {
        router.push('/gift');
      }
    }
  };

  return (
      <div className="fixed inset-0 overflow-hidden">
        {/* Конфетти эффект в день рождения */}
        {showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={true}
            numberOfPieces={200}
            gravity={0.2}
          />
        )}
        
        {/* Интро оверлей */}
        {shouldShowIntro && (
          <IntroOverlay onComplete={completeIntro} />
        )}
        
        <main className="bg-adaptive h-full w-full overflow-hidden">
          <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
            {contentVisible && (
              <div ref={contentRef} className="flex flex-col items-center justify-center gap-4 md:gap-10 lg:gap-12 -mt-8">
                <div className="flex flex-col items-center justify-center">
                  <h2 ref={subtitleRef} className="text-adaptive font-nyghtserif text-label-sm md:text-label-md lg:text-label-lg text-center italic">
                    <WordOfDay
                      startDate={WORD_SYSTEM.START_DATE}
                      cycleLength={WORD_SYSTEM.CYCLE_LENGTH}
                      currentDate={giftsDate}
                    />
                  </h2>
                  <h1 ref={titleRef} className="text-adaptive text-sm-title-h1 md:text-md-title-h1 lg:text-title-h1 font-founders text-center -mt-2">
                    LESYA
                    <br />
                    SVET
                  </h1>
                </div>
                
                <h2 ref={countdownRef} className="text-adaptive font-styrene text-paragraph-sm md:text-paragraph-md md:font-bold font-bold text-center uppercase">
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
          <div className="pointer-events-auto absolute bottom-12 sm:bottom-8 left-1/2 -translate-x-1/2">
            <div ref={buttonRef}>
              <Button.Root 
                onClick={handleButtonClick}
                disabled={!contentVisible || isAuthLoading}
              >
                Let's GO
              </Button.Root>
            </div>
          </div>
        </div>
      </div>
  );
}
