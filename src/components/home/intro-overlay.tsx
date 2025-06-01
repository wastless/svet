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
      <div className="flex justify-center font-founders text-title-h2 uppercase text-adaptive">
        <span className="relative overflow-hidden">
          {/* Анимированное приветствие */}
          <span
            key={`${currentGreeting}-${isTransitioning}`}
            className={`inline-block whitespace-nowrap ${
              isTransitioning ? "animate-fade-out" : "animate-fade-in"
            }`}
          >
            {GREETINGS[currentGreeting]}
          </span>
        </span>
        <span className="ml-1">, LESYA</span>
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
      >
        {/* Заголовок - фиксированная позиция */}
        <div className="absolute left-1/2 top-1/2 -mt-28 -translate-x-1/2 -translate-y-1/2 transform">
          {introHeaderElement}
        </div>

        {/* Основной текст - фиксированная позиция по центру */}
        <div className="absolute left-1/2 top-1/2 mt-16 w-[550px] -translate-x-1/2 -translate-y-1/2 transform px-8 text-center font-styrene text-paragraph-md font-bold uppercase text-adaptive">
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
      </div>

      {/* Второй блок */}
      <div
        className={`absolute inset-0 text-adaptive transition-opacity duration-1000 ${
          currentSlide === 1 ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Заголовок - фиксированная позиция */}
        <div className="absolute left-1/2 top-1/2 -mt-28 -translate-x-1/2 -translate-y-1/2 transform">
          {introHeaderElement}
        </div>

        {/* Основной текст - фиксированная позиция по центру */}
        <div className="absolute left-1/2 top-1/2 mt-16 w-[550px] -translate-x-1/2 -translate-y-1/2 transform px-8 text-center font-styrene text-paragraph-md font-bold uppercase text-adaptive">
          <span>
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
        <div className="absolute left-1/2 top-1/2 mt-44 -translate-x-1/2 -translate-y-1/2 transform">
          <Button.Root onClick={handleSkipIntro}>Let's GO</Button.Root>
        </div>
      </div>

      {/* Skip кнопка */}
      <IconButton.Root
        onClick={handleSkipIntro}
        position="absolute"
        iconPosition="end"
        icon={<ArrowRightIcon size={16} />}
      >
        SKIP INTRO
      </IconButton.Root>

      {/* Scroll Indicator - внутри dark-container для правильной темы */}
      <div
        className="c-introduction_scroll-indicator text-adaptive visible"
      ></div>
    </div>
  );
}
