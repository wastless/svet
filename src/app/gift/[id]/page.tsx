"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import * as Button from "~/components/ui/button";
import { loadGiftContent } from "@/utils/lib/giftContent";
import { PolaroidPhoto } from "~/components/gallery/polaroid-photo";
import { GiftContentRenderer } from "~/components/gift-blocks";
import type { MemoryPhoto, Gift } from "@/utils/types/gift";
import { NoiseBackground } from "~/components/home/NoiseBackground";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSearchParams, useParams } from "next/navigation";
import { DiceTransition } from "~/components/dice/DiceTransition";

interface GiftPageProps {
  params: { id: string };
}

// Расширяем тип Gift для совместимости с данными из БД
interface DBGift extends Omit<Gift, 'codeText'> {
  codeText: string | null;
}

// Расширяем тип MemoryPhoto для совместимости с данными из БД
interface DBMemoryPhoto extends Omit<MemoryPhoto, 'gift'> {
  gift?: DBGift;
}

// Объединенный тип с данными подарка и контента
interface GiftData {
  gift: Gift;
  memoryPhoto?: MemoryPhoto;
  content: any;
  isAuthenticated: boolean;
}

export default function GiftPage() {
  // Используем хук useParams для получения параметров URL
  const params = useParams();
  const giftId = params.id as string;
  const searchParams = useSearchParams();
  
  // Проверяем, пришел ли пользователь с главной страницы с кнопки "Let's GO"
  const fromHome = searchParams.get('from') === 'home';
  
  // Состояние для хранения данных
  const [giftData, setGiftData] = useState<GiftData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchGiftData = async () => {
      try {
        setIsLoading(true);
        
        // Получаем данные подарка по ID
        const res = await fetch(`/api/gifts/${giftId}`);
        if (!res.ok) {
          throw new Error('Failed to load gift data');
        }
        
        const gift = await res.json() as DBGift & { memoryPhoto: DBMemoryPhoto | null };
        
        // Проверяем авторизацию пользователя
        const authRes = await fetch('/api/auth/session');
        const session = await authRes.json();
        const isAuthenticated = !!session?.user;
        
        // Загружаем контент поздравления
        const contentRes = await fetch(`/api/gift-content/${giftId}`);
        if (!contentRes.ok) {
          throw new Error('Failed to load gift content');
        }
        
        const content = await contentRes.json();
        
        // Преобразуем gift в тип, совместимый с ожидаемым типом Gift
        const typedGift: Gift = {
          ...gift,
          codeText: gift.codeText || "", // Преобразуем null в пустую строку
        };
        
        // Преобразуем memoryPhoto в правильный тип, если оно существует
        const typedMemoryPhoto: MemoryPhoto | undefined = gift.memoryPhoto 
          ? {
              ...gift.memoryPhoto,
              gift: typedGift,
            }
          : undefined;
        
        setGiftData({
          gift: typedGift,
          memoryPhoto: typedMemoryPhoto,
          content,
          isAuthenticated
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading gift data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load data'));
        setIsLoading(false);
      }
    };
    
    fetchGiftData();
  }, [giftId]);
  
  // Эффект для запуска анимации после загрузки данных
  useEffect(() => {
    if (!giftData || isLoading || !showContent) return;
    
    // Создаем главный таймлайн
    const tl = gsap.timeline({
      defaults: { 
        ease: "power3.out",
        duration: 0.5 // Ускоряем все анимации
      }
    });
    
    // Анимация всей страницы
    tl.to(pageRef.current, { opacity: 1, duration: 0.2 });
    
    // Анимация заголовка и номера
    tl.fromTo(
      headerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1 }
    );
    
    tl.fromTo(
      numberRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.4" // Ускоряем начало анимации
    );
    
    // Анимация цитаты
    tl.fromTo(
      quoteRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.3"
    );
    
    // Анимация изображения и текста подсказки
    tl.fromTo(
      imageContainerRef.current,
      { 
        y: 50, 
        opacity: 0,
        scale: 0.9
      },
      { 
        y: 0, 
        opacity: 1,
        scale: 1
      },
      "-=0.2"
    );
    
    tl.fromTo(
      hintTextRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.4"
    );
    
    // Анимация секретного кода (если есть)
    if (codeTextRef.current && codeRef.current) {
      tl.fromTo(
        codeTextRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.3"
      );
      
      tl.fromTo(
        codeRef.current,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1 },
        "-=0.4"
      );
    }
    
    // Анимация разделителя
    tl.fromTo(
      dividerRef.current,
      { opacity: 0 },
      { opacity: 1 },
      "-=0.2"
    );
    
    // Анимация контента поздравления
    tl.fromTo(
      contentRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.2"
    );
    
    // Анимация секции воспоминаний
    tl.fromTo(
      memoryHeaderRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.2"
    );
    
    if (memoryPhotoRef.current) {
      tl.fromTo(
        memoryPhotoRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        "-=0.4"
      );
    }
    
    tl.fromTo(
      buttonRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.5"
    );
    
    return () => {
      // Очищаем анимации при размонтировании
      tl.kill();
    };
  }, [giftData, isLoading, showContent]);
  
  // Если данные загружаются, показываем скрытый контейнер вместо спиннера
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white opacity-0"></div>
    );
  }
  
  // Если произошла ошибка
  if (error || !giftData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-4">
        <h1 className="text-title-h4 mb-4 font-founders">Oops, something went wrong</h1>
        <p className="text-paragraph-md mb-6 font-styrene">We couldn't load the gift. Please try again later.</p>
        <Link href="/">
          <Button.Root>Back to Home</Button.Root>
        </Link>
      </div>
    );
  }
  
  const { gift, memoryPhoto, content, isAuthenticated } = giftData;

  return (
    <>
      {/* Анимация кубика, если пришли с главной страницы */}
      {showDiceTransition && (
        <DiceTransition 
          onTransitionComplete={handleDiceTransitionComplete} 
          giftId={giftId}
        />
      )}
      
      {/* Основной контент страницы */}
      {showContent && (
        <div ref={pageRef} className="min-h-screen bg-white text-adaptive opacity-0">
          <div className="flex flex-col gap-2 py-24 text-center font-founders">
            <h1 ref={headerRef} className="text-title-h4">
              YOUR GIFT <br /> OF THE DAY
            </h1>
            <div ref={numberRef} className="text-title-h5">({gift.number})</div>
          </div>

          <div className="flex flex-col items-center justify-center gap-8">
            <div ref={quoteRef} className="text-center font-nyghtserif text-label-lg italic">
              „{gift.englishDescription}"
            </div>

            <div className="mx-auto flex max-w-[320px] flex-col items-center gap-6">
              <div ref={imageContainerRef} className="w-full aspect-square rounded-2xl overflow-hidden">
                <img
                  src={gift.hintImageUrl}
                  className="w-full h-full object-cover"
                />
              </div>
              <p ref={hintTextRef} className="font-styrene text-paragraph-md font-bold uppercase text-center">
                {gift.hintText}
              </p>
            </div>
          </div>

          {/* Секретный код (если есть) - только для авторизованных пользователей */}
          {gift.code && isAuthenticated && (
            <div className="pt-24 flex flex-col items-center gap-5 text-center">
              <p ref={codeTextRef} className="mx-auto max-w-[440px] font-styrene text-paragraph-md font-bold uppercase">
              {gift.codeText}
              </p>
              <div ref={codeRef} className="font-founders text-title-h4 uppercase">
                {gift.code}
              </div>
            </div>
          )}

          {/* Заглушка для неавторизованных пользователей */}
          {gift.code && !isAuthenticated && (
            <div className="pt-24 flex flex-col items-center gap-5 text-center">
              <p ref={codeTextRef} className="mx-auto max-w-[440px] font-styrene text-paragraph-md font-bold uppercase">
                {gift.codeText}
              </p>
              <div ref={codeRef} className="font-founders text-title-h4 uppercase text-bg-strong-950 bg-bg-strong-950 select-none px-4">
                SECRET CODE
              </div>
            </div>
          )}

          <span ref={dividerRef} className="text-label-xl my-20 flex items-center justify-center font-nyghtserif">
            ***
          </span>

          {/* Контент поздравления */}
          <div ref={contentRef} className="py-16 text-adaptive bg-bg-strong-950 dark-container">
            <div className="mx-auto max-w-4xl">
              {gift.isSecret && !isAuthenticated ? (
                <div className="text-center">
                  <p className="text-adaptive text-title-h3 font-founders uppercase max-w-[460px] mx-auto">
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
          <div className="text-adaptive dark-container bg-bg-strong-950 pt-20 pb-28 text-center flex flex-col items-center gap-10">
            <span className="text-adaptive text-label-xl font-nyghtserif">
              ***
            </span>
            <h2 ref={memoryHeaderRef} className="text-adaptive text-title-h4 font-founders">
              THE MEMORY <br /> IS UNLOCKED
            </h2>
            
            {memoryPhoto && (
              <div ref={memoryPhotoRef}>
                <Link href="/gallery" className="mx-auto cursor-pointer transition-all">
                  <PolaroidPhoto
                    memoryPhoto={memoryPhoto}
                    isRevealed={true}
                    openDate={gift.openDate}
                    size="medium"
                  />
                </Link>
              </div>
            )}
            
            <div ref={buttonRef}>
              <Link href="/gallery">
                <Button.Root>to the gallery</Button.Root>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
