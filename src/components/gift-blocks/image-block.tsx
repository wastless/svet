"use client";

import type { ImageBlock as ImageBlockType } from "@/utils/types/gift";

interface ImageBlockProps {
  block: ImageBlockType;
  className?: string;
}

export function ImageBlock({ block, className = "" }: ImageBlockProps) {
  const layout = block.layout || "image-center"; // по умолчанию фото снизу

  const getImageClasses = (size?: string, orientation?: string, isHorizontalLayout?: boolean) => {
    let sizeClasses = "";
    let aspectClasses = "";

    // Размер
    if (isHorizontalLayout) {
      // При горизонтальных макетах изображение занимает всю ширину контейнера
      sizeClasses = "w-full";
    } else {
      // При центральном расположении используем новые размеры
      switch (size) {
        case "small":
          sizeClasses = "w-1/3 mx-auto";
          break;
        case "medium":
          sizeClasses = "w-2/3 mx-auto";
          break;
        case "large":
        default:
          sizeClasses = "w-full mx-auto";
          break;
      }
    }

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

    return `${sizeClasses} ${aspectClasses} h-auto rounded-2xl object-cover`;
  };

  const getGridColumns = (size?: string, orientation?: string, isImageRight?: boolean) => {
    const isVertical = orientation === "vertical";
    
    if (isVertical) {
      // Для вертикальных фотографий используем другие пропорции
      switch (size) {
        case "large":
          // large = 1/2 для вертикального изображения
          return {
            imageCols: "md:col-span-1",
            textCols: "md:col-span-1"
          };
        case "medium":
          // medium = 1/3 для вертикального изображения
          if (isImageRight) {
            return {
              textCols: "md:col-span-2",
              imageCols: "md:col-span-1"
            };
          } else {
            return {
              imageCols: "md:col-span-1",
              textCols: "md:col-span-2"
            };
          }
        case "small":
          // small = 1/4 для вертикального изображения
          if (isImageRight) {
            return {
              textCols: "md:col-span-3",
              imageCols: "md:col-span-1"
            };
          } else {
            return {
              imageCols: "md:col-span-1",
              textCols: "md:col-span-3"
            };
          }
        default:
          return {
            imageCols: "md:col-span-1",
            textCols: "md:col-span-1"
          };
      }
    } else {
      // Для горизонтальных фотографий оставляем прежние пропорции
      switch (size) {
        case "large":
          // large = 2/3 для горизонтального изображения
          if (isImageRight) {
            return {
              textCols: "md:col-span-1",
              imageCols: "md:col-span-2"
            };
          } else {
            return {
              imageCols: "md:col-span-2",
              textCols: "md:col-span-1"
            };
          }
        case "medium":
          // medium = 1/2 для горизонтального изображения
          return {
            imageCols: "md:col-span-1",
            textCols: "md:col-span-1"
          };
        case "small":
          // small = 1/3 для горизонтального изображения
          if (isImageRight) {
            return {
              textCols: "md:col-span-2",
              imageCols: "md:col-span-1"
            };
          } else {
            return {
              imageCols: "md:col-span-1",
              textCols: "md:col-span-2"
            };
          }
        default:
          return {
            imageCols: "md:col-span-2",
            textCols: "md:col-span-1"
          };
      }
    }
  };

  // Компонент заголовка
  const TitleComponent = ({ centered = false }: { centered?: boolean }) => {
    if (!block.title) return null;
    return (
      <div className={`text-adaptive ${centered ? 'text-center' : ''}`}>
        <p className="text-label-md font-nyghtserif italic">
          ({block.title})
        </p>
      </div>
    );
  };

  // Компонент текста
  const TextComponent = ({ centered = false }: { centered?: boolean }) => {
    if (!block.text) return null;
    return (
      <div className={`text-adaptive ${centered ? 'text-center' : ''}`}>
        <p className="text-paragraph-xl font-euclid">
          {block.text}
        </p>
      </div>
    );
  };

  // Компонент области текста (заголовок + текст)
  const TextAreaComponent = ({ centered = false }: { centered?: boolean }) => (
    <div className="space-y-2">
      <TitleComponent centered={centered} />
      <TextComponent centered={centered} />
    </div>
  );

  // Компонент фотографии
  const ImageComponent = ({ align }: { align?: "left" | "right" | "center" }) => {
    const isHorizontalLayout = layout === "image-left" || layout === "image-right";
    
    let alignClass = "";
    if (align === "left") alignClass = "mr-auto";
    else if (align === "right") alignClass = "ml-auto";
    else if (align === "center") alignClass = "mx-auto";
    
    return (
      <div className="w-full">
        <img
          src={block.url}
          alt={block.caption || "Фотография"}
          className={`${getImageClasses(block.size, block.orientation, isHorizontalLayout)} ${alignClass}`}
        />
        {/* Подпись под фото (если есть) */}
        {block.caption && (
          <div className="text-center mt-4">
            <p className="text-paragraph-md font-euclid text-text-soft-400">
              {block.caption}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Рендерим в зависимости от layout
  if (layout === "image-right") {
    const { textCols, imageCols } = getGridColumns(block.size, block.orientation, true);
    
    // Определяем количество колонок в зависимости от размера и ориентации
    let gridCols = "md:grid-cols-3"; // по умолчанию
    if (block.orientation === "vertical") {
      if (block.size === "large") gridCols = "md:grid-cols-2";
      else if (block.size === "medium") gridCols = "md:grid-cols-3";
      else if (block.size === "small") gridCols = "md:grid-cols-4";
    } else {
      if (block.size === "medium") gridCols = "md:grid-cols-2";
      else gridCols = "md:grid-cols-3";
    }
    
    return (
      <div className={`space-y-6 ${className}`}>
        <div className={`grid grid-cols-1 ${gridCols} gap-8 items-start`}>
          <div className={`space-y-6 ${textCols}`}>
            <TextAreaComponent />
          </div>
          <div className={imageCols}>
            <ImageComponent align="right" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "image-left") {
    const { imageCols, textCols } = getGridColumns(block.size, block.orientation, false);
    
    // Определяем количество колонок в зависимости от размера и ориентации
    let gridCols = "md:grid-cols-3"; // по умолчанию
    if (block.orientation === "vertical") {
      if (block.size === "large") gridCols = "md:grid-cols-2";
      else if (block.size === "medium") gridCols = "md:grid-cols-3";
      else if (block.size === "small") gridCols = "md:grid-cols-4";
    } else {
      if (block.size === "medium") gridCols = "md:grid-cols-2";
      else gridCols = "md:grid-cols-3";
    }
    
    return (
      <div className={`space-y-6 ${className}`}>
        <div className={`grid grid-cols-1 ${gridCols} gap-8 items-start`}>
          <div className={imageCols}>
            <ImageComponent align="left" />
          </div>
          <div className={`space-y-6 ${textCols}`}>
            <TextAreaComponent />
          </div>
        </div>
      </div>
    );
  }

  // layout === "image-center" (по умолчанию)
  const isVertical = block.orientation === "vertical";
  
  // Для вертикальных изображений в центральном расположении используем flex
  if (isVertical) {
    let imageWidth = "w-1/2"; // по умолчанию для large
    
    switch (block.size) {
      case "large":
        imageWidth = "w-1/2"; // 50%
        break;
      case "medium":
        imageWidth = "w-1/3"; // 33.33%
        break;
      case "small":
        imageWidth = "w-1/4"; // 25%
        break;
      default:
        imageWidth = "w-1/2";
        break;
    }

    return (
      <div className={`space-y-6 ${className}`}>
        <TextAreaComponent centered={true} />
        <div className="w-full flex flex-col items-center">
          <img
            src={block.url}
            alt={block.caption || "Фотография"}
            className={`${imageWidth} aspect-[3/4] h-auto rounded-2xl object-cover`}
          />
          {/* Подпись под фото (если есть) */}
          {block.caption && (
            <div className="text-center mt-4">
              <p className="text-paragraph-md font-euclid text-text-soft-400">
                {block.caption}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Для горизонтальных изображений используем прежний подход
  return (
    <div className={`space-y-6 ${className}`}>
      <TextAreaComponent centered={true} />
      <ImageComponent align="center" />
    </div>
  );
} 