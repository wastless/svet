"use client";

import type { TwoImagesBlock as TwoImagesBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import React from "react";

interface TwoImagesBlockProps {
  block: TwoImagesBlockType;
  className?: string;
}

export function TwoImagesBlock({ block, className = "" }: TwoImagesBlockProps) {
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

  const getContainerClasses = (size?: string, orientation?: string) => {
    let sizeClasses = "";

    // Размер
    switch (size) {
      case "small":
        sizeClasses = "w-full md:w-2/3 mx-auto";
        break;
      case "medium":
        sizeClasses = "w-full md:w-4/5 mx-auto";
        break;
      case "large":
      default:
        sizeClasses = "w-full mx-auto";
        break;
    }

    return `${sizeClasses}`;
  };

  const getImageClasses = (size?: string, orientation?: string) => {
    let aspectClasses = "";

    // Ориентация
    switch (orientation) {
      case "vertical":
        aspectClasses = "aspect-[3/4]";
        break;
      case "horizontal":
        aspectClasses = "aspect-[4/3]";
        break;
      default:
        aspectClasses = "";
        break;
    }

    return `w-full ${aspectClasses} h-auto rounded-2xl object-cover`;
  };

  // Компонент заголовка для отдельной фотографии
  const TitleComponent = ({ title }: { title?: string }) => {
    if (!title) return null;
    return (
      <div className="text-adaptive">
        <div className="text-label-sm md:text-label-md font-nyghtserif italic">
          ({renderTextWithLineBreaks(title)})
        </div>
      </div>
    );
  };

  // Компонент текста для отдельной фотографии
  const TextComponent = ({ text }: { text?: string }) => {
    if (!text) return null;
    return (
      <div className="text-adaptive">
        <div className="md:text-paragraph-xl text-paragraph-lg font-euclid">
          {renderTextWithLineBreaks(text)}
        </div>
      </div>
    );
  };

  // Компонент области текста для отдельной фотографии
  const TextAreaComponent = ({ title, text, layout }: { title?: string; text?: string; layout: string }) => {
    if (layout === "text-bottom") {
      // Порядок: заголовок -> текст
      return (
        <div className="space-y-6 md:space-y-12">
          <TitleComponent title={title} />
          <TextComponent text={text} />
        </div>
      );
    }
    
    // layout === "text-top" - порядок: текст -> заголовок
    return (
      <div className="space-y-6 md:space-y-12">
        <TextComponent text={text} />
        <TitleComponent title={title} />
      </div>
    );
  };

  // Компонент общего описания блока
  const DescriptionComponent = () => {
    if (!block.description && !block.descriptionTitle) return null;
    
    return (
      <div className="space-y-4 md:space-y-8 mb-2 md:mb-2">
        {block.descriptionTitle && (
          <div className="text-adaptive">
            <h3 className="text-heading-sm md:text-heading-md font-styrene">
              {renderTextWithLineBreaks(block.descriptionTitle)}
            </h3>
          </div>
        )}
        
        {block.description && (
          <div className="text-adaptive">
            <div className="md:text-paragraph-xl text-center text-paragraph-lg font-euclid">
              {renderTextWithLineBreaks(block.description)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Компонент одной фотографии с текстом
  const ImageItemComponent = ({ image, index }: { image: any; index: number }) => {
    const imageLayout = image.layout || "text-top"; // по умолчанию текст сверху для каждого изображения
    
    if (imageLayout === "text-bottom") {
      // Порядок: фото -> подпись -> (заголовок -> текст)
      return (
        <div className="space-y-3">
          {/* Фотография */}
          <img
            src={image.url}
            alt={image.caption || `Фотография ${index + 1}`}
            className={getImageClasses(block.size, block.orientation)}
          />
          
          {/* Подпись под фото (если есть) */}
          {image.caption && (
            <div className="text-center">
              <div className="text-paragraph-sm font-euclid text-text-soft-400">
                {renderTextWithLineBreaks(image.caption)}
              </div>
            </div>
          )}
          
          {/* Заголовок -> Текст */}
          <TextAreaComponent title={image.title} text={image.text} layout={imageLayout} />
        </div>
      );
    }

    // imageLayout === "text-top" (по умолчанию)
    // Порядок: (текст -> заголовок) -> фото -> подпись
    return (
      <div className="space-y-3">
        {/* Текст -> Заголовок */}
        <TextAreaComponent title={image.title} text={image.text} layout={imageLayout} />
        
        {/* Фотография */}
        <img
          src={image.url}
          alt={image.caption || `Фотография ${index + 1}`}
          className={getImageClasses(block.size, block.orientation)}
        />
        
        {/* Подпись под фото (если есть) */}
        {image.caption && (
          <div className="text-center">
            <div className="text-paragraph-sm font-euclid text-text-soft-400">
              {renderTextWithLineBreaks(image.caption)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Компонент фотографий в две колонки
  const ImagesComponent = () => (
    <div className="grid grid-cols-2 gap-4 md:gap-10">
      {block.images.map((image, index) => (
        <ImageItemComponent key={index} image={image} index={index} />
      ))}
    </div>
  );

  return (
    <div className={`${className}`}>
      <div className={getContainerClasses(block.size, block.orientation)}>
        {/* Описание сверху, если указано */}
        {(!block.descriptionPosition || block.descriptionPosition === "top") && <DescriptionComponent />}
        
        {/* Блок с фотографиями */}
        <ImagesComponent />
        
        {/* Описание снизу, если указано */}
        {block.descriptionPosition === "bottom" && <DescriptionComponent />}
      </div>
    </div>
  );
} 