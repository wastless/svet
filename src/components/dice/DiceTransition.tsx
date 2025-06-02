"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CssDice } from './CssDice';

// Стили для кубика на странице подарка
const dicePageTransitionCss = `
  .dice-page-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    background-color: white;
  }
  
  .dice-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 40;
    padding: 100px;
  }
  
  /* Больший размер кубика для страницы подарка */
  .dice-wrapper .dice-container {
    width: 500px;
    padding: 80px 0 60px;
  }
  
  .dice-wrapper .dice {
    width: 200px;
    height: 200px;
  }
  
  /* Увеличиваем смещение граней для большего кубика */
  .dice-wrapper .front {
    transform: translateZ(100px);
  }
  
  .dice-wrapper .back {
    transform: rotateX(180deg) translateZ(100px);
  }
  
  .dice-wrapper .top {
    transform: rotateX(90deg) translateZ(100px);
  }
  
  .dice-wrapper .bottom {
    transform: rotateX(-90deg) translateZ(100px);
  }
  
  .dice-wrapper .right {
    transform: rotateY(90deg) translateZ(100px);
  }
  
  .dice-wrapper .left {
    transform: rotateY(-90deg) translateZ(100px);
  }
  
  /* Стилизация граней для страницы подарка */
  .dice-wrapper .face {
    border-radius: 30px;
    border-width: 8px;
  }
  
  .dice-wrapper .face::before {
    border-radius: 30px;
  }
`;

interface DiceTransitionProps {
  onTransitionComplete: () => void;
  giftId: string;
}

export const DiceTransition = ({ onTransitionComplete, giftId }: DiceTransitionProps) => {
  const [isRolling, setIsRolling] = useState(false);
  const [isDataPreloaded, setIsDataPreloaded] = useState(false);
  const diceContainerRef = useRef<HTMLDivElement>(null);
  
  // Эффект для предварительной загрузки данных подарка
  useEffect(() => {
    const preloadGiftData = async () => {
      try {
        // Предварительно загружаем данные подарка
        const giftRes = await fetch(`/api/gifts/${giftId}`);
        
        // Предварительно загружаем контент подарка
        const contentRes = await fetch(`/api/gift-content/${giftId}`);
        
        if (giftRes.ok && contentRes.ok) {
          console.log("Gift data and content preloaded successfully");
          setIsDataPreloaded(true);
        }
      } catch (error) {
        console.error('Error preloading gift data:', error);
        // Даже если предзагрузка не удалась, продолжаем показывать анимацию
        setIsDataPreloaded(true);
      }
    };
    
    // Запускаем предварительную загрузку данных
    preloadGiftData();
  }, [giftId]);
  
  // Эффект для анимации появления кубика
  useEffect(() => {
    if (diceContainerRef.current) {
      // Анимация появления кубика снизу страницы
      gsap.fromTo(
        diceContainerRef.current,
        {
          y: window.innerHeight / 2 + 200,
          opacity: 0,
          scale: 0.3
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power1.out",
          onComplete: () => {
            // Автоматически запускаем вращение кубика после появления
            setTimeout(() => {
              setIsRolling(true);
            }, 100);
          }
        }
      );
    }
  }, []);
  
  // Обработчик завершения броска кубика
  const handleDiceRollComplete = (result: number) => {
    console.log("Dice roll result:", result);
    setIsRolling(false);
    
    // Проверяем, загрузились ли данные
    if (!isDataPreloaded) {
      // Если данные ещё не загружены, ждём дополнительно
      const checkInterval = setInterval(() => {
        if (isDataPreloaded) {
          clearInterval(checkInterval);
          completeDiceAnimation();
        }
      }, 100);
      
      // Устанавливаем таймаут, чтобы не ждать бесконечно
      setTimeout(() => {
        clearInterval(checkInterval);
        completeDiceAnimation();
      }, 1000);
    } else {
      // Если данные уже загружены, продолжаем обычную анимацию
      completeDiceAnimation();
    }
  };
  
  // Функция для завершения анимации кубика
  const completeDiceAnimation = () => {
    // Задержка перед скрытием кубика
    setTimeout(() => {
      // Анимация исчезновения кубика
      if (diceContainerRef.current) {
        gsap.to(diceContainerRef.current, {
          y: 100,
          opacity: 0,
          scale: 0.5,
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            // Вызываем колбэк завершения анимации
            onTransitionComplete();
          }
        });
      }
    }, 800);
  };
  
  return (
    <div className="dice-page-container">
      <style>{dicePageTransitionCss}</style>
      <div
        ref={diceContainerRef}
        className="dice-wrapper"
      >
        <CssDice
          onRollComplete={handleDiceRollComplete}
          isAutoRolling={isRolling}
        />
      </div>
    </div>
  );
}; 