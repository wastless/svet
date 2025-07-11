"use client";

import { useState, useCallback, memo, useRef } from "react";
import dynamic from "next/dynamic";
import type { TwoVideosBlock as TwoVideosBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import { Spinner } from "~/components/ui/spinner";
import React from "react";

// Динамический импорт react-player для избежания проблем с SSR
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface TwoVideosBlockProps {
  block: TwoVideosBlockType;
  className?: string;
}

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

// Мемоизированный компонент одного видео с текстом
const VideoItemComponent = memo(({ 
  video, 
  index,
  size,
  orientation
}: { 
  video: TwoVideosBlockType['videos'][0]; 
  index: number;
  size?: string;
  orientation?: string;
}) => {
  const [isReady, setIsReady] = useState(false);
  const [videoRatio, setVideoRatio] = useState<number | null>(null);
  const playerRef = useRef<any>(null);
  
  const videoLayout = video.layout || "text-top"; // по умолчанию текст сверху для каждого видео
  
  const handleVideoReady = useCallback((player: any) => {
    setIsReady(true);
    
    // Получаем реальные размеры видео
    if (player && player.getInternalPlayer()) {
      const videoElement = player.getInternalPlayer();
      if (videoElement.videoWidth && videoElement.videoHeight) {
        const ratio = videoElement.videoWidth / videoElement.videoHeight;
        setVideoRatio(ratio);
      }
    }
  }, []);

  // Определяем ориентацию на основе соотношения сторон видео
  const videoOrientation = videoRatio 
    ? (videoRatio < 1 ? "vertical" : "horizontal") 
    : (orientation || "horizontal");

  const getVideoClasses = useCallback(() => {
    // Для вертикальных видео добавляем дополнительный класс для ограничения ширины
    const orientationClass = videoOrientation === "vertical" ? "max-w-[100%] mx-auto" : "";
    return `w-full ${orientationClass} rounded-2xl overflow-hidden bg-black`;
  }, [videoOrientation]);

  // Компонент заголовка для отдельного видео
  const TitleComponent = useCallback(({ title }: { title?: string }) => {
    if (!title) return null;
    return (
      <div className="text-adaptive">
        <div className="text-label-sm md:text-label-md font-nyghtserif italic">
          ({renderTextWithLineBreaks(title)})
        </div>
      </div>
    );
  }, []);

  // Компонент текста для отдельного видео
  const TextComponent = useCallback(({ text }: { text?: string }) => {
    if (!text) return null;
    return (
      <div className="text-adaptive">
        <div className="md:text-paragraph-xl text-paragraph-lg font-euclid">
          {renderTextWithLineBreaks(text)}
        </div>
      </div>
    );
  }, []);

  // Компонент области текста для отдельного видео
  const TextAreaComponent = useCallback(({ title, text, layout }: { title?: string; text?: string; layout: string }) => {
    if (!title && !text) return null;
    
    if (layout === "text-bottom") {
      // Порядок: заголовок > текст
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
  }, [TitleComponent, TextComponent]);
  
  // Определяем, есть ли текст или заголовок
  const hasTextOrTitle = video.text || video.title;
  
  if (videoLayout === "text-bottom") {
    // Порядок: видео -> подпись -> (заголовок -> текст)
    return (
      <div>
        {/* Видео */}
        <div className={getVideoClasses() + " relative"}>
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-200">
              <Spinner />
            </div>
          )}
          
          {video.url && video.url.trim() !== "" ? (
            <ReactPlayer
              ref={playerRef}
              url={video.url}
              width="100%"
              height="100%"
              controls={true}
              playing={video.autoplay || false}
              muted={video.muted !== false}
              loop={video.loop || false}
              onReady={handleVideoReady}
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
        
        {/* Подпись под видео (если есть) */}
        {video.caption && (
          <div className="text-center mt-3">
            <div className="text-paragraph-sm font-euclid text-text-soft-400">
              {renderTextWithLineBreaks(video.caption)}
            </div>
          </div>
        )}
        
        {/* Заголовок -> Текст */}
        {hasTextOrTitle && (
          <div className="mt-3">
            <TextAreaComponent title={video.title} text={video.text} layout={videoLayout} />
          </div>
        )}
      </div>
    );
  }

  // videoLayout === "text-top" (по умолчанию)
  // Порядок: (текст -> заголовок) -> видео -> подпись
  return (
    <div>
      {/* Текст -> Заголовок */}
      {hasTextOrTitle && (
        <div className="mb-3">
          <TextAreaComponent title={video.title} text={video.text} layout={videoLayout} />
        </div>
      )}
      
      {/* Видео */}
      <div className={getVideoClasses() + " relative"}>
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-200">
            <Spinner />
          </div>
        )}
        
        {video.url && video.url.trim() !== "" ? (
          <ReactPlayer
            ref={playerRef}
            url={video.url}
            width="100%"
            height="100%"
            controls={true}
            playing={video.autoplay || false}
            muted={video.muted !== false}
            loop={video.loop || false}
            onReady={handleVideoReady}
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
      
      {/* Подпись под видео (если есть) */}
      {video.caption && (
        <div className="text-center mt-3">
          <div className="text-paragraph-sm font-euclid text-text-soft-400">
            {renderTextWithLineBreaks(video.caption)}
          </div>
        </div>
      )}
    </div>
  );
});

// Для устранения предупреждений React
VideoItemComponent.displayName = 'VideoItemComponent';

export function TwoVideosBlock({ block, className = "" }: TwoVideosBlockProps) {
  const getContainerClasses = useCallback((size?: string) => {
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
  }, []);

  // Мемоизированный компонент видео в две колонки
  const VideosComponent = useCallback(() => (
    <div className="grid grid-cols-2 gap-4 md:gap-10">
      {block.videos.map((video, index) => (
        <VideoItemComponent 
          key={`video-${index}-${video.url}`} 
          video={video} 
          index={index} 
          size={block.size}
          orientation={block.orientation}
        />
      ))}
    </div>
  ), [block.videos, block.size, block.orientation]);

  return (
    <div className={`${className}`}>
      <div className={getContainerClasses(block.size)}>
        <VideosComponent />
      </div>
    </div>
  );
} 