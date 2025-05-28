"use client";

import { useState, useEffect } from "react";
import type { MemoryPhoto } from "@/utils/types/gift";

interface PolaroidPhotoProps {
  memoryPhoto: MemoryPhoto;
  isRevealed: boolean; // открыт ли подарок
  openDate: Date; // дата открытия подарка
  className?: string;
  size?: 'small' | 'medium' | 'large'; // размер полароида
}

export function PolaroidPhoto({
  memoryPhoto,
  isRevealed,
  openDate,
  className = "",
  size = 'large',
}: PolaroidPhotoProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Форматируем дату для отображения на полароиде
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
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

  return (
    <div className={`inline-block ${className}`}>
      {/* Основная рамка полароида */}
      <div className={`relative ${config.frame.height} ${config.frame.width} bg-white`}>
        {/* Текстура бумаги */}
        <div
          className={`absolute inset-0 z-[1] ${config.frame.height} ${config.frame.width} bg-cover bg-center`}
          style={{ backgroundImage: "url('/texture_paper.png')" }}
        />

        {/* Область фотографии */}
        <div className={`bg-transparent absolute ${config.photo.padding} z-[2] ${config.photo.height} ${config.photo.width} overflow-hidden`}>
          {/* Основное изображение */}
          <img
            src={memoryPhoto.photoUrl}
            alt="Memory photo"
            className={`duration-[800ms] relative z-[3] h-full w-full object-cover transition-all ${
              !isRevealed
                ? "blur-[20px] grayscale"
                : "animate-[reveal_1.5s_ease-out]"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Текстура шума (только для закрытого состояния) */}
          {!isRevealed && (
            <div
              className="absolute inset-0 z-[4] h-full w-full bg-cover bg-center opacity-50"
              style={{
                backgroundImage: "url('/texture_noise.png')",
                mixBlendMode: "soft-light",
              }}
            />
          )}

          {/* Текстура пластика (только для закрытого состояния) */}
          {!isRevealed && (
            <div
              className="absolute inset-0 z-[5] h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: "url('/texture_plastic.png')",
                mixBlendMode: "exclusion",
              }}
            />
          )}

          {/* Знак вопроса (только для закрытого состояния) */}
          {!isRevealed && (
            <div className="absolute left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-1/2 transform">
              <span
                className={`font-founders ${config.questionSize} font-bold text-black/40`}
                style={{
                  mixBlendMode: "soft-light",
                }}
              >
                ?
              </span>
            </div>
          )}
        </div>

        {/* Нижняя область с текстом */}
        <div className="">
          <span
            className={`text-marker absolute ${config.textPosition.title} left-[23px] right-[23px] z-[7] flex h-[60px] items-center font-permanent ${config.textSize}`}
            style={{ transform: "rotate(-2.5deg)" }}
          >
            {memoryPhoto.text}
          </span>

          <span
            className={`text-marker absolute ${config.textPosition.date} right-[23px] z-[7] flex h-[60px] items-center font-permanent ${config.textSize}`}
            style={{ transform: "rotate(-2.5deg)" }}
          >
            {formatDate(openDate)}
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
      `}</style>
    </div>
  );
}
