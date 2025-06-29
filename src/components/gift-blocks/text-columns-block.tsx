"use client";

import type { TextColumnsBlock as TextColumnsBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import React from "react";

interface TextColumnsBlockProps {
  block: TextColumnsBlockType;
  className?: string;
}

export function TextColumnsBlock({ block, className = "" }: TextColumnsBlockProps) {
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

  // Получаем класс выравнивания
  const getAlignmentClass = (alignment?: string) => {
    switch (alignment) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "left":
      default:
        return "text-left";
    }
  };

  const alignmentClass = getAlignmentClass(block.alignment);
  
  // Определяем класс для сетки в зависимости от количества элементов
  const getGridClass = (count: number) => {
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-3";
      default:
        return "grid-cols-1";
    }
  };
  
  const gridClass = getGridClass(block.count);

  return (
    <div className={`${className} ${alignmentClass}`}>
      <div className={`grid ${gridClass} gap-8`}>
        {block.items.map((item, index) => (
          <div key={index} className="flex flex-col">
            {item.title && (
              <div className="text-label-sm md:text-label-md font-nyghtserif mb-2 italic md:italic text-white">
                ({renderTextWithLineBreaks(item.title)})
              </div>
            )}
            <div className="md:text-paragraph-xl text-paragraph-lg font-euclid text-white">
              {renderTextWithLineBreaks(item.text)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 