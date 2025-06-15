"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import * as Button from "~/components/ui/button";
import { PolaroidPhoto } from "~/components/gallery/polaroid-photo";
import { GiftContentRenderer } from "~/components/gift-blocks";
import type { MemoryPhoto, Gift } from "@/utils/types/gift";
import { NoiseBackground } from "~/components/home/NoiseBackground";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSearchParams, useParams } from "next/navigation";
import { DiceTransition } from "~/components/dice/DiceTransition";
import { useGiftData } from "@/utils/hooks/useGiftQueries";
import { useAuth } from "~/components/providers/auth-provider";
import { FullScreenLoader } from "~/components/ui/spinner";

// Расширяем тип Gift для совместимости с данными из БД
interface DBGift extends Omit<Gift, "codeText"> {
  codeText: string | null;
}

// Расширяем тип MemoryPhoto для совместимости с данными из БД
interface DBMemoryPhoto extends Omit<MemoryPhoto, "gift"> {
  gift?: DBGift;
}

// Хук для определения размера экрана
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);

      return () => media.removeEventListener("change", listener);
    }
  }, [query]);

  return matches;
}

export default function GiftPage() {
  // Определяем размер экрана
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Получаем ID подарка из параметров URL
  const params = useParams();
  const giftId = params.id as string;
  const searchParams = useSearchParams();

  // Проверяем, пришел ли пользователь с главной страницы с кнопки "Let's GO"
  const fromHome = searchParams.get("from") === "home";

  // Получаем данные подарка с использованием нового хука
  const {
    data: giftData,
    isLoading: isGiftLoading,
    error: giftError,
    refetch,
  } = useGiftData(giftId);

  // Получаем информацию об аутентификации
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Отслеживаем изменение статуса аутентификации
  const prevAuthStatus = useRef(isAuthenticated);

  // Состояние для управления анимациями
  const [showDiceTransition, setShowDiceTransition] = useState(fromHome);
  const [showContent, setShowContent] = useState(!fromHome);

  // Рефы для анимации
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const numberRef = useRef(null);
  const quoteRef = useRef(null);
  const imageContainerRef = useRef(null);
  const hintTextRef = useRef(null);
  const codeTextRef = useRef(null);
  const codeRef = useRef(null);
  const dividerRef = useRef(null);
  const contentRef = useRef(null);
  const memoryHeaderRef = useRef(null);
  const memoryPhotoRef = useRef(null);
  const buttonRef = useRef(null);

  // Обработчик завершения анимации кубика
  const handleDiceTransitionComplete = () => {
    setShowDiceTransition(false);
    setShowContent(true);
  };

  // Эффект для запуска анимации после загрузки данных
  useEffect(() => {
    if (!giftData || isGiftLoading || !showContent) return;

    // Создаем главный таймлайн
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
        duration: 0.4,
      },
    });

    // Сначала скрываем все элементы кроме заголовка
    gsap.set(
      [
        numberRef.current,
        quoteRef.current,
        imageContainerRef.current,
        hintTextRef.current,
        codeTextRef.current,
        codeRef.current,
        dividerRef.current,
        contentRef.current,
        memoryHeaderRef.current,
        memoryPhotoRef.current,
        buttonRef.current,
      ],
      { opacity: 0 },
    );

    // Проверяем, откуда пользователь перешел на страницу
    if (fromHome) {
      // Полная анимация для перехода с главной страницы

      // 1. Анимация всей страницы и большого заголовка по центру
      tl.to(pageRef.current, { opacity: 1, duration: 0.1 })
        .fromTo(
          headerRef.current,
          {
            opacity: 0,
            scale: isMobile ? 1.5 : 3.5,
            y: "30vh",
          },
          {
            opacity: 1,
            scale: isMobile ? 1.5 : 3.5,
            y: "30vh",
            duration: 0.5,
          },
        )
        // Пауза для отображения увеличенного заголовка
        .to(headerRef.current, { scale: isMobile ? 1.5 : 3.5, duration: 0.2 })

        // 2. Заголовок уменьшается и перемещается на свое место, появляется номер и описание
        .to(headerRef.current, {
          scale: 1,
          y: 0,
          duration: 0.6,
        });
    } else {
      // Упрощенная анимация для обычного перехода

      // Сразу показываем заголовок на его месте
      gsap.set(headerRef.current, { opacity: 1 });

      // Только анимируем появление страницы
      tl.to(pageRef.current, { opacity: 1, duration: 0.2 });
    }

    // Общая анимация для всех элементов, независимо от источника перехода
    tl.fromTo(
      numberRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.2 },
      "-=0.1",
    )
      .fromTo(
        quoteRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        "=0.1",
      )

      // 3. Появление остального контента
      .fromTo(
        imageContainerRef.current,
        {
          y: 50,
          opacity: 0,
          scale: 0.9,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
        },
      )
      .fromTo(
        hintTextRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        "-=0.2",
      );

    // Пауза перед показом кода (если есть)
    tl.to({}, { duration: 0.1 });

    // Анимация секретного кода (если есть)
    if (codeTextRef.current && codeRef.current) {
      tl.fromTo(
        codeTextRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.1",
      );

      tl.fromTo(
        codeRef.current,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1 },
        "-=0.2",
      );
    }

    // Анимация разделителя (всегда показываем)
    tl.fromTo(
      dividerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3 },
      "-=0.2",
    );

    // Сразу отображаем остальные элементы без анимации
    gsap.set(
      [
        contentRef.current,
        memoryHeaderRef.current,
        memoryPhotoRef.current,
        buttonRef.current,
      ],
      { opacity: 1, y: 0 },
    );

    return () => {
      // Очищаем анимации при размонтировании
      tl.kill();
    };
  }, [giftData, isGiftLoading, showContent, fromHome]);

  // Реферешим данные если изменился статус аутентификации
  useEffect(() => {
    // Только если данные уже были загружены и статус аутентификации изменился
    if (
      giftData &&
      !isGiftLoading &&
      prevAuthStatus.current !== isAuthenticated
    ) {
      console.log("🔄 Authentication status changed, refreshing data");
      prevAuthStatus.current = isAuthenticated;
      refetch();
    }
  }, [isAuthenticated, refetch, giftData, isGiftLoading]);

  // Показываем ошибку, если не удалось загрузить данные
  if (giftError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-founders text-title-h2">ERROR</h2>
          <p className="mt-4 font-styrene text-paragraph-md font-bold uppercase">
            Couldn't upload gift data
          </p>
          <div className="mt-8">
            <Button.Root asChild>
              <Link href="/">Go Home</Link>
            </Button.Root>
          </div>
        </div>
      </div>
    );
  }

  // Показываем лоадер во время загрузки
  const isLoading = isGiftLoading || isAuthLoading;
  if (isLoading || !giftData) {
    return <FullScreenLoader />;
  }

  const { gift, content } = giftData;
  // Убедимся, что у нас есть все необходимые данные
  if (!gift) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-founders text-title-h2">ERROR</h2>
          <p className="mt-4 font-styrene text-paragraph-md font-bold uppercase">
            Couldn't upload gift data
          </p>
          <div className="mt-8">
            <Button.Root asChild>
              <Link href="/">Go Home</Link>
            </Button.Root>
          </div>
        </div>
      </div>
    );
  }

  // Получаем memoryPhoto из giftData, может быть undefined
  const memoryPhoto = giftData.memoryPhoto;

  return (
    <div className="relative bg-bg-white-0">
      {/* Показываем анимацию кубика, если пользователь пришел с главной */}
      {showDiceTransition && (
        <DiceTransition onComplete={handleDiceTransitionComplete} />
      )}

      {/* Основной контент подарка */}
      {showContent && (
        <main
          ref={pageRef}
          className="relative min-h-screen bg-bg-white-0 opacity-0"
        >
          <div className="flex flex-col gap-2 py-24 text-center font-founders">
            <h1 ref={headerRef} className="text-title-h4">
              YOUR GIFT <br /> OF THE DAY
            </h1>
            <div ref={numberRef} className="text-title-h5">
              ({gift.number})
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <div
              ref={quoteRef}
              className="mx-auto max-w-xs text-center font-nyghtserif text-label-md italic sm:max-w-md md:max-w-lg md:text-label-lg"
            >
              &ldquo;{gift.englishDescription}&rdquo;
            </div>

            <div className="mx-auto flex w-full max-w-[280px] flex-col items-center gap-3 sm:max-w-[320px] sm:gap-4">
              <div
                ref={imageContainerRef}
                className="aspect-square w-full overflow-hidden rounded-2xl"
              >
                <img
                  src={gift.hintImageUrl}
                  alt={gift.hintText || "Gift hint image"}
                  className="h-full w-full object-cover"
                />
              </div>
              <p
                ref={hintTextRef}
                className="text-center font-styrene text-paragraph-sm font-bold uppercase md:text-paragraph-md md:font-bold"
              >
                {gift.hintText}
              </p>
            </div>
          </div>

          {/* Секретный код (если есть) - только для авторизованных пользователей */}
          {gift.code && isAuthenticated && (
            <div className="flex flex-col items-center gap-3 px-4 pt-24 text-center sm:gap-4 sm:pt-20 md:pt-24">
              <p
                ref={codeTextRef}
                className="mx-auto max-w-[300px] font-styrene text-paragraph-sm font-bold uppercase sm:max-w-[380px] md:max-w-[440px] md:text-paragraph-md md:font-bold lg:font-bold"
              >
                {gift.codeText}
              </p>
              <div
                ref={codeRef}
                className="font-founders text-title-h4 uppercase"
              >
                {gift.code}
              </div>
            </div>
          )}

          {/* Заглушка для неавторизованных пользователей */}
          {gift.code && !isAuthenticated && (
            <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center sm:gap-5 sm:pt-20 md:pt-24">
              <p
                ref={codeTextRef}
                className="mx-auto max-w-[300px] font-styrene text-paragraph-sm font-bold uppercase sm:max-w-[380px] md:max-w-[440px] md:text-paragraph-md md:font-bold lg:font-bold"
              >
                {gift.codeText}
              </p>
              <div
                ref={codeRef}
                className="select-none bg-bg-strong-950 px-4 font-founders text-title-h4 uppercase text-bg-strong-950"
              >
                SECRET CODE
              </div>
            </div>
          )}

          <span
            ref={dividerRef}
            className="mb-6 mt-16 flex items-center justify-center font-nyghtserif text-label-lg text-adaptive sm:text-label-xl md:mb-20 md:mt-20"
          >
            ***
          </span>

          {/* Контент поздравления */}
          <div
            ref={contentRef}
            className="dark-container bg-bg-strong-950 px-4 py-12 text-adaptive sm:px-6 sm:py-14 md:py-16"
          >
            <div className="mx-auto max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              {gift.isSecret && !isAuthenticated ? (
                <div className="text-center">
                  <p className="mx-auto max-w-[290px] font-founders text-title-h4 uppercase text-adaptive md:max-w-[460px] md:text-title-h3">
                    Oops, only Lesya sees this content
                  </p>
                </div>
              ) : (
                /* Рендер блоков контента*/
                content && (
                  <GiftContentRenderer
                    content={content}
                    memoryPhoto={memoryPhoto}
                    className="max-w-none"
                    gift={gift}
                  />
                )
              )}
            </div>
          </div>

          {/* Memory unlock секция */}
          <div className="dark-container flex flex-col items-center gap-6 bg-bg-strong-950 px-4 pb-16 pt-12 text-center text-adaptive sm:gap-8 sm:pb-20 sm:pt-16 md:gap-10 md:pb-28 md:pt-20">
            <span className="font-nyghtserif text-adaptive sm:text-label-lg md:text-label-xl">
              ***
            </span>
            <h2
              ref={memoryHeaderRef}
              className="font-founders text-title-h4 text-adaptive"
            >
              THE MEMORY <br /> IS UNLOCKED
            </h2>

            {memoryPhoto && (
              <div
                ref={memoryPhotoRef}
                className="mx-auto flex w-full items-center justify-center"
              >
                <Link
                  href="/gallery"
                  className="flex items-center justify-center transition-all"
                >
                  <PolaroidPhoto
                    memoryPhoto={memoryPhoto}
                    isRevealed={true}
                    openDate={gift.openDate}
                    size={isMobile ? "small" : "medium"}
                  />
                </Link>
              </div>
            )}

            <div ref={buttonRef} className="mt-2 sm:mt-4">
              <Link href="/gallery">
                <Button.Root>to the gallery</Button.Root>
              </Link>
            </div>
          </div>

          {/* Дополнительный темный блок для заполнения пустого пространства внизу */}
          <div className="h-16 bg-bg-strong-950"></div>
        </main>
      )}
    </div>
  );
}
