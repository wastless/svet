"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { VideoBlock as VideoBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import { Spinner } from "~/components/ui/spinner";

// Динамический импорт react-player для избежания проблем с SSR
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoBlockProps {
  block: VideoBlockType;
  className?: string;
}

export function VideoBlock({ block, className = "" }: VideoBlockProps) {
  const [isReady, setIsReady] = useState(false);
  const [videoRatio, setVideoRatio] = useState<number | null>(null);
  const playerRef = useRef<any>(null);

  // Обработчик события готовности видео
  const handleReady = (player: any) => {
    setIsReady(true);
    
    // Получаем реальные размеры видео
    if (player && player.getInternalPlayer()) {
      const videoElement = player.getInternalPlayer();
      if (videoElement.videoWidth && videoElement.videoHeight) {
        const ratio = videoElement.videoWidth / videoElement.videoHeight;
        setVideoRatio(ratio);
      }
    }
  };

  // Определяем ориентацию на основе соотношения сторон видео
  const videoOrientation = videoRatio 
    ? (videoRatio < 1 ? "vertical" : "horizontal") 
    : (block.orientation || "horizontal");

  const getVideoClasses = (size?: string) => {
    let sizeClasses = "";

    // Определяем размер контейнера на основе параметра size и ориентации
    if (videoOrientation === "vertical") {
      // Для вертикальных видео используем меньшую ширину
      switch (size) {
        case "small":
          sizeClasses = "w-full md:w-1/4 mx-auto";
          break;
        case "medium":
          sizeClasses = "w-full md:w-1/3 mx-auto";
          break;
        case "large":
          sizeClasses = "w-full md:w-1/2 mx-auto";
          break;
        default:
          sizeClasses = "w-full md:w-1/2 mx-auto";
          break;
      }
    } else {
      // Для горизонтальных видео
      switch (size) {
        case "small":
          sizeClasses = "w-full md:w-1/3 mx-auto";
          break;
        case "medium":
          sizeClasses = "w-full md:w-2/3 mx-auto";
          break;
        case "large":
        default:
          sizeClasses = "w-full mx-auto";
          break;
      }
    }

    return `${sizeClasses} rounded-2xl overflow-hidden bg-black`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-1">
        {/* Заголовок */}
        {block.title && (
          <div className="text-center text-adaptive">
            <div className="font-nyghtserif text-label-sm md:text-label-md italic">
              ({processText(block.title)})
            </div>
          </div>
        )}

        {/* Текст */}
        {block.text && (
          <div className="text-center text-adaptive">
            <div className="font-euclid text-paragraph-lg md:text-paragraph-xl">
              {processText(block.text)}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0">
        {/* Видео с стандартными контролами */}
        <div className="w-full">
          <div className={getVideoClasses(block.size) + " relative"}>
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-200">
                <Spinner />
              </div>
            )}

            {block.url && block.url.trim() !== "" ? (
              <ReactPlayer
                ref={playerRef}
                url={block.url}
                width="100%"
                height="100%"
                controls={true}
                playing={block.autoplay || false}
                muted={block.muted !== false}
                loop={block.loop || false}
                onReady={(player) => handleReady(player)}
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                      disablePictureInPicture: false,
                      style: {
                        borderRadius: "1rem",
                        objectFit: "contain", // Всегда используем contain для сохранения пропорций
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
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Видео отсутствует</div>
              </div>
            )}
          </div>
        </div>

        {/* Подпись под видео */}
        {block.caption && (
          <div className="text-center mt-4">
            <div className="font-euclid text-paragraph-md text-text-soft-400">
              {processText(block.caption)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
