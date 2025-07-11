"use client";

import type { InfoGraphicBlock as InfoGraphicBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import React from "react";

interface InfoGraphicBlockProps {
  block: InfoGraphicBlockType;
  className?: string;
}

export function InfoGraphicBlock({ block, className = "" }: InfoGraphicBlockProps) {
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
          <div key={index} className="flex flex-col items-center">
            <div className="text-label-xl italic md:text-label-2xl md:font-nyghtserif md:italic font-nyghtserif text-white">
              {item.number}
            </div>
            <div className="md:text-paragraph-xl text-paragraph-lg font-euclid text-white">
              {renderTextWithLineBreaks(item.text)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 