"use client";

import React, { useState, useEffect } from "react";
import type { GalleryBlock as GalleryBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";

interface GalleryBlockProps {
  block: GalleryBlockType;
  className?: string;
}

export function GalleryBlock({ block, className = "" }: GalleryBlockProps) {
  // Обрабатываем переносы строк в тексте
  const renderTextWithLineBreaks = (text: string) => {
    // Разбиваем текст на строки по символу переноса
    const lines = text.split('\n');
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {processText(line)}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Определяем количество колонок на основе количества изображений
  const getColumnsClass = () => {
    const imageCount = block.images.length;

    if (imageCount <= 2) {
      return "grid-cols-2";
    } else if (imageCount <= 3) {
      return "grid-cols-2 md:grid-cols-3";
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
        <h3 className="font-nyghtserif text-label-sm md:text-label-md italic">({renderTextWithLineBreaks(block.title)})</h3>
      </div>
    );
  };

  // Компонент текста
  const TextComponent = () => {
    if (!block.text) return null;

    return (
      <div className="text-center text-adaptive">
        <p className="text-paragraph-lg md:text-paragraph-xl font-euclid">{renderTextWithLineBreaks(block.text)}</p>
      </div>
    );
  };

  // Компонент отдельного изображения
  const ImageComponent = ({ image, index }: { image: any; index: number }) => (
    <div className="space-y-2">
      <img
        src={image.url}
        alt={image.caption || `Изображение ${index + 1}`}
        className="aspect-square w-full rounded-2xl object-cover"
      />
      {image.caption && (
        <div className="text-center">
          <p className="font-euclid text-paragraph-sm text-text-soft-400">
            {renderTextWithLineBreaks(image.caption)}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col gap-1">
        {/* Заголовок */}
        <TitleComponent />

        {/* Текст */}
        <TextComponent />
      </div>
      {/* Галерея изображений */}
      <div className={`grid ${getColumnsClass()} gap-2 md:gap-6`}>
        {displayImages.map((image, index) => (
          <ImageComponent key={index} image={image} index={index} />
        ))}
      </div>
    </div>
  );
}
