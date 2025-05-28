"use client";

import React, { useState, useEffect } from "react";
import type { GiftContent, GiftBlock } from "@/utils/types/gift";
import { BlockEditor } from "./block-editor";

interface ContentBlocksEditorProps {
  content: GiftContent;
  onChange: (content: GiftContent) => void;
  giftId?: string;
}

export function ContentBlocksEditor({ content, onChange, giftId }: ContentBlocksEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleContentChange = (newContent: GiftContent) => {
    setLocalContent(newContent);
    onChange(newContent);
  };

  const handleMetadataChange = (field: string, value: string) => {
    const newContent = {
      ...localContent,
      metadata: {
        ...localContent.metadata,
        [field]: value,
      },
    };
    handleContentChange(newContent);
  };

  const handleBlockChange = (index: number, block: GiftBlock) => {
    const newBlocks = [...localContent.blocks];
    newBlocks[index] = block;
    handleContentChange({
      ...localContent,
      blocks: newBlocks,
    });
  };

  const handleAddBlock = (type: GiftBlock["type"]) => {
    let newBlock: GiftBlock;

    switch (type) {
      case "text":
        newBlock = { type: "text", content: "", style: "normal" };
        break;
      case "quote":
        newBlock = { type: "quote", content: "", style: "small" };
        break;
      case "image":
        newBlock = { type: "image", url: "", layout: "image-center", size: "medium", orientation: "horizontal" };
        break;
      case "two-images":
        newBlock = { type: "two-images", images: [{ url: "" }, { url: "" }], size: "medium", orientation: "horizontal" };
        break;
      case "gallery":
        newBlock = { type: "gallery", images: [{ url: "" }], columns: 2 };
        break;
      case "video-circle":
        newBlock = { type: "video-circle", url: "", size: "medium", autoplay: false, muted: true, loop: false };
        break;
      case "video":
        newBlock = { type: "video", url: "", size: "medium", autoplay: false, muted: true, loop: false };
        break;
      case "audio-message":
        newBlock = { type: "audio-message", url: "" };
        break;
      case "music":
        newBlock = { type: "music", url: "", coverUrl: "", artist: "", trackName: "" };
        break;
      default:
        return;
    }

    handleContentChange({
      ...localContent,
      blocks: [...localContent.blocks, newBlock],
    });
  };

  const handleRemoveBlock = (index: number) => {
    const newBlocks = localContent.blocks.filter((_, i) => i !== index);
    handleContentChange({
      ...localContent,
      blocks: newBlocks,
    });
  };

  const handleMoveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...localContent.blocks];
    const movedBlock = newBlocks[fromIndex];
    if (!movedBlock) return;
    
    newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    
    handleContentChange({
      ...localContent,
      blocks: newBlocks,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      handleMoveBlock(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const blockTypes = [
    { type: "text", name: "Текст", icon: "📝", description: "Обычный текст с выбором стиля" },
    { type: "quote", name: "Цитата", icon: "💬", description: "Цитата с рамкой" },
    { type: "image", name: "Фото", icon: "🖼️", description: "Одиночное изображение с текстом" },
    { type: "two-images", name: "Два фото", icon: "🖼️🖼️", description: "Два изображения рядом" },
    { type: "gallery", name: "Галерея", icon: "🎨", description: "Галерея изображений" },
    { type: "video-circle", name: "Видеокружок", icon: "⭕", description: "Круглое видео" },
    { type: "video", name: "Видео", icon: "🎬", description: "Обычное видео" },
    { type: "audio-message", name: "Голосовое", icon: "🎙️", description: "Голосовое сообщение" },
    { type: "music", name: "Музыка", icon: "🎵", description: "Музыкальный трек" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Метаданные контента */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ⚙️ Настройки контента
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
              Имя отправителя
            </label>
            <input
              type="text"
              id="senderName"
              value={localContent.metadata?.senderName || ""}
              onChange={(e) => handleMetadataChange("senderName", e.target.value)}
              placeholder="Например: От Димы"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Отображается в базовом блоке поздравления
            </p>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Базовое сообщение
            </label>
            <input
              type="text"
              id="description"
              value={localContent.metadata?.description || ""}
              onChange={(e) => handleMetadataChange("description", e.target.value)}
              placeholder="С днем рождения!"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Основной текст поздравления
            </p>
          </div>
        </div>
      </div>

      {/* Добавление блоков */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ➕ Добавить блок контента
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.type}
              onClick={() => handleAddBlock(blockType.type)}
              className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
            >
              <span className="text-2xl mr-3 mt-1">{blockType.icon}</span>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {blockType.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {blockType.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Список блоков */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            📋 Блоки контента ({localContent.blocks.length})
          </h3>
          {localContent.blocks.length > 0 && (
            <p className="text-sm text-gray-500">
              Перетащите блоки для изменения порядка
            </p>
          )}
        </div>

        {localContent.blocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет блоков контента</h3>
            <p className="mt-1 text-sm text-gray-500">
              Добавьте первый блок, выбрав тип выше
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {localContent.blocks.map((block, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white border rounded-lg ${
                  draggedIndex === index ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                } transition-all duration-200`}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Блок #{index + 1}: {blockTypes.find(t => t.type === block.type)?.name || "Неизвестный тип"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlock(index)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Удалить блок"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <BlockEditor
                    block={block}
                    onChange={(updatedBlock: GiftBlock) => handleBlockChange(index, updatedBlock)}
                    giftId={giftId}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 