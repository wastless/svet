"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { MusicBlock as MusicBlockType } from "~/types/gift";

interface MusicBlockProps {
  block: MusicBlockType;
  className?: string;
}

export function MusicBlock({ block, className = "" }: MusicBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(block.duration || 0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
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
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
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
      return (
        <svg 
          className="w-5 h-5 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      );
    }

    if (isLoading || !isReady) {
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
    }

    if (isPlaying) {
      return (
        <svg 
          className="w-5 h-5 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      );
    }

    return (
      <svg 
        className="w-5 h-5 text-white ml-0.5" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z"/>
      </svg>
    );
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    );
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
        <div className="flex flex-col gap-2">
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
              <p className="font-euclid text-paragraph-lg">{block.text}</p>
            </div>
          )}
        </div>

        {/* Музыкальный плеер как в примере */}
        <div className="flex justify-center">
          <div className="bg-[#3D3D3D] rounded-xl p-3 w-full max-w-xl">
            <div className="flex items-center gap-3">
              {/* Обложка с кнопкой плей/пауза */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer" onClick={handlePlayPause}>
                <Image
                  src={block.coverUrl}
                  alt={`${block.trackName} - ${block.artist}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
                {/* Overlay с кнопкой */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full bg-black bg-opacity-60 flex items-center justify-center transition-all duration-200 ${
                    isPlaying || isLoading || hasError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {getPlayButtonContent()}
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
                  className="text-gray-400 hover:text-white transition-colors"
                  title={isMuted ? 'Включить звук' : 'Отключить звук'}
                >
                  {getVolumeIcon()}
                </button>

                {/* Слайдер громкости */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider w-16"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                  }}
                />
                </div>

                {/* Кнопка ссылки на Яндекс.Музыку */}
                {block.yandexMusicUrl && (
                  <a
                    href={block.yandexMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors ml-1"
                    title="Открыть в Яндекс.Музыке"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Скрытый аудио элемент */}
            <audio
              ref={audioRef}
              src={block.url}
              preload="metadata"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </div>
    </>
  );
} 