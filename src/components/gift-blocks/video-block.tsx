"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { VideoBlock as VideoBlockType } from "@/utils/types/gift";

// Динамический импорт react-player для избежания проблем с SSR
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoBlockProps {
  block: VideoBlockType;
  className?: string;
}

export function VideoBlock({ block, className = "" }: VideoBlockProps) {
  const [isReady, setIsReady] = useState(false);

  const getVideoClasses = (size?: string) => {
    let sizeClasses = "";

    switch (size) {
      case "small":
        sizeClasses = "w-1/2 mx-auto";
        break;
      case "medium":
        sizeClasses = "w-2/3 mx-auto";
        break;
      case "large":
      default:
        sizeClasses = "w-full mx-auto";
        break;
    }

    return `${sizeClasses} aspect-video rounded-2xl overflow-hidden bg-black`;
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex flex-col gap-1">
        {/* Заголовок */}
        {block.title && (
          <div className="text-center text-adaptive">
            <p className="font-nyghtserif text-label-md italic">
              ({block.title})
            </p>
          </div>
        )}

        {/* Текст */}
        {block.text && (
          <div className="text-center text-adaptive">
            <p className={`font-euclid ${
              block.textSize === "small" 
                ? "text-paragraph-lg" 
                : "text-paragraph-xl"
            }`}>
              {block.text}
            </p>
          </div>
        )}
      </div>

<div className="flex flex-col gap-3">
      {/* Видео с стандартными контролами */}
      <div className="w-full">
        <div className={getVideoClasses(block.size)}>
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-200">
              <div className="border-blue-500 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          )}

          <ReactPlayer
            url={block.url}
            width="100%"
            height="100%"
            controls={true} // Включаем стандартные контролы
            playing={block.autoplay || false}
            muted={block.muted !== false} // По умолчанию звук включен
            loop={block.loop || false}
            onReady={() => setIsReady(true)}
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload", // Убираем кнопку скачивания
                  disablePictureInPicture: false, // Разрешаем picture-in-picture
                  style: {
                    borderRadius: "1rem", // Скругленные углы
                    objectFit: "cover", // Заполняем всю область
                    width: "100%",
                    height: "100%",
                  },
                },
              },
            }}
            style={{
              borderRadius: "1rem",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* Подпись под видео */}
      {block.caption && (
        <div className="text-center">
          <p className="font-euclid text-paragraph-md text-text-soft-400">
            {block.caption}
          </p>
        </div>
      )}
    </div>
    </div>
  );
}
