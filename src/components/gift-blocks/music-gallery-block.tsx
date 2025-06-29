"use client";

import React, { useState, useRef, useEffect } from "react";
import type { MusicGalleryBlock as MusicGalleryBlockType } from "@/utils/types/gift";
import { processText } from "./base-block";
import { MusicBlock } from "./music-block";

interface MusicGalleryBlockProps {
  block: MusicGalleryBlockType;
  className?: string;
}

export function MusicGalleryBlock({ block, className = "" }: MusicGalleryBlockProps) {
  // Состояние для отслеживания активного (воспроизводящегося) трека
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  // Refs для хранения аудио элементов
  const audioRefs = useRef<{ [id: string]: HTMLAudioElement | null }>({});
  
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

  // Преобразование трека галереи в формат MusicBlock
  const convertTrackToMusicBlock = (track: typeof block.tracks[0]) => {
    return {
      type: "music",
      id: track.id,
      url: track.url,
      artist: track.artist,
      trackName: track.trackName,
      coverUrl: track.coverUrl,
      duration: track.duration,
    };
  };

  // Обработчик начала воспроизведения трека
  const handleTrackPlay = (trackId: string) => {
    // Если воспроизводится другой трек, останавливаем его
    if (activeTrackId && activeTrackId !== trackId) {
      const prevAudio = audioRefs.current[activeTrackId];
      if (prevAudio) {
        prevAudio.pause();
      }
    }
    // Устанавливаем новый активный трек
    setActiveTrackId(trackId);
  };

  // Обработчик остановки трека
  const handleTrackPause = (trackId: string) => {
    // Если останавливаемый трек - текущий активный трек, сбрасываем состояние
    if (activeTrackId === trackId) {
      setActiveTrackId(null);
    }
  };

  // Регистрация аудио элемента в refs
  const registerAudioRef = (trackId: string, audioElement: HTMLAudioElement | null) => {
    audioRefs.current[trackId] = audioElement;
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Заголовок и текст блока галереи */}
      {(block.title || block.text) && (
        <div className="flex flex-col gap-1 mb-6">
          {block.title && (
            <div className="text-center text-adaptive">
              <div className="font-nyghtserif text-label-sm md:text-label-md italic">
                ({renderTextWithLineBreaks(block.title)})
              </div>
            </div>
          )}

          {block.text && (
            <div className="text-center text-adaptive">
              <div className="font-euclid text-paragraph-lg md:text-paragraph-xl">
                {renderTextWithLineBreaks(block.text)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Список музыкальных блоков */}
      <div className="flex flex-col gap-4">
        {block.tracks.map((track) => (
          <MusicGalleryTrack 
            key={track.id}
            track={convertTrackToMusicBlock(track) as any}
            isActive={activeTrackId === track.id}
            onPlay={() => handleTrackPlay(track.id)}
            onPause={() => handleTrackPause(track.id)}
            registerAudioRef={(audio) => registerAudioRef(track.id, audio)}
          />
        ))}
      </div>
    </div>
  );
}

// Компонент для отдельного трека в галерее с дополнительными пропсами
interface MusicGalleryTrackProps {
  track: any;
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
  registerAudioRef: (audio: HTMLAudioElement | null) => void;
}

function MusicGalleryTrack({ track, isActive, onPlay, onPause, registerAudioRef }: MusicGalleryTrackProps) {
  // Оборачиваем стандартный MusicBlock и добавляем обработчики событий
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // При получении аудио элемента добавляем обработчики событий
  useEffect(() => {
    if (!audioElement) return;
    
    // Регистрируем аудио элемент в родительском компоненте
    registerAudioRef(audioElement);
    
    // Добавляем обработчики событий
    audioElement.addEventListener('play', onPlay);
    audioElement.addEventListener('pause', onPause);
    audioElement.addEventListener('ended', onPause);
    
    // Очистка при размонтировании или изменении аудио элемента
    return () => {
      audioElement.removeEventListener('play', onPlay);
      audioElement.removeEventListener('pause', onPause);
      audioElement.removeEventListener('ended', onPause);
    };
  }, [audioElement, onPlay, onPause, registerAudioRef]);
  
  // Обработчик для получения аудио элемента из MusicBlock
  const handleAudioRef = (audio: HTMLAudioElement | null) => {
    setAudioElement(audio);
  };
  
  return (
    <MusicBlock 
      block={track}
      audioRef={handleAudioRef}
    />
  );
} 