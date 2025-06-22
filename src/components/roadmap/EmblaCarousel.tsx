"use client";

import React, { useCallback, useEffect, useState, useRef, memo } from 'react';
import type { ReactNode, MutableRefObject } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaCarouselType, EmblaEventType } from 'embla-carousel';

interface EmblaCarouselProps {
  children: ReactNode;
  className?: string;
  options?: EmblaOptionsType;
  onScroll?: (progress: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  emblaApiRef?: MutableRefObject<EmblaCarouselType | null>;
}

// Используем memo для предотвращения лишних перерисовок
export const EmblaCarousel = memo(function EmblaCarousel({ 
  children, 
  className = '', 
  options = { 
    dragFree: true,
    containScroll: 'trimSnaps',
    align: 'start',
    loop: false 
  }, 
  onScroll,
  onDragStart,
  onDragEnd,
  emblaApiRef
}: EmblaCarouselProps) {
  // Определяем, является ли устройство мобильным
  const [isMobile, setIsMobile] = useState(false);
  
  // Проверяем тип устройства при монтировании
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(isTouchDevice);
    };
    
    // Проверяем при загрузке
    checkMobile();
    
    // Проверяем при изменении размера окна
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Применяем настройки в зависимости от типа устройства
  const mergedOptions = {
    ...options,
    draggable: isMobile // Включаем drag только на мобильных
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel(mergedOptions);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onEmblaScroll = useCallback(() => {
    if (!emblaApi) return;
    
    const progress = emblaApi.scrollProgress();
    setScrollProgress(progress);
    
    if (onScroll) {
      onScroll(progress);
    }
  }, [emblaApi, onScroll]);

  // Обработчик начала перетаскивания
  const onEmblaDragStart = useCallback(() => {
    if (onDragStart) {
      onDragStart();
    }
  }, [onDragStart]);

  // Обработчик окончания перетаскивания
  const onEmblaDragEnd = useCallback(() => {
    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  // Обновляем внешний ref с API, если он предоставлен
  useEffect(() => {
    if (emblaApi && emblaApiRef) {
      emblaApiRef.current = emblaApi;
      
      // Вызываем onScroll при инициализации
      if (onScroll) {
        const progress = emblaApi.scrollProgress();
        onScroll(progress);
      }
      
      // Добавляем слушатели событий
      emblaApi.on('scroll', onEmblaScroll);
      emblaApi.on('reInit', onEmblaScroll);
      
      // Добавляем обработчики для перетаскивания только на мобильных
      if (isMobile && onDragStart) {
        emblaApi.on('pointerDown', onEmblaDragStart as any);
      }
      if (isMobile && onDragEnd) {
        emblaApi.on('pointerUp', onEmblaDragEnd as any);
      }
      
      // Возвращаем функцию очистки
      return () => {
        emblaApi.off('scroll', onEmblaScroll);
        emblaApi.off('reInit', onEmblaScroll);
        
        // Удаляем обработчики для перетаскивания
        if (isMobile && onDragStart) {
          emblaApi.off('pointerDown', onEmblaDragStart as any);
        }
        if (isMobile && onDragEnd) {
          emblaApi.off('pointerUp', onEmblaDragEnd as any);
        }
      };
    }
  }, [emblaApi, emblaApiRef, onScroll, onEmblaScroll, onEmblaDragStart, onEmblaDragEnd, isMobile]);

  // Обработчик клавиатурных событий
  useEffect(() => {
    if (!emblaApi) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          emblaApi.scrollPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          emblaApi.scrollNext();
          break;
        case 'Home':
          e.preventDefault();
          emblaApi.scrollTo(0);
          break;
        case 'End':
          e.preventDefault();
          emblaApi.scrollTo(emblaApi.scrollSnapList()?.length - 1 || 0);
          break;
      }
    };
    
    // Добавляем обработчик только когда компонент в фокусе
    const element = emblaApi.rootNode();
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      
      // Делаем элемент фокусируемым
      element.setAttribute('tabindex', '0');
    }
    
    return () => {
      if (element) {
        element.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [emblaApi]);

  return (
    <div 
      ref={(node) => {
        containerRef.current = node;
        if (typeof emblaRef === 'function' && node) {
          emblaRef(node);
        }
      }}
      className={`overflow-hidden ${className} ${isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}
      data-testid="embla-carousel" 
      role="region" 
      aria-roledescription="carousel"
    >
      <div className="flex flex-row">
        {children}
      </div>
    </div>
  );
}); 