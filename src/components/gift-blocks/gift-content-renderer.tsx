"use client";

import type { GiftContent, GiftBlock, MemoryPhoto } from "@/utils/types/gift";
import { BaseBlock } from "./base-block";
import { TextBlock } from "./text-block";
import { QuoteBlock } from "./quote-block";
import { ImageBlock } from "./image-block";
import { TwoImagesBlock } from "./two-images-block";
import { VideoCircleBlock } from "./video-circle-block";
import { VideoBlock } from "./video-block";
import { AudioMessageBlock } from "./audio-message-block";
import { MusicBlock } from "./music-block";
import { GalleryBlock } from "./gallery-block";

interface GiftContentRendererProps {
  content: GiftContent;
  memoryPhoto?: MemoryPhoto; // полароидная фотография
  className?: string;
}

export function GiftContentRenderer({
  content,
  memoryPhoto,
  className = "",
}: GiftContentRendererProps) {
  const renderBlock = (block: GiftBlock, index: number) => {
    const blockKey = `block-${index}`;
    const blockClassName = "mb-12"; // отступ между блоками

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
      case "gallery":
        return (
          <GalleryBlock 
            key={blockKey}
            block={block}
            className={blockClassName}
          />
        );
      default:
        return null;
    }
  };

  const senderName = content.metadata?.senderName;
  const baseText = content.metadata?.description || "С днем рождения!";

  return (
    <div className={`space-y-20 ${className}`}>
      {/* Базовый блок поздравления (если указано имя отправителя) */}
      {senderName && (
        <BaseBlock
          name={senderName}
          memoryPhotoText={memoryPhoto?.text}
          text={baseText}
          className="mb-16"
        />
      )}

      {/* Рендерим все блоки контента */}
      {content.blocks.map((block: GiftBlock, index: number) => renderBlock(block, index))}
    </div>
  );
} 