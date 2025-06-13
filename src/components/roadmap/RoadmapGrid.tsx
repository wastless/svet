"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RoadmapItem } from "./RoadmapItem";
import type { Gift } from "@prisma/client";
import { isGiftOpen, getGiftWeek } from "@/utils/hooks/gift-helpers";
import * as IconButton from "~/components/ui/icon-button";
import { WORD_SYSTEM, COUNTDOWN_CONFIG } from "@/utils/data/constants";
import { useGifts } from "@/utils/hooks/useDateContext";
import { EmblaCarousel } from "./EmblaCarousel";
import type { EmblaCarouselType } from "embla-carousel";

interface RoadmapGridProps {
  gifts: Gift[];
}

export function RoadmapGrid({ gifts }: RoadmapGridProps) {
  // Получаем дату подарков из контекста
  const { giftsDate } = useGifts();
  
  // Используем useRef вместо useState для активной недели, чтобы избежать перерисовки
  const activeWeekRef = useRef<number | null | 'target'>(null);
  // Реф для Embla API
  const emblaApiRef = useRef<EmblaCarouselType | null>(null);
  // Реф для кнопок навигации, чтобы обновлять их визуальное состояние без перерисовки
  const weekButtonsRef = useRef<HTMLDivElement>(null);
  // Реф для хранения таймера обновления навигации, чтобы избежать слишком частых обновлений
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Реф для хранения информации о том, вызван ли скролл программно
  const isProgrammaticScrollRef = useRef<boolean>(false);
  
  // Мемоизируем текущую дату, обновляя её только когда меняется день
  // Используем giftsDate, которая обновляется только раз в день
  const memoizedCurrentDate = useMemo(() => {
    if (!giftsDate) return null;
    
    // Создаем новую дату только с годом, месяцем и днем (без времени)
    const dateWithoutTime = new Date(
      giftsDate.getFullYear(),
      giftsDate.getMonth(),
      giftsDate.getDate()
    );
    
    return dateWithoutTime;
  }, [giftsDate]);
  
  // Мемоизируем сортированные подарки, чтобы они не пересоздавались при каждом рендере
  const sortedGifts = useMemo(() => {
    return [...gifts].sort((a, b) => 
      new Date(a.openDate).getTime() - new Date(b.openDate).getTime()
    );
  }, [gifts]);
  
  // Мемоизируем текущий активный подарок
  const currentActiveGift = useMemo(() => {
    // Находим последний открытый подарок (с самой поздней датой, но которая <= текущей даты)
    const lastOpenedGift = [...sortedGifts].reverse().find(gift => {
      const openDate = new Date(gift.openDate);
      return memoizedCurrentDate ? openDate <= memoizedCurrentDate : openDate <= new Date();
    });

    // Если есть открытый подарок, возвращаем его
    if (lastOpenedGift) {
      return lastOpenedGift;
    }
    
    // Если нет открытых подарков, возвращаем первый
    return sortedGifts[0];
  }, [sortedGifts, memoizedCurrentDate]);
  
  // Мемоизируем следующий подарок для открытия
  const nextGiftToOpen = useMemo(() => {
    return sortedGifts.find(gift => {
      const openDate = new Date(gift.openDate);
      return memoizedCurrentDate ? openDate > memoizedCurrentDate : openDate > new Date();
    }) || sortedGifts[0]; // Если все подарки уже открыты, показываем первый
  }, [sortedGifts, memoizedCurrentDate]);
  
  // Мемоизируем карту первых подарков для каждой недели
  const firstGiftByWeek = useMemo(() => {
    return sortedGifts.reduce<Record<number, Gift>>((acc, gift) => {
      const week = getGiftWeek(gift.openDate, WORD_SYSTEM.START_DATE);
      if (week !== null && !acc[week]) {
        acc[week] = gift;
      }
      return acc;
    }, {});
  }, [sortedGifts]);
  
  // Мемоизируем подарок, ближайший к дате дня рождения
  const targetDateGift = useMemo(() => {
    return sortedGifts.reduce<Gift | null>((closest, gift) => {
      const giftDate = new Date(gift.openDate);
      const targetDate = new Date(COUNTDOWN_CONFIG.TARGET_DATE);
      
      // Если closest еще не установлен или текущий подарок ближе к целевой дате
      if (!closest) return gift;
      
      const currentDiff = Math.abs(giftDate.getTime() - targetDate.getTime());
      const closestDiff = Math.abs(new Date(closest.openDate).getTime() - targetDate.getTime());
      
      return currentDiff < closestDiff ? gift : closest;
    }, null);
  }, [sortedGifts]);
  
  // Обновление визуального состояния кнопок недель без перерисовки
  const updateButtonsAppearance = useCallback((activeWeek: number | null | 'target') => {
    const weekButtons = weekButtonsRef.current?.children;
    if (!weekButtons) return;
    
    // Используем requestAnimationFrame для оптимизации обновлений DOM
    requestAnimationFrame(() => {
      // Проходим по всем кнопкам и обновляем их прозрачность
      for (let i = 0; i < weekButtons.length; i++) {
        const button = weekButtons[i] as HTMLElement;
        // Значение недели: null для ALL, 'target' для Day X, или номер недели
        let weekValue: number | null | 'target';
        if (i === 0) weekValue = null; // ALL
        else if (i === weekButtons.length - 1) weekValue = 'target'; // Day X
        else weekValue = i; // Номер недели
        
        if (weekValue === activeWeek) {
          button.style.opacity = '1';
        } else {
          button.style.opacity = '0.5';
        }
      }
    });
  }, []);
  
  // Определяет, какая неделя сейчас находится в центре видимой области
  const determineVisibleWeek = useCallback(() => {
    // Если Embla API не инициализировано, не можем определить видимую неделю
    if (!emblaApiRef.current) return null;
    
    // Получаем текущий индекс слайда
    const currentIndex = emblaApiRef.current.selectedScrollSnap();
    // Если не удалось получить индекс, возвращаем null
    if (currentIndex === undefined || currentIndex < 0) return null;
    
    // Получаем текущий подарок
    const currentGift = sortedGifts[currentIndex];
    if (!currentGift) return null;
    
    // Проверяем, это целевой подарок для Day X?
    if (targetDateGift && currentGift.id === targetDateGift.id) {
      return 'target';
    }
    
    // Иначе определяем неделю
    return getGiftWeek(currentGift.openDate, WORD_SYSTEM.START_DATE);
  }, [sortedGifts, targetDateGift]);
  
  // Функция для плавной анимации скролла к указанному индексу
  const animateScrollToIndex = useCallback((targetIndex: number) => {
    if (!emblaApiRef.current) return;
    
    // Получаем текущий индекс
    const currentIndex = emblaApiRef.current.selectedScrollSnap() || 0;
    
    // Если целевой индекс совпадает с текущим, ничего не делаем
    if (currentIndex === targetIndex) return;
    
    // Определяем направление скролла
    const direction = targetIndex > currentIndex ? 1 : -1;
    
    // Определяем количество шагов для анимации
    const distance = Math.abs(targetIndex - currentIndex);
    
    // Адаптируем количество шагов в зависимости от расстояния
    // для более плавной анимации на больших расстояниях
    const baseSteps = 10;
    const stepsMultiplier = Math.min(distance, 5); // Максимум 5x множитель
    const totalSteps = baseSteps + stepsMultiplier * 5; // Добавляем 5 шагов на каждый множитель
    
    // Анимация должна длиться примерно 500-800 мс, независимо от расстояния
    const stepDuration = 16; // примерно 60 fps
    const startTime = performance.now();
    const duration = 500 + distance * 30; // Базовые 500мс + 30мс на каждый элемент
    
    // Функция для пошаговой анимации с временной привязкой
    const animationStep = (currentTime: number) => {
      // Если API больше недоступно, прекращаем
      if (!emblaApiRef.current) return;
      
      // Вычисляем прогресс от 0 до 1 на основе времени
      const elapsed = currentTime - startTime;
      let progress = Math.min(elapsed / duration, 1);
      
      // Применяем функцию замедления (easing) для более естественного движения
      // Кубическая функция ease-out: t -> 1 - (1 - t)^3
      progress = 1 - Math.pow(1 - progress, 3);
      
      // Вычисляем промежуточный индекс
      const intermediateIndex = Math.round(currentIndex + direction * distance * progress);
      
      // Выполняем скролл к промежуточному индексу
      emblaApiRef.current.scrollTo(intermediateIndex, false);
      
      // Если анимация не завершена, планируем следующий кадр
      if (progress < 1) {
        requestAnimationFrame(animationStep);
      }
    };
    
    // Запускаем анимацию
    requestAnimationFrame(animationStep);
  }, []);
  
  // Прокрутка к подаркам выбранной недели с плавной анимацией
  const scrollToWeek = useCallback((week: number | null | 'target') => {
    // Если API Embla не инициализировано, не выполняем скролл
    if (!emblaApiRef.current) return;
    
    // Сохраняем активную неделю в реф, но не вызываем setState
    activeWeekRef.current = week;
    
    // Обновляем внешний вид кнопок
    updateButtonsAppearance(week);
    
    // Устанавливаем флаг программного скролла
    isProgrammaticScrollRef.current = true;
    
    // Находим индекс слайда для плавной прокрутки
    let targetIndex = 0;
    
    if (week === null) {
      // Если выбрано "ALL", скроллим к первому подарку
      targetIndex = 0;
    }
    else if (week === 'target' && targetDateGift) {
      // Если выбран Day X, скроллим к ближайшему к целевой дате подарку
      const targetGiftIndex = sortedGifts.findIndex(gift => gift.id === targetDateGift.id);
      if (targetGiftIndex !== -1) {
        targetIndex = targetGiftIndex;
      }
    }
    else {
      // Находим первый подарок нужной недели
      const firstGift = firstGiftByWeek[week as number];
      if (firstGift) {
        const giftIndex = sortedGifts.findIndex(gift => gift.id === firstGift.id);
        if (giftIndex !== -1) {
          targetIndex = giftIndex;
        }
      }
    }
    
    // Выполняем плавную анимацию скролла
    animateScrollToIndex(targetIndex);
    
    // Сбрасываем флаг программного скролла после анимации
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800); // Увеличенное время для полного завершения анимации
  }, [updateButtonsAppearance, firstGiftByWeek, sortedGifts, targetDateGift, animateScrollToIndex]);

  // Прокрутка к определенному подарку по его ID
  const scrollToGift = useCallback((gift: Gift) => {
    // Если API Embla не инициализировано, не выполняем скролл
    if (!emblaApiRef.current) return;
    
    // Устанавливаем флаг программного скролла
    isProgrammaticScrollRef.current = true;
    
    const giftIndex = sortedGifts.findIndex(g => g.id === gift.id);
    if (giftIndex !== -1) {
      // Сначала выполняем мгновенный скролл для быстрого отклика
      emblaApiRef.current.scrollTo(giftIndex, false);
      
      // Используем requestAnimationFrame для визуальных обновлений
      requestAnimationFrame(() => {
        const giftElement = document.getElementById(`gift-${gift.id}`);
        if (giftElement) {
          // Сначала очищаем класс у всех элементов
          document.querySelectorAll('.embla-current-gift').forEach(el => {
            el.classList.remove('embla-current-gift');
          });
          
          // Добавляем класс к выбранному подарку
          giftElement.classList.add('embla-current-gift');
        }
        
        // Обновляем активную неделю после скролла
        const week = getGiftWeek(gift.openDate, WORD_SYSTEM.START_DATE);
        // Если подарок является целевым для Day X
        if (gift.id === targetDateGift?.id) {
          activeWeekRef.current = 'target';
          updateButtonsAppearance('target');
        } else if (week !== null) {
          activeWeekRef.current = week;
          updateButtonsAppearance(week);
        }
        
        // Сбрасываем флаг программного скролла
        isProgrammaticScrollRef.current = false;
      });
    }
  }, [sortedGifts, updateButtonsAppearance, targetDateGift]);

  // Инициализация и глобальный обработчик скролла
  useEffect(() => {
    // Флаг для отслеживания, был ли уже выполнен начальный скролл
    let initialScrollPerformed = false;
    
    // Функция для прокрутки к текущему активному подарку
    const scrollToActiveGift = () => {
      if (!emblaApiRef.current || !currentActiveGift || initialScrollPerformed) return;
      
      // Помечаем, что скролл уже выполнен, чтобы избежать повторного скролла
      initialScrollPerformed = true;
      
      // Находим индекс текущего активного подарка
      const giftIndex = sortedGifts.findIndex(gift => gift.id === currentActiveGift.id);
      if (giftIndex !== -1) {
        // Устанавливаем флаг программного скролла
        isProgrammaticScrollRef.current = true;
        
        // Используем прямой скролл для быстроты (без анимации)
        emblaApiRef.current.scrollTo(giftIndex, false);
        
        // Добавляем класс к текущему активному подарку для визуального выделения
        requestAnimationFrame(() => {
          const giftElement = document.getElementById(`gift-${currentActiveGift.id}`);
          if (giftElement) {
            giftElement.classList.add('embla-current-gift');
          }
          
          // Обновляем активную неделю
          const week = getGiftWeek(currentActiveGift.openDate, WORD_SYSTEM.START_DATE);
          if (currentActiveGift.id === targetDateGift?.id) {
            activeWeekRef.current = 'target';
            updateButtonsAppearance('target');
          } else if (week !== null) {
            activeWeekRef.current = week;
            updateButtonsAppearance(week);
          }
          
          // Сбрасываем флаг программного скролла
          isProgrammaticScrollRef.current = false;
        });
      }
    };
    
    // Если Embla API уже доступен, сразу выполняем скролл
    if (emblaApiRef.current) {
      scrollToActiveGift();
    }
    
    // Запускаем резервную попытку скролла через короткий промежуток времени
    const fallbackTimer = setTimeout(scrollToActiveGift, 300);
    
    // Глобальный обработчик колесика мыши, работающий независимо от положения курсора
    function handleGlobalWheel(event: WheelEvent) {
      // Если API карусели не инициализирован, используем стандартное поведение
      if (!emblaApiRef.current) return;
      
      // Получаем прогресс прокрутки карусели
      const scrollProgress = emblaApiRef.current.scrollProgress();
      
      // Определяем направление скролла
      const scrollingDown = event.deltaY > 0;
      
      // Проверяем положение скролла страницы
      const isAtPageTop = window.scrollY <= 10; // Находимся в верхней части страницы
      const isAtPageBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10; // Находимся внизу страницы
      
      // Проверяем положение скролла карусели
      const isAtCarouselEnd = scrollProgress >= 0.8; // Достигли конца карусели
      const isAtCarouselStart = scrollProgress <= 0.01; // Находимся в начале карусели
      
      // Логика приоритета прокрутки
      if (scrollingDown) {
        // При скролле вниз:
        // Если не в конце карусели, всегда прокручиваем карусель
        if (!isAtCarouselEnd) {
          event.preventDefault();
          emblaApiRef.current.scrollNext();
          return;
        }
        // Если в конце карусели, позволяем обычный вертикальный скролл
        return;
      } else {
        // При скролле вверх:
        // Если не в начале страницы, позволяем обычный вертикальный скролл
        if (!isAtPageTop) return;
        
        // Если в начале страницы, но не в начале карусели, прокручиваем карусель
        if (!isAtCarouselStart) {
          event.preventDefault();
          emblaApiRef.current.scrollPrev();
          return;
        }
        // Если в начале страницы и в начале карусели, позволяем стандартное поведение
        return;
      }
    }
    
    // Добавляем глобальный обработчик с capture: true для перехвата событий до их достижения целевых элементов
    document.addEventListener('wheel', handleGlobalWheel, { passive: false, capture: true });
    
    // Очищаем обработчик при размонтировании
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel, { capture: true });
      // Очищаем таймер
      clearTimeout(fallbackTimer);
    };
  }, [emblaApiRef.current, currentActiveGift, sortedGifts, targetDateGift, updateButtonsAppearance]);

  // Форматируем дату для кнопки Day X
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  return (
    <div className="w-full">
      
      {/* Кнопки для навигации по неделям */}
      <div ref={weekButtonsRef} className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-6 mb-6 md:mb-8 px-2">
        <IconButton.Root 
          onClick={() => scrollToWeek(null)}
          className="opacity-50"
        >
          ALL
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(1)}
          className="opacity-50"
        >
          1 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(2)}
          className="opacity-50"
        >
          2 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(3)}
          className="opacity-50"
        >
          3 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(4)}
          className="opacity-50"
        >
          4 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek('target')}
          className="opacity-50"
        >
          DAY X
        </IconButton.Root>
      </div>

      {/* Горизонтальный скролл с подарками */}
      <div className="w-full overflow-hidden overflow-y-visible relative">
        <EmblaCarousel
          options={{
            dragFree: false,
            containScroll: false,
            align: 'start',
            loop: false,
            inViewThreshold: 0.5,
            skipSnaps: false,
            breakpoints: {
              '(max-width: 768px)': { 
                dragFree: false,
                align: 'center',
              }
            }
          }}
          emblaApiRef={emblaApiRef}
          onScroll={(progress: number) => {
            // Если программный скролл, не обновляем навигацию
            if (isProgrammaticScrollRef.current) return;
            
            // Очищаем предыдущий таймер, если он был
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            
            // Устанавливаем таймер для обновления навигации
            scrollTimeoutRef.current = setTimeout(() => {
              const visibleWeek = determineVisibleWeek();
              if (visibleWeek !== activeWeekRef.current) {
                activeWeekRef.current = visibleWeek;
                updateButtonsAppearance(visibleWeek);
              }
            }, 50);
          }}
          className="pb-4 px-2 sm:px-4 md:px-8 h-full"
        >
          {sortedGifts.map((gift) => {
            const week = getGiftWeek(gift.openDate, WORD_SYSTEM.START_DATE);
            const isTargetGift = gift.id === targetDateGift?.id;
            const isNextGift = gift.id === nextGiftToOpen?.id;
            const isCurrentGift = gift.id === currentActiveGift?.id;
            return (
              <div 
                key={gift.id} 
                id={`gift-${gift.id}`}
                className={`min-w-[320px] flex-shrink-0 overflow-visible ${isTargetGift ? 'ml-1' : ''} ${isTargetGift || isNextGift || isCurrentGift ? 'relative' : ''} mx-1`}
                data-week={week}
                data-target={isTargetGift ? 'true' : undefined}
                data-next={isNextGift ? 'true' : undefined}
                data-current={isCurrentGift ? 'true' : undefined}
              >
                <RoadmapItem
                  id={gift.id}
                  number={gift.number}
                  hintImageUrl={gift.hintImageUrl}
                  imageCover={gift.imageCover || ""}
                  openDate={gift.openDate}
                  title={gift.title || undefined}
                  isTargetDay={isTargetGift}
                />
              </div>
            );
          })}
          {/* Пустой элемент для отступа 100px в конце списка */}
          <div className="flex-shrink-0"></div>
        </EmblaCarousel>
      </div>
    </div>
  );
} 
