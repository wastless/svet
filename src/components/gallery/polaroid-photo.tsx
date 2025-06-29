"use client";

import { useState, useEffect, useRef } from "react";
import type { MemoryPhoto } from "@/utils/types/gift";

interface PolaroidPhotoProps {
  memoryPhoto: MemoryPhoto;
  isRevealed: boolean; // открыт ли подарок
  openDate: Date; // дата открытия подарка
  className?: string;
  size?: 'small' | 'medium' | 'large'; // размер полароида
  isAdmin?: boolean; // флаг для админа
}

export function PolaroidPhoto({
  memoryPhoto,
  isRevealed,
  openDate,
  className = "",
  size = 'large',
  isAdmin = false,
}: PolaroidPhotoProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [rotation, setRotation] = useState(0); // Start with 0 rotation for SSR
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const polaroidRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Set random rotation only on client side after component mounts
  useEffect(() => {
    setRotation(Math.floor(Math.random() * 7) - 1.5);
  }, []);

  // Обработчики для 3D-эффекта при наведении
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!polaroidRef.current) return;
    
    const rect = polaroidRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Нормализуем координаты от -1 до 1
    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;
    
    setMousePosition({ x: normalizedX, y: normalizedY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Плавно возвращаем в исходное положение
    setMousePosition({ x: 0, y: 0 });
  };

  // Форматируем дату для отображения на полароиде
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Размеры в зависимости от пропса size
  const sizeConfig = {
    small: {
      frame: { width: 'w-[320px]', height: 'h-[375px]' },
      photo: { width: 'w-[296px]', height: 'h-[296px]', padding: 'left-[12px] right-[12px] top-[12px]' },
      textSize: 'text-marker-sm',
      questionSize: 'text-[200px]',
      textPosition: { title: 'bottom-6', date: 'bottom-0' }
    },
    medium: {
      frame: { width: 'w-[430px]', height: 'h-[504px]' },
      photo: { width: 'w-[400px]', height: 'h-[400px]', padding: 'left-[16px] right-[16px] top-[16px]' },
      textSize: 'text-marker-md',
      questionSize: 'text-[300px]',
      textPosition: { title: 'bottom-10', date: 'bottom-3' }
    },
    large: {
      frame: { width: 'w-[640px]', height: 'h-[750px]' },
      photo: { width: 'w-[594px]', height: 'h-[594px]', padding: 'left-[23px] right-[23px] top-[23px]' },
      textSize: 'text-marker-xl',
      questionSize: 'text-[450px]',
      textPosition: { title: 'bottom-20', date: 'bottom-4' }
    }
  };

  const config = sizeConfig[size];

  // Вычисляем 3D-трансформацию на основе положения мыши
  const rotateX = isHovered ? mousePosition.y * -3 : 0; // Уменьшаем с -5 до -3
  const rotateY = isHovered ? mousePosition.x * 3 : 0;  // Уменьшаем с 5 до 3
  const translateZ = '0px';
  const glossMaxDistance = 1.2; // чуть больше, чтобы глянец не исчезал резко
  const distanceToCenter = Math.sqrt(mousePosition.x * mousePosition.x + mousePosition.y * mousePosition.y);
  
  // Для открытых подарков - нормальный глянец, для закрытых - минимальный
  const maxOpacity = isRevealed ? 0.4 : 0.15;
  const glossOpacity = isHovered ? Math.min(distanceToCenter / glossMaxDistance, maxOpacity) : 0;
  const glossTranslateX = isHovered ? -mousePosition.x * 25 : 0;
  const glossTranslateY = isHovered ? -mousePosition.y * 25 : 0;

  // Определяем, показывать ли фото (только для админа или если подарок открыт по дате)
  const showPhoto = isRevealed || isAdmin;

  return (
    <div 
      className={`perspective-[1000px] transition-transform duration-300 polaroid-3d ${className}`}
      ref={polaroidRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Основная рамка полароида */}
      <div 
        className={`${config.frame.height} ${config.frame.width} bg-polaroid-paper shadow-md polaroid-3d-content`}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        {/* Область фотографии */}
        <div 
          className={`bg-transparent absolute ${config.photo.padding} z-[2] ${config.photo.height} ${config.photo.width} overflow-hidden`}
          style={{
            transform: 'none',
            transition: 'none',
          }}
        >
          {/* Глянцевый слой поверх фото */}
          <div
            className="polaroid-gloss polaroid-gloss--animatable"
            style={{
              opacity: glossOpacity,
              transform: `translate(${glossTranslateX}%, ${glossTranslateY}%) scale(1.2)`
            }}
          />
          {/* Основное изображение */}
          <img
            src={showPhoto ? memoryPhoto.photoUrl : '/placeholder.png'}
            alt="Memory photo"
            className={`duration-800 relative z-[3] h-full w-full object-cover transition-all ${
              !showPhoto
                ? "blur-[20px] grayscale"
                : "animate-[reveal_1.5s_ease-out]"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Текстура шума (только для закрытого состояния) */}
          {!showPhoto && (
            <div
              className="absolute inset-0 z-[4] h-full w-full bg-cover bg-center opacity-50"
              style={{
                backgroundImage: "url('/texture_noise.png')",
                mixBlendMode: "soft-light",
              }}
            />
          )}

          {/* Текстура пластика (только для закрытого состояния) */}
          {!showPhoto && (
            <div
              className="absolute inset-0 z-[5] h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: "url('/texture_plastic.png')",
                mixBlendMode: "exclusion",
              }}
            />
          )}

          {/* Знак вопроса (только для закрытого состояния) */}
          {!showPhoto && (
            <div 
              className="absolute left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-1/2 transform"
              style={{
                transform: 'translate(-50%, -50%)',
                transition: 'none',
              }}
            >
              <span
                className={`font-founders ${config.questionSize} font-bold text-black/40`}
                style={{
                  mixBlendMode: "soft-light",
                  textShadow: 'none',
                }}
              >
                ?
              </span>
            </div>
          )}
        </div>

        {/* Эффект свечения вокруг фото */}
        <div 
          className={`absolute inset-0 z-[1] rounded-sm ${isRevealed ? '' : ''}`}
          style={{
            boxShadow: 'none',
            opacity: 0,
            transition: 'box-shadow 0.3s ease-out, opacity 0.3s ease-out',
          }}
        />

        {/* Нижняя область с текстом */}
        <div className="">
          <span
            className={`text-marker absolute ${config.textPosition.title} left-[23px] right-[23px] z-[7] flex h-[60px] items-center font-permanent ${config.textSize}`}
            style={{ 
              transform: `rotate(-2.5deg)`,
              transition: 'none',
            }}
          >
            {showPhoto 
              ? (memoryPhoto.gift?.nickname ? `${memoryPhoto.gift.nickname}` : '')
              : 'Mister X'
            }
          </span>

          <span
            className={`text-marker absolute ${config.textPosition.date} right-[23px] z-[7] flex h-[60px] items-center font-permanent ${config.textSize}`}
            style={{ 
              transform: `rotate(-2.5deg)`,
              transition: 'none',
            }}
          >
            {showPhoto 
              ? formatDate(memoryPhoto.photoDate || null) 
              : `${formatDate(openDate)}`
            }
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes reveal {
          from {
            filter: blur(8px) grayscale(100%);
          }
          to {
            filter: blur(0px) grayscale(0%);
          }
        }
        
        .perspective-[1000px] {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}