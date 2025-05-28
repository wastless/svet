"use client";

import { useState, useRef, useEffect } from "react";
import type { AudioMessageBlock as AudioMessageBlockType } from "~/types/gift";
import { PlayIcon, PauseIcon, LoadingSpinner } from "~/components/ui/icons";

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
    <div className={`space-y-4 ${className}`}>
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

      {/* Голосовое сообщение */}
      <div className="flex justify-center">
        <div className="rounded-2xl p-2 max-w-lg w-full">
          <div className="flex items-center gap-3">
            {/* Кнопка воспроизведения */}
            <button
              onClick={handlePlayPause}
              disabled={!isReady}
              className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-all disabled:opacity-50"
            >
              {!isReady ? (
                <LoadingSpinner className="h-5 w-5 text-white" />
              ) : isPlaying ? (
                <PauseIcon className="w-5 h-5 text-white" />
              ) : (
                <PlayIcon className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            {/* Визуализация волны */}
            <div className="flex-1">
              <div ref={waveformRef} className="w-full" />
            </div>

            {/* Время */}
            <div className="text-white text-paragraph-sm font-euclid min-w-[40px]">
              {isPlaying ? formatTime(currentTime) : formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 