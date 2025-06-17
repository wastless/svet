"use client";

import type { TextBlock as TextBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";

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

  const getTextContent = () => {
    if (block.style === "title" || block.style === "subtitle") {
      return `(${block.content})`;
    }
    return block.content;
  };

  // Получаем текстовый контент
  const textContent = getTextContent();

  return (
    <div className={`text-adaptive ${className}`}>
      <div className={getTextStyles(block.style)}>
        {processText(textContent)}
      </div>
    </div>
  );
} 