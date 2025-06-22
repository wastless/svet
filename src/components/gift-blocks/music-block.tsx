"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { MusicBlock as MusicBlockType } from "@/utils/types/gift";
import { 
  PlayIcon, 
  PauseIcon, 
  ErrorIcon, 
  LoadingSpinner, 
  VolumeOnIcon, 
  VolumeOffIcon
} from "~/components/ui/icons";
import { processText } from "./base-block";

interface MusicBlockProps {
  block: MusicBlockType;
  className?: string;
  audioRef?: (audio: HTMLAudioElement | null) => void;
}

export function MusicBlock({ block, className = "", audioRef }: MusicBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(block.duration || 0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const internalAudioRef = useRef<HTMLAudioElement>(null);

  // Если предоставлен внешний audioRef, используем его для передачи текущего аудио элемента
  useEffect(() => {
    if (audioRef && internalAudioRef.current) {
      audioRef(internalAudioRef.current);
    }
    
    return () => {
      // При размонтировании компонента передаем null
      if (audioRef) {
        audioRef(null);
      }
    };
  }, [audioRef]);

  useEffect(() => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    console.log('MusicBlock: Инициализация аудио с URL:', block.url);

    const handleLoadStart = () => {
      console.log('MusicBlock: Начало загрузки аудио');
      setIsLoading(true);
      setHasError(false);
    };

    const handleLoadedMetadata = () => {
      console.log('MusicBlock: Метаданные загружены, длительность:', audio.duration);
      setDuration(audio.duration);
    };

    const handleCanPlayThrough = () => {
      console.log('MusicBlock: Аудио готово к воспроизведению');
      setIsReady(true);
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      console.error('MusicBlock: Ошибка загрузки аудио:', audio.error);
      console.error('MusicBlock: URL аудио:', block.url);
      console.error('MusicBlock: Код ошибки:', audio.error?.code);
      console.error('MusicBlock: Сообщение ошибки:', audio.error?.message);
      setIsReady(false);
      setIsLoading(false);
      setHasError(true);
    };

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const total = audio.duration;
      setCurrentTime(current);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    };

    const handlePlay = () => {
      console.log('MusicBlock: Воспроизведение началось');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('MusicBlock: Воспроизведение приостановлено');
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      console.log('MusicBlock: Воспроизведение завершено');
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };

    const handleWaiting = () => {
      console.log('MusicBlock: Ожидание данных');
      setIsLoading(true);
    };
    
    const handleCanPlay = () => {
      console.log('MusicBlock: Можно начать воспроизведение');
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    // Принудительно загружаем метаданные
    console.log('MusicBlock: Принудительная загрузка аудио');
    audio.load();

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [block.url]);

  useEffect(() => {
    const audio = internalAudioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = async () => {
    const audio = internalAudioRef.current;
    if (!audio || (!isReady && !hasError)) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
      setHasError(true);
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const getPlayButtonContent = () => {
    if (hasError) {
      return <ErrorIcon className="w-5 h-5 text-white" />;
    }

    if (isLoading || !isReady) {
      return <LoadingSpinner className="w-5 h-5 border-white" />;
    }

    if (isPlaying) {
      return <PauseIcon className="w-5 h-5 text-white" />;
    }

    return <PlayIcon className="w-5 h-5 text-white ml-0.5" />;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeOffIcon className="w-5 h-5" />;
    }
    
    return <VolumeOnIcon className="w-5 h-5" />;
  };

  return (
    <>
      <style jsx>{`
        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 1.5px;
          outline: none;
          cursor: pointer;
          background: #4b5563;
        }
        
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
          cursor: pointer;
        }
        
        .volume-slider::-moz-range-thumb {
          width: 0;
          height: 0;
          border: none;
          background: transparent;
          cursor: pointer;
        }
      `}</style>
      
      <div className={`space-y-6 ${className}`}>
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

        {/* Музыкальный плеер как в примере */}
        <div className="flex justify-center">
          <div className="bg-neutral-900 rounded-xl px-4 py-2 w-full max-w-xl">
            <div className="flex items-center gap-3">
              {/* Обложка с кнопкой плей/пауза */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer" onClick={handlePlayPause}>
                {block.coverUrl && block.coverUrl.trim() !== "" ? (
                  <Image
                    src={block.coverUrl}
                    alt={`${block.trackName} - ${block.artist}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <div className="text-neutral-500 text-xs">No image</div>
                  </div>
                )}
                {/* Overlay с кнопкой */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full bg-neutral-900 bg-opacity-60 flex items-center justify-center transition-all duration-200 relative overflow-hidden group/button ${
                    (isLoading || hasError) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/button:opacity-20 transition-opacity duration-200 rounded-full pointer-events-none"></div>
                    <div className="relative z-10">
                      {getPlayButtonContent()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between w-full">
              {/* Информация о треке рядом с обложкой */}
              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="font-euclid text-paragraph-md font-medium text-white truncate">
                  {block.trackName}
                </h3>
                <p className="font-euclid text-paragraph-sm text-gray-400 truncate">
                  {block.artist}
                </p>
              </div>

              {/* Управление громкостью */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Кнопка громкости */}
                <button
                  onClick={handleVolumeToggle}
                  className="text-neutral-300 hover:text-white transition-colors"
                  title={isMuted ? 'Включить звук' : 'Отключить звук'}
                >
                  {getVolumeIcon()}
                </button>

                {/* Слайдер громкости - скрыт на мобильных */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider w-16 hidden md:block"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                  }}
                />
                </div>

              </div>
            </div>

            {/* Скрытый аудио элемент */}
            <audio
              ref={internalAudioRef}
              src={block.url && block.url.trim() !== "" ? block.url : undefined}
              preload="metadata"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </div>
    </>
  );
} 