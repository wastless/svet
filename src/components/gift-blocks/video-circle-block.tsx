"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { VideoCircleBlock as VideoCircleBlockType } from "@/utils/types/gift";
import { VolumeOnIcon, VolumeOffIcon } from "~/components/ui/icons";
import { processText } from "./base-block";

// Динамический импорт react-player для избежания проблем с SSR
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoCircleBlockProps {
  block: VideoCircleBlockType;
  className?: string;
}

export function VideoCircleBlock({ block, className = "" }: VideoCircleBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<any>(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем срабатывание click на родителе
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getSizeClasses = (size?: string) => {
    switch (size) {
      case "small":
        return "w-48 h-48"; // 192px
      case "medium":
        return "w-64 h-64"; // 256px
      case "large":
      default:
        return "w-96 h-96"; // 384px
    }
  };

  // Вычисляем длину окружности для прогресс-бара (2 * π * r)
  const circleRadius = 50;
  const circumference = 2 * Math.PI * circleRadius; // ≈ 314.16
  const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;

  // Обновляем время каждую секунду во время воспроизведения
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        setCurrentTime(currentTime);
      }, 100); // Обновляем каждые 100мс для плавности
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex flex-col gap-2">
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
            <div className={`font-euclid ${
              block.textSize === "medium" 
              ? "text-paragraph-lg md:text-paragraph-xl"
              : "text-paragraph-md md:text-paragraph-lg" 
            }`}>
              {processText(block.text)}
            </div>
          </div>
        )}
      </div>

      {/* Видеокружок */}
      <div className="flex flex-col gap-3">
      <div className="flex justify-center">
        <div 
          className={`relative ${getSizeClasses(block.size)} group cursor-pointer overflow-hidden rounded-full bg-bg-strong-950`}
          onClick={handlePlayPause}
        >
          {/* React Player с кастомным стилем для круглой формы */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <ReactPlayer
              ref={playerRef}
              url={block.url && block.url.trim() !== "" ? block.url : undefined}
              playing={isPlaying}
              muted={isMuted}
              loop={block.loop}
              width="100%"
              height="100%"
              onReady={() => setIsReady(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onDuration={(duration) => setDuration(duration)}
              onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
              config={{
                file: {
                  attributes: {
                    style: {
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                    },
                  },
                },
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                minWidth: '100%',
                minHeight: '100%',
              }}
            />
          </div>

          {/* Круговой прогресс-бар */}
          {isReady && duration > 0 && isPlaying && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Прогресс */}
                <circle
                  cx="50"
                  cy="50"
                  r="50"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  className="transition-all duration-100"
                />
              </svg>
            </div>
          )}

          {/* Кнопка управления звуком - по центру сверху, только когда видео не играет */}
          {!isPlaying && isReady && (
            <button
              onClick={handleMuteToggle}
              className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-black bg-opacity-40 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all z-10"
            >
              {isMuted ? (
                <VolumeOffIcon className="w-4 h-4 text-white" />
              ) : (
                <VolumeOnIcon className="w-4 h-4 text-white" />
              )}
            </button>
          )}

          {/* Индикатор загрузки */}
          {!isReady && (
            <div className="absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Подпись под видео (если есть) */}
      {block.caption && (
        <div className="text-center">
          <div className="font-euclid text-paragraph-md text-text-soft-400">
            {processText(block.caption)}
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 