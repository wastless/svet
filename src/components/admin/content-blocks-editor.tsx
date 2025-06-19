"use client";

import React, { useState, useEffect } from "react";
import type { GiftContent, GiftBlock } from "@/utils/types/gift";
import { BlockEditor } from "./block-editor";
import * as Label from "~/components/ui/label";
import * as Textarea from "~/components/ui/textarea";
import { RiText, RiImageLine, RiGalleryLine, RiMultiImageLine, RiCircleLine, RiVideoLine, RiMusic2Line, RiMicLine, RiQuillPenLine, RiSeparator, RiPieChart2Line } from "@remixicon/react";
import { BlockIcon, EmptyBlocksIcon, RemoveBlockIcon } from "~/components/ui/icons";
import { RiArrowDownSLine, RiArrowUpSLine, RiEyeOffLine, RiEyeLine } from "@remixicon/react";
import * as Input from "~/components/ui/input";
import * as Select from "~/components/ui/select";

interface ContentBlocksEditorProps {
  content: GiftContent;
  onChange: (content: GiftContent) => void;
  giftId?: string;
}

export function ContentBlocksEditor({
  content,
  onChange,
  giftId,
}: ContentBlocksEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [collapsedBlocks, setCollapsedBlocks] = useState<number[]>([]);
  const [allCollapsed, setAllCollapsed] = useState(false);

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
        newBlock = {
          type: "image",
          url: "",
          layout: "image-center",
          size: "medium",
          orientation: "horizontal",
        };
        break;
      case "two-images":
        newBlock = {
          type: "two-images",
          images: [{ url: "" }, { url: "" }],
          size: "medium",
          orientation: "horizontal",
        };
        break;
      case "gallery":
        newBlock = { type: "gallery", images: [{ url: "" }], columns: 2 };
        break;
      case "video-circle":
        newBlock = {
          type: "video-circle",
          url: "",
          size: "medium",
          autoplay: false,
          muted: true,
          loop: false,
        };
        break;
      case "video":
        newBlock = {
          type: "video",
          url: "",
          size: "medium",
          autoplay: false,
          muted: true,
          loop: false,
        };
        break;
      case "audio-message":
        newBlock = { type: "audio-message", url: "" };
        break;
      case "music":
        newBlock = {
          type: "music",
          url: "",
          coverUrl: "",
          artist: "",
          trackName: "",
        };
        break;
      case "divider":
        newBlock = { type: "divider" };
        break;
      case "infographic":
        newBlock = { 
          type: "infographic", 
          count: 1,
          items: [{ number: "0", text: "Текст под цифрой" }],
          alignment: "center"
        };
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
    // Remove the index from collapsedBlocks if it exists
    setCollapsedBlocks(prev => prev.filter(i => i !== index));
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
    
    // Update collapsed blocks indexes when moving blocks
    setCollapsedBlocks(prev => {
      const newCollapsed = [...prev];
      if (newCollapsed.includes(fromIndex)) {
        newCollapsed.splice(newCollapsed.indexOf(fromIndex), 1);
        newCollapsed.push(toIndex);
      }
      return newCollapsed;
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

  const toggleCollapseBlock = (index: number) => {
    setCollapsedBlocks(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      // Expand all blocks
      setCollapsedBlocks([]);
      setAllCollapsed(false);
    } else {
      // Collapse all blocks
      const allIndexes = localContent.blocks.map((_, index) => index);
      setCollapsedBlocks(allIndexes);
      setAllCollapsed(true);
    }
  };

  const blockTypes = [
    {
      type: "text",
      name: "Текст",
      icon: <RiText />,
    },
    {
      type: "quote",
      name: "Цитата",
      icon: <RiQuillPenLine />,
    },
    {
      type: "image",
      name: "Фото",
      icon: <RiImageLine />,
    },
    {
      type: "two-images",
      name: "Два фото",
      icon: <RiMultiImageLine />,
    },
    {
      type: "gallery",
      name: "Галерея",
      icon: <RiGalleryLine />,
    },
    {
      type: "video-circle",
      name: "Видеокружок",
      icon: <RiCircleLine />,
    },
    { type: "video", name: "Видео", icon: <RiVideoLine /> },
    {
      type: "audio-message",
      name: "Голосовое",
      icon: <RiMicLine />,
    },
    {
      type: "music",
      name: "Музыка",
      icon: <RiMusic2Line />,
    },
    {
      type: "divider",
      name: "Разделитель",
      icon: <RiSeparator />,
    },
    {
      type: "infographic",
      name: "Инфографика",
      icon: <RiPieChart2Line />,
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Метаданные контента */}

      <div className="flex flex-col gap-3">
        <Label.Root htmlFor="description">Базовое сообщение</Label.Root>
        <Textarea.Root
          placeholder="Основной текст поздравления"
          value={localContent.metadata?.description || ""}
          onChange={(e) => handleMetadataChange("description", e.target.value)}
        >
          <Textarea.CharCounter
            current={localContent.metadata?.description?.length || 0}
            max={200}
          />
        </Textarea.Root>
      </div>

      {/* Добавление блоков */}
      <div className="flex flex-col gap-3">
        <Label.Root htmlFor="description">Добавить блок контента</Label.Root>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.type}
              onClick={() => handleAddBlock(blockType.type)}
              className="flex items-center rounded-lg border border-gray-200 p-2 text-left transition-colors"
            >
              <span className="mr-3 mt-1">{blockType.icon}</span>
              <h4 className="font-styrene text-paragraph-sm font-medium uppercase text-adaptive">
                {blockType.name}
              </h4>
            </button>
          ))}
        </div>
      </div>

      {/* Список блоков */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label.Root htmlFor="description">
            Блоки контента ({localContent.blocks.length})
          </Label.Root>
          {localContent.blocks.length > 0 && (
            <button
              onClick={toggleCollapseAll}
              className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1 text-sm text-neutral-600 hover:bg-gray-50 transition-colors"
              title={allCollapsed ? "Показать все блоки" : "Скрыть все блоки"}
            >
              {allCollapsed ? (
                <>
                  <RiEyeLine className="text-neutral-500" />
                  <span>Показать все</span>
                </>
              ) : (
                <>
                  <RiEyeOffLine className="text-neutral-500" />
                  <span>Скрыть все</span>
                </>
              )}
            </button>
          )}
        </div>

        {localContent.blocks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
            <EmptyBlocksIcon className="mx-auto text-neutral-300" />
            <h3 className="mt-2 text-paragraph-md font-styrene uppercase text-adaptive font-medium">
              Нет блоков контента
            </h3>
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
                className={`rounded-lg border bg-white ${
                  draggedIndex === index
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200"
                } transition-all duration-200`}
              >
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="cursor-move">
                      <BlockIcon size={20} className="text-neutral-300 hover:text-neutral-600 transition-colors" />
                    </div>
                    <span className="text-paragraph-sm uppercase font-styrene font-medium text-text-strong-950">
                      Блок #{index + 1}:{" "}
                      {blockTypes.find((t) => t.type === block.type)?.name ||
                        "Неизвестный тип"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCollapseBlock(index)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      title={collapsedBlocks.includes(index) ? "Развернуть блок" : "Свернуть блок"}
                    >
                      {collapsedBlocks.includes(index) ? (
                        <RiArrowDownSLine size={24} />
                      ) : (
                        <RiArrowUpSLine size={24} />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveBlock(index)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      title="Удалить блок"
                    >
                      <RemoveBlockIcon size={20} />
                    </button>
                  </div>
                </div>
                {!collapsedBlocks.includes(index) && (
                  <div className="p-4">
                    <BlockEditor
                      block={block}
                      onChange={(updatedBlock: GiftBlock) =>
                        handleBlockChange(index, updatedBlock)
                      }
                      giftId={giftId}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
