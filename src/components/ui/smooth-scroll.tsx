"use client";

import { useEffect } from "react";

export function SmoothScrollScript() {
  useEffect(() => {
    // Load the script
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/smoothscroll/1.4.10/SmoothScroll.min.js";
    script.integrity = "sha256-huW7yWl7tNfP7lGk46XE+Sp0nCotjzYodhVKlwaNeco=";
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
      // Initialize SmoothScroll once the script is loaded
      if (typeof window.SmoothScroll === "function") {
        // Инициализируем вертикальный плавный скролл
        window.SmoothScroll({
          // Увеличиваем время анимации для более плавного эффекта
          animationTime: 1200,
          // Уменьшаем размер шага для более плавного движения
          stepSize: 60,
      
          // Дополнительные настройки:
          
          // Снижаем ускорение для более равномерного движения
          accelerationDelta: 20,  
          // Снижаем максимальное ускорение
          accelerationMax: 1.5,   
      
          // Поддержка клавиатуры
          keyboardSupport: true,  
          // Шаг скролла стрелками на клавиатуре
          arrowScroll: 40,
      
          // Настройки пульсации
          pulseAlgorithm: true,
          // Увеличиваем значение для более плавного затухания
          pulseScale: 6,
          pulseNormalize: 1,
      
          // Поддержка тачпада
          touchpadSupport: true,
          // Включаем для плавного тачпада
          touchpadSensitivity: 1.5,
        });

        // Улучшенный обработчик для горизонтальных скроллов на странице
        enhanceHorizontalScrolling();
      }
    };
    
    document.head.appendChild(script);

    // Функция улучшения горизонтального скролла для всех элементов с data-slider="w"
    function enhanceHorizontalScrolling() {
      // Получаем все элементы с горизонтальным скроллом
      const horizontalScrollers = document.querySelectorAll('[data-slider="w"]');
      
      horizontalScrollers.forEach(scroller => {
        if (!(scroller instanceof HTMLElement)) return;
        
        // Создаем улучшенный обработчик колесика мыши
        const handleWheel = (e: WheelEvent) => {
          // Если это горизонтальный скролл или нажат Shift, используем стандартное поведение
          if (e.deltaX !== 0 || e.shiftKey) return;
          
          // Получаем размеры элемента
          const rect = scroller.getBoundingClientRect();
          
          // Проверяем, виден ли элемент и находится ли указатель над ним
          const isVisible = 
            rect.top < window.innerHeight && 
            rect.bottom > 0;
            
          const isMouseOver = 
            e.clientX >= rect.left && 
            e.clientX <= rect.right && 
            e.clientY >= rect.top && 
            e.clientY <= rect.bottom;
          
          if (isVisible && isMouseOver) {
            // Предотвращаем стандартное поведение
            e.preventDefault();
            
            // Используем умеренный множитель для более плавного горизонтального скролла
            const scrollMultiplier = 5; // Снижено с 15 для более плавного движения
            const scrollAmount = e.deltaY * scrollMultiplier;
            
            // Определяем текущую позицию скролла
            const currentScroll = scroller.scrollLeft;
            
            // Определяем целевую позицию скролла
            const targetScroll = currentScroll + scrollAmount;
            
            // Используем анимацию для плавного скролла
            animateScroll(scroller, currentScroll, targetScroll, 800); // Более длительная анимация для плавности
          }
        };
        
        // Добавляем обработчик на глобальном уровне
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        // Добавляем дополнительные кнопки навигации для горизонтального скролла
        addScrollButtons(scroller);
      });
    }
    
    // Функция добавления навигационных кнопок для горизонтального скролла
    function addScrollButtons(scrollElement: HTMLElement) {
      // Проверяем, нужно ли добавлять кнопки (только для больших скроллеров)
      if (scrollElement.scrollWidth <= scrollElement.clientWidth) return;
      
      const buttonSize = '40px';
      
      // Создаем левую кнопку
      const leftButton = document.createElement('button');
      leftButton.innerHTML = '&lt;';
      leftButton.style.cssText = `
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: ${buttonSize};
        height: ${buttonSize};
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(0, 0, 0, 0.1);
        font-size: 18px;
        z-index: 10;
        cursor: pointer;
        display: none;
        transition: all 0.3s ease;
        opacity: 0.7;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      `;
      
      // Создаем правую кнопку
      const rightButton = document.createElement('button');
      rightButton.innerHTML = '&gt;';
      rightButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: ${buttonSize};
        height: ${buttonSize};
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(0, 0, 0, 0.1);
        font-size: 18px;
        z-index: 10;
        cursor: pointer;
        display: none;
        transition: all 0.3s ease;
        opacity: 0.7;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      `;
      
      // Добавляем эффекты наведения
      leftButton.addEventListener('mouseenter', () => {
        leftButton.style.opacity = '1';
        leftButton.style.background = 'rgba(255, 255, 255, 0.8)';
      });
      
      leftButton.addEventListener('mouseleave', () => {
        leftButton.style.opacity = '0.7';
        leftButton.style.background = 'rgba(255, 255, 255, 0.5)';
      });
      
      rightButton.addEventListener('mouseenter', () => {
        rightButton.style.opacity = '1';
        rightButton.style.background = 'rgba(255, 255, 255, 0.8)';
      });
      
      rightButton.addEventListener('mouseleave', () => {
        rightButton.style.opacity = '0.7';
        rightButton.style.background = 'rgba(255, 255, 255, 0.5)';
      });
      
      // Добавляем обработчики на кнопки
      leftButton.addEventListener('click', () => {
        const currentScroll = scrollElement.scrollLeft;
        const targetScroll = currentScroll - scrollElement.clientWidth / 2;
        // Используем нашу плавную анимацию вместо стандартной
        animateScroll(scrollElement, currentScroll, targetScroll, 800);
      });
      
      rightButton.addEventListener('click', () => {
        const currentScroll = scrollElement.scrollLeft;
        const targetScroll = currentScroll + scrollElement.clientWidth / 2;
        // Используем нашу плавную анимацию вместо стандартной
        animateScroll(scrollElement, currentScroll, targetScroll, 800);
      });
      
      // Добавляем кнопки в контейнер
      const container = scrollElement.parentElement;
      if (container) {
        // Устанавливаем position: relative на контейнер, если еще не задано
        if (window.getComputedStyle(container).position === 'static') {
          container.style.position = 'relative';
        }
        
        container.appendChild(leftButton);
        container.appendChild(rightButton);
        
        // Показываем/скрываем кнопки при скролле
        scrollElement.addEventListener('scroll', () => {
          const isAtStart = scrollElement.scrollLeft <= 20;
          const isAtEnd = scrollElement.scrollLeft >= scrollElement.scrollWidth - scrollElement.clientWidth - 20;
          
          leftButton.style.display = isAtStart ? 'none' : 'block';
          rightButton.style.display = isAtEnd ? 'none' : 'block';
        });
        
        // Инициируем событие скролла для проверки кнопок
        scrollElement.dispatchEvent(new Event('scroll'));
      }
    }
    
    // Функция для создания плавной анимации скролла
    function animateScroll(element: HTMLElement, start: number, end: number, duration: number) {
      const startTime = performance.now();
      
      // Функция анимации с использованием requestAnimationFrame для плавности
      function animation(currentTime: number) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime > duration) {
          element.scrollLeft = end;
          return;
        }
        
        // Используем функцию замедления для более плавного движения
        const progress = easeInOutCubic(elapsedTime / duration);
        element.scrollLeft = start + (end - start) * progress;
        
        requestAnimationFrame(animation);
      }
      
      requestAnimationFrame(animation);
    }
    
    // Функция замедления для более естественного движения
    function easeInOutCubic(t: number): number {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Очистка
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  return null;
}

// Add TypeScript declaration for SmoothScroll
declare global {
  interface Window {
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