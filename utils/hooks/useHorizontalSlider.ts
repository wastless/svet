import { useEffect } from 'react';
import type { RefObject } from 'react';

interface SliderOptions {
  infinite?: boolean;
  dragSensitivity?: number;
  lerpFactor?: number;
  scrollSensitivity?: number;
  snap?: boolean;
  snapStrength?: number;
}

/**
 * Пользовательский хук для инициализации горизонтального слайдера
 * Работает с элементами, помеченными атрибутом data-slider="w"
 */
export function useHorizontalSlider<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: SliderOptions = {}
): void {
  useEffect(() => {
    // Ждем полной загрузки страницы
    if (typeof window === 'undefined' || !ref.current) return;

    // Проверяем, доступен ли слайдер в глобальном объекте window
    const hasSliderComponent = 
      window.app && 
      window.app.dom && 
      typeof window.app.dom.create === 'function';

    if (hasSliderComponent) {
      // После рендеринга DOM, система подхватит элементы с data-slider="w"
      console.log('Slider elements will be initialized by the app system');
    } else {
      console.warn('Slider system not found in window.app');
    }

    // Настройка горизонтального плавного скролла
    const setupHorizontalSmoothScroll = () => {
      if (!ref.current) return;
      
      const element = ref.current;
      
      // Улучшенный обработчик колесика мыши для горизонтального скролла
      const handleWheel = (e: WheelEvent) => {
        // Если это горизонтальный скролл или зажат Shift, используем стандартное поведение
        if (e.deltaX !== 0 || e.shiftKey) return;
        
        // Проверяем, находится ли указатель мыши над элементом
        const rect = element.getBoundingClientRect();
        const isMouseOver = 
          e.clientX >= rect.left && 
          e.clientX <= rect.right && 
          e.clientY >= rect.top && 
          e.clientY <= rect.bottom;
        
        if (isMouseOver) {
          // Предотвращаем стандартное поведение
          e.preventDefault();
          
          // Используем умеренный множитель для горизонтального скролла
          const multiplier = 3; // Уменьшен с 5 до 3
          
          // Базовый скролл, увеличенный в multiplier раз
          let scrollAmount = e.deltaY * multiplier;
          
          // Используем мгновенный скролл вместо плавного для лучшей отзывчивости
          element.scrollBy({
            left: scrollAmount,
            behavior: 'auto' // Изменено с 'smooth' на 'auto'
          });
        }
      };
      
      // Добавляем обработчик
      element.addEventListener('wheel', handleWheel, { passive: false });
      
      // Возвращаем функцию очистки
      return () => {
        element.removeEventListener('wheel', handleWheel);
      };
    };
    
    // Сразу инициализируем горизонтальный скролл без ожидания SmoothScroll
    const cleanup = setupHorizontalSmoothScroll();
    
    // Возвращаем функцию очистки
    return cleanup;
  }, [ref]);
}

// Объявляем типы для window.app и SmoothScroll
declare global {
  interface Window {
    app: {
      dom: {
        create: () => void;
      };
      [key: string]: any;
    };
    SmoothScroll: (options: {
      animationTime: number;
      stepSize: number;
      accelerationDelta: number;
      accelerationMax: number;
      keyboardSupport: boolean;
      arrowScroll: number;
      pulseAlgorithm: boolean;
      pulseScale: number;
      pulseNormalize: number;
      touchpadSupport: boolean;
      touchpadSensitivity: number;
      [key: string]: any;
    }) => void;
  }
} 