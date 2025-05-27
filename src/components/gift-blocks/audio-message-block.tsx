"use client";

import { useState, useRef, useEffect } from "react";
import type { AudioMessageBlock as AudioMessageBlockType } from "~/types/gift";

interface AudioMessageBlockProps {
  block: AudioMessageBlockType;
  className?: string;
}

export function AudioMessageBlock({ block, className = "" }: AudioMessageBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(block.duration || 0);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && waveformRef.current && !wavesurferRef.current) {
      import("wavesurfer.js").then((WaveSurferModule) => {
        const WaveSurfer = WaveSurferModule.default;
        
        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: '#3D3D3D', // темный цвет волны
          progressColor: '#ffffff', // белый цвет прогресса
          cursorColor: 'transparent',
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          height: 32,
          normalize: true,
          backend: 'WebAudio',
          mediaControls: false,
        });

        wavesurferRef.current.load(block.url);

        wavesurferRef.current.on('ready', () => {
          setIsReady(true);
          setDuration(wavesurferRef.current.getDuration());
        });

        wavesurferRef.current.on('audioprocess', () => {
          setCurrentTime(wavesurferRef.current.getCurrentTime());
        });

        wavesurferRef.current.on('play', () => {
          setIsPlaying(true);
        });

        wavesurferRef.current.on('pause', () => {
          setIsPlaying(false);
        });

        wavesurferRef.current.on('finish', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [block.url]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
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

      {/* Голосовое сообщение */}
      <div className="flex justify-center">
        <div className="rounded-2xl p-4 max-w-md w-full">
          <div className="flex items-center gap-3">
            {/* Кнопка воспроизведения */}
            <button
              onClick={handlePlayPause}
              disabled={!isReady}
              className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-all disabled:opacity-50"
            >
              {!isReady ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg 
                  className="w-5 h-5 text-white ml-0.5" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Визуализация волны */}
            <div className="flex-1">
              <div ref={waveformRef} className="w-full" />
            </div>

            {/* Время */}
            <div className="text-white text-sm font-mono min-w-[40px]">
              {isPlaying ? formatTime(currentTime) : formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 