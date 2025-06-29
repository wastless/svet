"use client";

import type { TextBlock as TextBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import React from "react";

interface TextBlockProps {
  block: TextBlockType;
  className?: string;
}

export function TextBlock({ block, className = "" }: TextBlockProps) {
  const getTextStyles = (style?: string) => {
    switch (style) {
      case "title":
        return "text-label-sm md:text-label-md font-nyghtserif italic";
      case "subtitle":
        return "text-label-xs md:text-label-sm font-nyghtserif italic";
      case "normal":
      default:
        return "md:text-paragraph-xl text-paragraph-lg font-euclid";
    }
  };

  const getTextContent = (content: string, style?: string) => {
    if (style === "title" || style === "subtitle") {
      return `(${content})`;
    }
    return content;
  };
  
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

  // Получаем текстовый контент
  const textContent = getTextContent(block.content, block.style);
  
  // Получаем заголовок, если он есть
  const hasHeading = block.heading !== undefined && block.heading.trim() !== '';
  
  // Получаем класс выравнивания
  const alignmentClass = getAlignmentClass(block.alignment);

  // Обрабатываем переносы строк в тексте
  const renderTextWithLineBreaks = (text: string) => {
    // Разбиваем текст на строки по символу переноса
    const lines = text.split('\n');
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line.trim() ? processText(line) : null}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`text-adaptive ${className} ${alignmentClass}`}>
      {/* Отображаем заголовок, если он есть */}
      {hasHeading && (
        <div className="text-label-sm md:text-label-md font-nyghtserif mb-2 italic md:italic">
          ({block.heading && processText(block.heading)})
        </div>
      )}
      
      {/* Отображаем основной текст с поддержкой переносов строк */}
      <div className={getTextStyles(block.style)}>
        {renderTextWithLineBreaks(textContent)}
      </div>
    </div>
  );
} 