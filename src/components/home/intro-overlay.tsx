"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import * as Button from "~/components/ui/button";
import * as IconButton from "~/components/ui/icon-button";
import { ArrowRightIcon } from "~/components/ui/icons";
import { GREETINGS } from "@/utils/data";
import { Spinner } from "~/components/ui/spinner";
import { useNavVisibility } from "~/components/providers/nav-visibility-provider";
import { IntroductionManager } from "@/utils/hooks/useIntro";

interface IntroOverlayProps {
  onComplete: () => void;
}

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setNavVisibility } = useNavVisibility();

  const handleSkipIntro = useCallback(() => {
    // Используем IntroductionManager для завершения интро
    IntroductionManager.completeIntro();
    setNavVisibility(true); // Показываем навигацию после завершения интро
    onComplete();
  }, [onComplete, setNavVisibility]);

  // Функция для переключения слайдов
  const handleNextSlide = useCallback(() => {
    if (currentSlide === 0) {
      setCurrentSlide(1);
    } else {
      handleSkipIntro();
    }
  }, [currentSlide, handleSkipIntro]);

  useEffect(() => {
    // Скрываем навигацию при появлении интро
    setNavVisibility(false);
    
    // Показываем навигацию при размонтировании компонента
    return () => {
      setNavVisibility(true);
    };
  }, [setNavVisibility]);

  useEffect(() => {
    // Имитируем загрузку ресурсов
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Симулируем задержку в 1.5 секунды
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Блокируем скролл страницы
    document.body.style.overflow = "hidden";

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Переключение слайдов по направлению скролла
      if (e.deltaY > 0 && currentSlide === 0) {
        // Скролл вниз - переходим на второй слайд
        setCurrentSlide(1);
      } else if (e.deltaY < 0 && currentSlide === 1) {
        // Скролл вверх - возвращаемся на первый слайд
        setCurrentSlide(0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "Space") {
        e.preventDefault();
        if (currentSlide === 0) {
          setCurrentSlide(1);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentSlide === 1) {
          setCurrentSlide(0);
        }
      } else if (e.key === "Escape") {
        handleSkipIntro();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Восстанавливаем скролл страницы при размонтировании
      document.body.style.overflow = "unset";
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide, handleSkipIntro]);

  // Автоматическая смена приветствий
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentGreeting((prev) => (prev + 1) % GREETINGS.length);
        setIsTransitioning(false);
      }, 500); // Время fade-out
    }, 5000); // Меняем каждые 5 секунд

    return () => clearInterval(interval);
  }, []);

  const handleLetSGo = () => {
    if (currentSlide === 0) {
      // Переходим на второй слайд
      setCurrentSlide(1);
    } else {
      // На втором слайде - завершаем интро
      handleSkipIntro();
    }
  };

  // Мемоизированный заголовок - избегаем перерендера при смене слайдов
  const introHeaderElement = useMemo(() => {
    return (
      <div className="flex flex-col md:flex-row justify-center items-center font-founders text-title-h3 md:text-title-h2 lg:text-title-h2 uppercase text-adaptive text-center">
        <span className="relative overflow-hidden flex justify-center">
          {/* Анимированное приветствие */}
          <span
            key={`${currentGreeting}-${isTransitioning}`}
            className={`inline-block whitespace-nowrap ${
              isTransitioning ? "animate-fade-out" : "animate-fade-in"
            }`}
          >
            {GREETINGS[currentGreeting]}
          </span>
          <span className="md:mr-4">,</span>
        </span>
        <span className="sm:-mt-2 flex justify-center">LESYA</span>
      </div>
    );
  }, [currentGreeting, isTransitioning]); // Зависит только от состояния приветствий, не от currentSlide

  if (isLoading) {
    return (
      <div className="c-loader dark-container">
        <div className="c-loader_spinner c-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-bg-strong-950 dark-container">
      {/* Первый блок */}
      <div
        className={`absolute inset-0 text-adaptive transition-opacity duration-1000 ${
          currentSlide === 0 ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => handleNextSlide()}
      >
        {/* Заголовок - фиксированная позиция */}
        <div className="absolute left-1/2 top-1/2 -mt-16 sm:-mt-20 md:-mt-28 -translate-x-1/2 -translate-y-1/2 transform">
          {introHeaderElement}
        </div>

        {/* Основной текст - фиксированная позиция по центру */}
        <div className="absolute left-1/2 top-1/2 mt-20 md:mt-10 lg:mt-16 w-full max-w-[550px] -translate-x-1/2 -translate-y-1/2 transform px-4 sm:px-6 md:px-8 text-center font-styrene text-paragraph-xs md:text-paragraph-sm md:font-bold lg:text-paragraph-md lg:font-bold font-bold uppercase text-adaptive">
          <span>
            This website is your personal assistant for your advent calendar
            gifts. Every day, you'll get a new gift to open — only you can open
            them, so don't forget to log in :)
          </span>
          <br />
          <br />
          <span>***</span>
          <br />
          <span>Your login and password can be found on the card.</span>
        </div>
        
        {/* Индикатор для мобильных устройств */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:hidden flex flex-col items-center">
          <div className="mt-4 text-center text-paragraph-xs font-styrene uppercase font-bold text-adaptive">Tap to continue</div>
        </div>
      </div>

      {/* Второй блок */}
      <div
        className={`absolute inset-0 text-adaptive transition-opacity duration-1000 ${
          currentSlide === 1 ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => handleSkipIntro()}
      >
        {/* Заголовок - фиксированная позиция */}
        <div className="absolute left-1/2 top-1/2 -mt-16 sm:-mt-20 md:-mt-28 -translate-x-1/2 -translate-y-1/2 transform">
          {introHeaderElement}
        </div>

        {/* Основной текст - фиксированная позиция по центру */}
        <div className="absolute left-1/2 top-1/2 mt-20 md:mt-10 lg:mt-16 w-full max-w-[550px] -translate-x-1/2 -translate-y-1/2 transform px-4 sm:px-6 md:px-8 text-center font-styrene text-paragraph-xs md:text-paragraph-sm md:font-bold lg:text-paragraph-md lg:font-bold font-bold uppercase text-adaptive">         <span>
            The roadmap page displays all the open gifts. gallery page — open
            memories. Some gifts may be kept secret from others. It's easy to
            find a gift — there is a small Easter egg and a photo sticker.
          </span>
          <br />
          <br />
          <span>***</span>
          <br />
          <span>Enjoy the gifts, memories and pleasant words ❤️</span>
        </div>

        {/* Кнопка - фиксированная позиция */}
        <div className="absolute left-1/2 top-1/2 mt-48 md:mt-40 lg:mt-44 -translate-x-1/2 -translate-y-1/2 transform hidden md:block">
          <Button.Root onClick={handleSkipIntro}>Let's GO</Button.Root>
        </div>
        
        {/* Индикатор для мобильных устройств */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:hidden flex flex-col items-center">
          <div className="mt-4 text-center text-paragraph-xs font-styrene uppercase font-bold text-adaptive">Tap to continue</div>
        </div>
      </div>

      {/* Skip кнопка - полная версия (для больших экранов) */}
      <IconButton.Root
        onClick={handleSkipIntro}
        position="absolute"
        iconPosition="end"
        icon={<ArrowRightIcon size={16} />}
        className="hidden md:flex"
      >
        SKIP INTRO
      </IconButton.Root>
      
      {/* Skip кнопка - компактная версия (для мобильных) */}
      <div className="hidden absolute top-6 right-6 z-10">
        <Button.Root 
          onClick={handleSkipIntro}
          className="text-paragraph-xs py-2 px-4"
        >
          Skip
        </Button.Root>
      </div>

      {/* Scroll Indicator - внутри dark-container для правильной темы */}
      <div
        className="c-introduction_scroll-indicator text-adaptive visible md:block hidden"
      ></div>
    </div>
  );
}
