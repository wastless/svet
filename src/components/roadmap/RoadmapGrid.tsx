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
import { useAuth } from "~/components/providers/auth-provider";

// Константы для дат недель
const WEEK_DATES = {
  WEEK_1: '2025-07-01', // 1 июля
  WEEK_2: '2025-07-07', // 7 июля
  WEEK_3: '2025-07-14', // 14 июля
  WEEK_4: '2025-07-21', // 21 июля
  WEEK_5: '2025-07-28', // 28 июля
};

interface RoadmapGridProps {
  gifts: Gift[];
}

export function RoadmapGrid({ gifts }: RoadmapGridProps) {
  // Получаем дату подарков из контекста
  const { giftsDate } = useGifts();
  // Получаем информацию о пользователе
  const { user } = useAuth();
  const isAdmin = user?.username === "admin";
  
  // Используем useRef вместо useState для активной недели, чтобы избежать перерисовки
  const activeWeekRef = useRef<number | 'target'>(0);
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
    
    // Сохраняем полную дату с временем
    return giftsDate;
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
      // Используем полное сравнение дат с учетом времени
      return memoizedCurrentDate ? openDate <= memoizedCurrentDate : openDate <= new Date();
    });

    // Если есть открытый подарок или пользователь админ, возвращаем его
    if (lastOpenedGift || isAdmin) {
      return lastOpenedGift || sortedGifts[0];
    }
    
    // Если нет открытых подарков, возвращаем первый
    return sortedGifts[0];
  }, [sortedGifts, memoizedCurrentDate, isAdmin]);
  
  // Мемоизируем следующий подарок для открытия
  const nextGiftToOpen = useMemo(() => {
    // Если пользователь админ, все подарки уже открыты
    if (isAdmin) {
      return sortedGifts[0]; // Возвращаем первый подарок
    }
    
    return sortedGifts.find(gift => {
      const openDate = new Date(gift.openDate);
      // Используем полное сравнение дат с учетом времени
      return memoizedCurrentDate ? openDate > memoizedCurrentDate : openDate > new Date();
    }) || sortedGifts[0]; // Если все подарки уже открыты, показываем первый
  }, [sortedGifts, memoizedCurrentDate, isAdmin]);
  
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
  const targetDateGift = useMemo((): Gift | undefined => {
    if (!sortedGifts.length) return undefined;
    
    // Получаем целевую дату (день рождения)
    const targetDateObj = new Date(COUNTDOWN_CONFIG.TARGET_DATE);
    
    // Создаем дату без времени для сравнения
    const targetDateWithoutTime = new Date(
      targetDateObj.getFullYear(),
      targetDateObj.getMonth(),
      targetDateObj.getDate()
    );
    
    // Сначала ищем точное совпадение по дате (без учета времени)
    const exactMatch = sortedGifts.find(gift => {
      const giftDate = new Date(gift.openDate);
      return (
        giftDate.getFullYear() === targetDateWithoutTime.getFullYear() &&
        giftDate.getMonth() === targetDateWithoutTime.getMonth() &&
        giftDate.getDate() === targetDateWithoutTime.getDate()
      );
    });
    
    // Если нашли точное совпадение, возвращаем его
    if (exactMatch) return exactMatch;
    
    // Иначе ищем ближайший подарок по дате
    if (sortedGifts.length === 0) return undefined;
    
    return sortedGifts.reduce<Gift>((closest, gift) => {
      // Создаем дату подарка без времени
      const giftDate = new Date(gift.openDate);
      const giftDateWithoutTime = new Date(
        giftDate.getFullYear(),
        giftDate.getMonth(),
        giftDate.getDate()
      );
      
      // Если closest еще не установлен, возвращаем текущий подарок
      if (!closest) return gift;
      
      // Вычисляем разницу в миллисекундах между датами (без времени)
      const closestDate = new Date(closest.openDate);
      const closestDateWithoutTime = new Date(
        closestDate.getFullYear(),
        closestDate.getMonth(),
        closestDate.getDate()
      );
      
      const currentDiff = Math.abs(giftDateWithoutTime.getTime() - targetDateWithoutTime.getTime());
      const closestDiff = Math.abs(closestDateWithoutTime.getTime() - targetDateWithoutTime.getTime());
      
      return currentDiff < closestDiff ? gift : closest;
    }, sortedGifts[0]!);
  }, [sortedGifts]);
  
  // Обновление визуального состояния кнопок недель без перерисовки
  const updateButtonsAppearance = useCallback((activeWeek: number | 'target') => {
    const weekButtons = weekButtonsRef.current?.children;
    if (!weekButtons) return;
    
    // Сначала деактивируем все кнопки
    for (let i = 0; i < weekButtons.length; i++) {
      const button = weekButtons[i] as HTMLElement;
      
      // Сбрасываем стили для всех кнопок
      button.style.setProperty('opacity', '0.5', '');
      button.classList.remove('active-tab');
      
      // Сбрасываем подчеркивания
      const underlines = button.querySelectorAll('span[class*="underline"]');
      underlines.forEach((underline) => {
        const elem = underline as HTMLElement;
        elem.style.removeProperty('width');
      });
    }
    
    // Затем активируем только нужную кнопку
    for (let i = 0; i < weekButtons.length; i++) {
      const button = weekButtons[i] as HTMLElement;
      
      // Значение недели: 0-4 для недель 1-5, 'target' для Day X
      let weekValue: number | 'target';
      if (i === weekButtons.length - 1) weekValue = 'target'; // Day X
      else weekValue = i; // Номер недели (0-4)
      
      if (weekValue === activeWeek) {
        // Активная кнопка
        button.style.setProperty('opacity', '1', 'important');
        button.classList.add('active-tab');
        
        // Находим все подчеркивания и делаем их видимыми
        const underlines = button.querySelectorAll('span[class*="underline"]');
        underlines.forEach((underline) => {
          const elem = underline as HTMLElement;
          elem.style.setProperty('width', '50%', 'important');
        });
        
        // Прерываем цикл, так как нашли нужную кнопку
        break;
      }
    }
  }, []);
  
  // Сбрасывает активное состояние всех вкладок
  const deactivateAllTabs = useCallback(() => {
    const weekButtons = weekButtonsRef.current?.children;
    if (!weekButtons) return;
    
    // Проходим по всем кнопкам и сбрасываем их состояние
    for (let i = 0; i < weekButtons.length; i++) {
      const button = weekButtons[i] as HTMLElement;
      
      // Делаем кнопку неактивной
      button.style.setProperty('opacity', '0.5', '');
      button.classList.remove('active-tab');
      
      // Сбрасываем стили для подчеркиваний
      const underlines = button.querySelectorAll('span[class*="underline"]');
      underlines.forEach((underline) => {
        const elem = underline as HTMLElement;
        elem.style.removeProperty('width');
      });
    }
    
    // Сбрасываем активную неделю в реф
    activeWeekRef.current = 0;
  }, []);
  
  // Определяет, какая неделя сейчас находится в центре видимой области
  const determineVisibleWeek = useCallback(() => {
    // Если Embla API не инициализировано, не можем определить видимую неделю
    if (!emblaApiRef.current) return 0; // По умолчанию первая неделя
    
    // Получаем текущий индекс слайда
    const currentIndex = emblaApiRef.current.selectedScrollSnap();
    // Если не удалось получить индекс, возвращаем 0 (первая неделя)
    if (currentIndex === undefined || currentIndex < 0) return 0;
    
    // Получаем текущий подарок
    const currentGift = sortedGifts[currentIndex];
    if (!currentGift) return 0; // По умолчанию первая неделя
    
    // Проверяем, это целевой подарок для Day X?
    if (targetDateGift && currentGift.id === targetDateGift.id) {
      return 'target';
    }
    
    // Определяем неделю текущего подарка
    const week = getGiftWeek(currentGift.openDate, WORD_SYSTEM.START_DATE);
    
    // Возвращаем номер недели (0-4) или 0, если неделя не определена
    return week !== null ? week : 0;
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
  
  // Функция для нахождения подарка, ближайшего к указанной дате
  const findGiftByDate = useCallback((targetDateStr: string): Gift => {
    if (!sortedGifts.length) {
      throw new Error("Нет доступных подарков для поиска");
    }
    
    const targetDate = new Date(targetDateStr);
    
    // Сначала ищем точное совпадение по дате
    const exactMatch = sortedGifts.find(gift => {
      const giftDate = new Date(gift.openDate);
      return (
        giftDate.getFullYear() === targetDate.getFullYear() &&
        giftDate.getMonth() === targetDate.getMonth() &&
        giftDate.getDate() === targetDate.getDate()
      );
    });
    
    // Если нашли точное совпадение, возвращаем его
    if (exactMatch) return exactMatch;
    
    // Иначе ищем ближайший подарок по дате (не раньше указанной даты)
    const futureGifts = sortedGifts.filter(gift => {
      const giftDate = new Date(gift.openDate);
      return giftDate >= targetDate;
    });
    
    if (futureGifts.length > 0) {
      // Возвращаем первый подарок после указанной даты
      return futureGifts[0]!;
    }
    
    // Если нет подарков после указанной даты, возвращаем последний доступный
    return sortedGifts[sortedGifts.length - 1]!;
  }, [sortedGifts]);
  
  // Прокрутка к подаркам выбранной недели с плавной анимацией
  const scrollToWeek = useCallback((week: number | 'target') => {
    // Если API Embla не инициализировано или нет подарков, не выполняем скролл
    if (!emblaApiRef.current || sortedGifts.length === 0) return;
    
    // Сохраняем активную неделю в реф
    activeWeekRef.current = week;
    
    // Обновляем внешний вид кнопок - вызываем немедленно для мгновенного отклика UI
    updateButtonsAppearance(week);
    
    // Устанавливаем флаг программного скролла
    isProgrammaticScrollRef.current = true;
    
    // Находим индекс слайда для плавной прокрутки
    let targetIndex = 0;
    
    try {
      if (week === 0) {
        // Если выбрана неделя 1, скроллим к подарку от 1 июля
        const firstWeekGift = findGiftByDate(WEEK_DATES.WEEK_1);
        targetIndex = sortedGifts.findIndex(gift => gift.id === firstWeekGift.id);
      }
      else if (week === 'target') {
        // Если выбран Day X, скроллим к ближайшему к целевой дате подарку
        if (targetDateGift) {
          targetIndex = sortedGifts.findIndex(gift => gift.id === targetDateGift.id);
        } else {
          // Если targetDateGift не определен, используем дату из констант
          const targetGift = findGiftByDate(COUNTDOWN_CONFIG.TARGET_DATE);
          targetIndex = sortedGifts.findIndex(gift => gift.id === targetGift.id);
        }
      }
      else if (week === 1) {
        // Неделя 2: с 7 по 13 июля
        const secondWeekGift = findGiftByDate(WEEK_DATES.WEEK_2);
        targetIndex = sortedGifts.findIndex(gift => gift.id === secondWeekGift.id);
      }
      else if (week === 2) {
        // Неделя 3: с 14 по 20 июля
        const thirdWeekGift = findGiftByDate(WEEK_DATES.WEEK_3);
        targetIndex = sortedGifts.findIndex(gift => gift.id === thirdWeekGift.id);
      }
      else if (week === 3) {
        // Неделя 4: с 21 по 27 июля
        const fourthWeekGift = findGiftByDate(WEEK_DATES.WEEK_4);
        targetIndex = sortedGifts.findIndex(gift => gift.id === fourthWeekGift.id);
      }
      else if (week === 4) {
        // Неделя 5: с 28 по 31 июля
        const fifthWeekGift = findGiftByDate(WEEK_DATES.WEEK_5);
        targetIndex = sortedGifts.findIndex(gift => gift.id === fifthWeekGift.id);
      }
    } catch (error) {
      console.error("Ошибка при поиске подарка по дате:", error);
      targetIndex = 0; // В случае ошибки скроллим к первому подарку
    }
    
    // Если индекс не найден, используем первый подарок
    if (targetIndex === -1) targetIndex = 0;
    
    // Выполняем плавную анимацию скролла
    animateScrollToIndex(targetIndex);
    
    // Сбрасываем флаг программного скролла после анимации
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800); // Увеличенное время для полного завершения анимации
  }, [updateButtonsAppearance, sortedGifts, targetDateGift, animateScrollToIndex, findGiftByDate]);

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
          
          // Сбрасываем флаг программного скролла
          isProgrammaticScrollRef.current = false;
        });
      }
    };
    
    // Если Embla API уже доступен, сразу выполняем скролл
    if (emblaApiRef.current) {
      scrollToActiveGift();
    } else {
      // Если API еще не доступно, сбрасываем все табы
      deactivateAllTabs();
    }
    
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
    };
  }, [emblaApiRef.current, currentActiveGift, sortedGifts, targetDateGift, updateButtonsAppearance]);

  // Сбрасываем активное состояние всех табов при монтировании компонента
  useEffect(() => {
    // Сбрасываем табы сразу
    deactivateAllTabs();
    
    // И еще раз через небольшую задержку для надежности
    const timer = setTimeout(() => {
      deactivateAllTabs();
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [deactivateAllTabs]);

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
          onClick={() => scrollToWeek(0)}
          className="week-tab opacity-50"
          data-week="1"
        >
          1 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(1)}
          className="week-tab opacity-50"
          data-week="2"
        >
          2 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(2)}
          className="week-tab opacity-50"
          data-week="3"
        >
          3 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(3)}
          className="week-tab opacity-50"
          data-week="4"
        >
          4 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek(4)}
          className="week-tab opacity-50"
          data-week="5"
        >
          5 WEEK
        </IconButton.Root>
        <IconButton.Root 
          onClick={() => scrollToWeek('target')}
          className="week-tab opacity-50"
          data-week="target"
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
            // Настройки для разных экранов теперь обрабатываются в компоненте EmblaCarousel
            breakpoints: {
              '(max-width: 768px)': { 
                align: 'center',
              }
            }
          }}
          emblaApiRef={emblaApiRef}
          onDragStart={() => {
            // При начале перетаскивания сбрасываем активные вкладки
            deactivateAllTabs();
          }}
          onScroll={(progress: number) => {
            // Если программный скролл, не обновляем навигацию
            if (isProgrammaticScrollRef.current) return;
            
            // Сбрасываем активное состояние всех вкладок при ручном скролле
            deactivateAllTabs();
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
                  isAdmin={isAdmin}
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

