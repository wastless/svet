"use client";

import type { QuoteBlock as QuoteBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import React from "react";

interface QuoteBlockProps {
  block: QuoteBlockType;
  className?: string;
}

export function QuoteBlock({ block, className = "" }: QuoteBlockProps) {
  const getQuoteStyles = (style?: string) => {
    switch (style) {
      case "big":
        return "text-label-sm md:text-label-sm font-nyghtserif";
      case "small":
      default:
        return "text-paragraph-lg md:text-paragraph-xl font-euclid";
    }
  };

  const quoteStyles = getQuoteStyles(block.style);
  
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

  return (
    <div className={`relative ${className}`}>
      {/* Полоска слева */}
      <div className="w-0.5 absolute bottom-0 left-0 top-0 bg-white" />

      {/* Контент цитаты с отступом от полоски */}
      <div className="pl-6">
        {/* Текст цитаты */}
        <blockquote className={`text-adaptive ${quoteStyles}`}>
          {renderTextWithLineBreaks(block.content)}
        </blockquote>
      </div>
    </div>
  );
}
