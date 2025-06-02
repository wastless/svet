"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const diceCss = `
  .dice-container {
    display: grid;
    place-items: center;
    width: 400px;
    padding: 60px 0 40px;
  }
  
  .dice {
    position: relative;
    width: 100px;
    height: 100px;
    transform-style: preserve-3d;
    transition: 1s ease;
  }
  
  /* Больший размер кубика для главной страницы */
  .main-dice-container .dice-container {
    width: 500px;
    padding: 80px 0 60px;
  }
  
  .main-dice-container .dice {
    width: 200px;
    height: 200px;
  }
  
  /* Увеличиваем смещение граней для большего кубика */
  .main-dice-container .front {
    transform: translateZ(100px);
  }
  
  .main-dice-container .back {
    transform: rotateX(180deg) translateZ(100px);
  }
  
  .main-dice-container .top {
    transform: rotateX(90deg) translateZ(100px);
  }
  
  .main-dice-container .bottom {
    transform: rotateX(-90deg) translateZ(100px);
  }
  
  .main-dice-container .right {
    transform: rotateY(90deg) translateZ(100px);
  }
  
  .main-dice-container .left {
    transform: rotateY(-90deg) translateZ(100px);
  }
  
  /* Стилизация граней для главной страницы */
  .main-dice-container .face {
    border-radius: 30px;
    border-width: 8px;
  }
  
  .main-dice-container .face::before {
    border-radius: 30px;
  }
  
  @keyframes rolling {
    50% {
      transform: rotateX(1080deg) rotateY(720deg);
    }
  }
  
  .face {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    border: 5px solid #f6f3f0;
    transform-style: preserve-3d;
    background: linear-gradient(145deg, #dddbd8, #fff);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .face::before {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: #f6f3f0;
    transform: translateZ(-1px);
  }
  
  .face img {
    width: 60%;
    height: 60%;
    object-fit: contain;
    z-index: 10;
  }
  
  .front {
    transform: translateZ(50px);
  }
  
  .back {
    transform: rotateX(180deg) translateZ(50px);
  }
  
  .top {
    transform: rotateX(90deg) translateZ(50px);
  }
  
  .bottom {
    transform: rotateX(-90deg) translateZ(50px);
  }
  
  .right {
    transform: rotateY(90deg) translateZ(50px);
  }
  
  .left {
    transform: rotateY(-90deg) translateZ(50px);
  }
  
  .roll-button {
    cursor: pointer;
    color: #b33951;
    margin-top: 60px;
    padding: 6px 12px;
    border-radius: 3px;
    font-weight: 700;
    font-size: 16px;
    border: 2px solid #b33951;
    transition: .4s;
  }
  
  .roll-button:hover {
    color: #fff;
    background: #b33951;
  }
  
  .roll-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CssDice = ({ 
  onRollComplete,
  visible = true,
  isAutoRolling = false
}: { 
  onRollComplete?: (result: number) => void;
  visible?: boolean;
  isAutoRolling?: boolean;
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const diceRef = useRef<HTMLDivElement>(null);
  
  // Эффект для автоматического броска кубика
  useEffect(() => {
    if (isAutoRolling && !isRolling) {
      rollDice();
    }
  }, [isAutoRolling]);
  
  // Функция для броска кубика
  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    const random = Math.floor(Math.random() * 6) + 1;
    
    if (diceRef.current) {
      diceRef.current.style.animation = 'rolling 6s cubic-bezier(0.165, 0.84, 0.44, 1)';
      
      setTimeout(() => {
        if (diceRef.current) {
          switch (random) {
            case 1:
              diceRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
              break;
            case 6:
              diceRef.current.style.transform = 'rotateX(180deg) rotateY(0deg)';
              break;
            case 2:
              diceRef.current.style.transform = 'rotateX(-90deg) rotateY(0deg)';
              break;
            case 5:
              diceRef.current.style.transform = 'rotateX(90deg) rotateY(0deg)';
              break;
            case 3:
              diceRef.current.style.transform = 'rotateX(0deg) rotateY(90deg)';
              break;
            case 4:
              diceRef.current.style.transform = 'rotateX(0deg) rotateY(-90deg)';
              break;
            default:
              break;
          }
          
          diceRef.current.style.animation = 'none';
          
          // Вызываем колбэк с результатом броска
          setTimeout(() => {
            setIsRolling(false);
            if (onRollComplete) {
              onRollComplete(random);
            }
          }, 500);
        }
      }, 6050);
    }
  };
  
  if (!visible) return null;
  
  return (
    <>
      <style>{diceCss}</style>
      <div className="dice-container">
        <div className="dice" ref={diceRef}>
          <div className="face front">
            <img src="/1.svg" alt="1" />
          </div>
          <div className="face back">
            <img src="/6.svg" alt="6" />
          </div>
          <div className="face top">
            <img src="/2.svg" alt="2" />
          </div>
          <div className="face bottom">
            <img src="/5.svg" alt="5" />
          </div>
          <div className="face right">
            <img src="/3.svg" alt="3" />
          </div>
          <div className="face left">
            <img src="/4.svg" alt="4" />
          </div>
        </div>
    
      </div>
    </>
  );
}; 