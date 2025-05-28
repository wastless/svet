"use client";

import React, { useState, useEffect } from "react";
import type { GalleryBlock as GalleryBlockType } from "@/utils/types/gift";

interface GalleryBlockProps {
  block: GalleryBlockType;
  className?: string;
}

export function GalleryBlock({ block, className = "" }: GalleryBlockProps) {
  // Определяем количество колонок на основе количества изображений
  const getColumnsClass = () => {
    const imageCount = block.images.length;
    
    if (imageCount <= 2) {
      return "grid-cols-2";
    } else if (imageCount <= 3) {
      return "grid-cols-3";
    } else if (imageCount <= 4) {
      return "grid-cols-2 md:grid-cols-2";
    } else if (imageCount <= 6) {
      return "grid-cols-2 md:grid-cols-3";
    } else {
      // Если больше 6, показываем только первые 6
      return "grid-cols-2 md:grid-cols-3";
    }
  };

  // Ограничиваем количество изображений до 6
  const displayImages = block.images.slice(0, 6);

  // Компонент заголовка
  const TitleComponent = () => {
    if (!block.title) return null;
    return (
      <div className="text-center text-adaptive">
        <h3 className="text-label-lg font-nyghtserif italic">
          {block.title}
        </h3>
      </div>
    );
  };

  // Компонент текста
  const TextComponent = () => {
    if (!block.text) return null;
    
    const textSizeClass = block.textSize === "small" 
      ? "text-paragraph-md" 
      : "text-paragraph-xl";
    
    return (
      <div className="text-center text-adaptive">
        <p className={`${textSizeClass} font-euclid`}>
          {block.text}
        </p>
      </div>
    );
  };

  // Компонент отдельного изображения
  const ImageComponent = ({ image, index }: { image: any; index: number }) => (
    <div className="space-y-2">
      <img
        src={image.url}
        alt={image.caption || `Изображение ${index + 1}`}
        className="w-full aspect-square object-cover rounded-2xl"
      />
      {image.caption && (
        <div className="text-center">
          <p className="text-paragraph-sm font-euclid text-text-soft-400">
            {image.caption}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-8 ${className}`}>
        <div className="flex flex-col gap-1">
      {/* Заголовок */}
      <TitleComponent />
      
      {/* Текст */}
      <TextComponent />
      </div>
      {/* Галерея изображений */}
      <div className={`grid ${getColumnsClass()} gap-6`}>
        {displayImages.map((image, index) => (
          <ImageComponent key={index} image={image} index={index} />
        ))}
      </div>
    </div>
  );
} 