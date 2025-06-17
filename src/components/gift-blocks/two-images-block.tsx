"use client";

import type { TwoImagesBlock as TwoImagesBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";

interface TwoImagesBlockProps {
  block: TwoImagesBlockType;
  className?: string;
}

export function TwoImagesBlock({ block, className = "" }: TwoImagesBlockProps) {
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
          ({processText(title)})
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
          {processText(text)}
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
                {processText(image.caption)}
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
              {processText(image.caption)}
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
      <ImagesComponent />
    </div>
  );
} 