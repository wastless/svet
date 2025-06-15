"use client";

import React, { useCallback, useEffect, useState, useRef, memo } from 'react';
import type { ReactNode, MutableRefObject } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';

interface EmblaCarouselProps {
  children: ReactNode;
  className?: string;
  options?: EmblaOptionsType;
  onScroll?: (progress: number) => void;
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
  emblaApiRef
}: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
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
      
      // Возвращаем функцию очистки
      return () => {
        emblaApi.off('scroll', onEmblaScroll);
        emblaApi.off('reInit', onEmblaScroll);
      };
    }
  }, [emblaApi, emblaApiRef, onScroll, onEmblaScroll]);

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
      className={`overflow-hidden ${className} cursor-grab active:cursor-grabbing`}
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