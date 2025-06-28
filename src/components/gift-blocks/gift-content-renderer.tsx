"use client";

import type { GiftContent, GiftBlock, MemoryPhoto, Gift } from "@/utils/types/gift";
import { BaseBlock } from "./base-block";
import { TextBlock } from "./text-block";
import { QuoteBlock } from "./quote-block";
import { ImageBlock } from "./image-block";
import { TwoImagesBlock } from "./two-images-block";
import { VideoCircleBlock } from "./video-circle-block";
import { VideoBlock } from "./video-block";
import { TwoVideosBlock } from "./two-videos-block";
import { AudioMessageBlock } from "./audio-message-block";
import { MusicBlock } from "./music-block";
import { MusicGalleryBlock } from "./music-gallery-block";
import { GalleryBlock } from "./gallery-block";
import { DividerBlock } from "./divider-block";
import { InfoGraphicBlock } from "./infographic-block";
import { TextColumnsBlock } from "./text-columns-block";

interface GiftContentRendererProps {
  content: GiftContent;
  memoryPhoto?: MemoryPhoto | null; // полароидная фотография
  className?: string;
  gift?: Gift; // добавляем объект Gift для получения информации об авторе
}

export function GiftContentRenderer({
  content,
  memoryPhoto,
  className = "",
  gift,
}: GiftContentRendererProps) {
  const renderBlock = (block: GiftBlock, index: number) => {
    const blockKey = `block-${index}`;
    const blockClassName = "my-0"; // отступ между блоками

    switch (block.type) {
      case "text":
        return (
          <TextBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "quote":
        return (
          <QuoteBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "image":
        return (
          <ImageBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "two-images":
        return (
          <TwoImagesBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "two-videos":
        return (
          <TwoVideosBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "video-circle":
        return (
          <VideoCircleBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "video":
        return (
          <VideoBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "audio-message":
        return (
          <AudioMessageBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "music":
        return (
          <MusicBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "musicGallery":
        return (
          <MusicGalleryBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "gallery":
        return (
          <GalleryBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "divider":
        return (
          <DividerBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "infographic":
        return (
          <InfoGraphicBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      case "text-columns":
        return (
          <TextColumnsBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      default:
        return null;
    }
  };

  // Используем author и nickname из gift, если они доступны, иначе используем senderName из метаданных
  const senderName = gift?.author || content.metadata?.senderName;
  // Гарантируем, что nickname будет строкой или undefined, но не null
  const nickname = gift?.nickname ? gift.nickname : undefined;
  const baseText = content.metadata?.description || undefined;

  return (
    <div className={`space-y-16 ${className}`}>
      {/* Базовый блок поздравления (если указано имя отправителя) */}
      {senderName && (
        <BaseBlock
          name={senderName}
          nickname={nickname}
          text={baseText}
          className="mb-12"
        />
      )}

      {/* Рендерим все блоки контента */}
      {content.blocks.map((block: GiftBlock, index: number) => renderBlock(block, index))}
    </div>
  );
} 