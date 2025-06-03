"use client";

import { useEffect, useRef, useState } from 'react';

export default function SplitDemo() {
  const darkContentRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  
  // Состояние для отслеживания фиксации SPLIT
  const [isSticky, setIsSticky] = useState(false);
  
  // Эффект для обработки прокрутки и анимации
  useEffect(() => {
    const darkContent = darkContentRef.current;
    const topText = topTextRef.current;
    const bottomText = bottomTextRef.current;
    const splitContainer = splitContainerRef.current;
    
    if (!darkContent || !topText || !bottomText || !splitContainer) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Фиксируем SPLIT к центру экрана после скролла мимо него
      const splitPosition = 1000; // Позиция SPLIT сверху
      const windowHeight = window.innerHeight;
      const splitHeight = splitContainer.offsetHeight;
      
      // Корректируем точку триггера, чтобы учесть высоту самого элемента
      const triggerPosition = splitPosition - (windowHeight / 2) + (splitHeight / 2);
      
      // Добавляем задержку - количество пикселей скролла после фиксации и до начала анимации
      const delayPixels = 50; // 100px скролла перед началом анимации
      const animationStartPosition = triggerPosition + delayPixels;
      
      console.log('Scroll position:', scrollPosition, 
                  'Trigger position:', triggerPosition,
                  'Animation start:', animationStartPosition);
      
      // Проверяем, достиг ли скролл позиции для фиксации
      if (scrollPosition >= triggerPosition) {
        setIsSticky(true);
        
        // Увеличиваем дистанцию скролла для более плавной и длительной анимации
        const startAnimatePosition = animationStartPosition;
        const endAnimatePosition = startAnimatePosition + 500; // Увеличиваем с 300 до 500px для более плавной анимации
        const animationProgress = Math.min(1, Math.max(0, (scrollPosition - startAnimatePosition) / (endAnimatePosition - startAnimatePosition)));
        
        // Применяем особую функцию для замедленного старта и плавного финиша
        const easedProgress = easeInOutQuint(animationProgress);
        
        console.log('Animation progress:', animationProgress, 'Eased:', easedProgress);
        
        // Применяем анимацию при ненулевом прогрессе - это произойдет только после задержки
        if (animationProgress > 0) {
          // Начало анимации очень плавное благодаря easeInOutQuint
          // Первые 20% скролла дадут всего около 5% анимации для очень медленного старта
          const heightValue = `${easedProgress * 100}vh`;
          darkContent.style.height = heightValue;
          
          // Анимация разделения текста с тем же прогрессом
          // Увеличиваем максимальное расстояние разделения для более выраженного эффекта
          const moveDistance = easedProgress * 80; // Увеличиваем с 60 до 80px
          topText.style.transform = `translateY(-${moveDistance}px)`;
          bottomText.style.transform = `translateY(${moveDistance}px)`;
          
          // Если прогресс достаточно большой, устанавливаем максимальные значения
          if (animationProgress > 0.95) {
            darkContent.style.height = '100vh';
            topText.style.transform = 'translateY(-80px)';
            bottomText.style.transform = 'translateY(80px)';
          }
        } else {
          // Слово зафиксировано, но анимация еще не началась
          darkContent.style.height = '0px';
          topText.style.transform = 'translateY(0)';
          bottomText.style.transform = 'translateY(0)';
        }
      } else {
        // Не фиксируем SPLIT, если скролл не достиг нужной позиции
        setIsSticky(false);
        
        // Сбрасываем стили
        darkContent.style.height = '0px';
        topText.style.transform = 'translateY(0)';
        bottomText.style.transform = 'translateY(0)';
      }
    };
    
    // Функция для плавного замедления (easing)
    function easeOutCubic(x: number): number {
      return 1 - Math.pow(1 - x, 3);
    }
    
    // Более плавная функция замедления
    function easeOutQuint(x: number): number {
      return 1 - Math.pow(1 - x, 5);
    }
    
    // Функция с медленным стартом и плавным окончанием
    function easeInOutQuint(x: number): number {
      return x < 0.5 
        ? 16 * x * x * x * x * x 
        : 1 - Math.pow(-2 * x + 2, 5) / 2;
    }
    
    // Вызываем обработчик сразу после монтирования
    handleScroll();
    
    // Добавляем обработчик прокрутки
    window.addEventListener('scroll', handleScroll);
    
    // Очищаем обработчик при размонтировании
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className="min-h-[300vh] w-full bg-white relative">
      {/* Верхний отступ */}
      <div style={{ height: '1000px' }}></div>
      
      {/* Контейнер со словом SPLIT */}
      <div 
        ref={splitContainerRef} 
        style={{
          position: isSticky ? 'fixed' : 'relative',
          top: isSticky ? '50%' : 'auto',
          left: 0,
          width: '100%',
          transform: isSticky ? 'translateY(-50%)' : 'none',
          zIndex: 30,
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Черная полоса по центру, которая растягивается */}
        <div 
          ref={darkContentRef} 
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            width: '100vw',
            height: '0px',
            backgroundColor: 'black',
            transform: 'translateY(-50%)',
            zIndex: 20
          }}
        ></div>
        
        {/* Контейнер для SPLIT текста с эффектом разделения */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible',
          height: '120px',
          width: '100%'
        }}>
          {/* Верхняя половина слова */}
          <div 
            ref={topTextRef}
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
              clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'
            }}
          >
            <p style={{ 
              fontSize: '9rem', 
              fontWeight: 900, 
              color: 'black',
              margin: 0,
              padding: 0,
              textAlign: 'center'
            }}>SPLIT</p>
          </div>
          
          {/* Нижняя половина слова */}
          <div 
            ref={bottomTextRef}
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)'
            }}
          >
            <p style={{ 
              fontSize: '9rem', 
              fontWeight: 900, 
              color: 'black',
              margin: 0,
              padding: 0,
              textAlign: 'center'
            }}>SPLIT</p>
          </div>
        </div>
      </div>
      
      {/* Дополнительное пространство для прокрутки после SPLIT */}
      <div style={{ height: '1000px' }}></div>
    </div>
  );
} 