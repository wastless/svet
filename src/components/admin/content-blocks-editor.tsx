"use client";

import React, { useState, useEffect, useRef } from "react";
import type { GiftContent, GiftBlock } from "@/utils/types/gift";
import { BlockEditor } from "./block-editor";
import * as Label from "~/components/ui/label";
import * as Textarea from "~/components/ui/textarea";
import { RiText, RiImageLine, RiGalleryLine, RiMultiImageLine, RiCircleLine, RiVideoLine, RiMusic2Line, RiMicLine, RiQuillPenLine, RiSeparator, RiPieChart2Line, RiLayoutColumnLine } from "@remixicon/react";
import { BlockIcon, EmptyBlocksIcon, RemoveBlockIcon } from "~/components/ui/icons";
import { RiArrowDownSLine, RiArrowUpSLine, RiEyeOffLine, RiEyeLine, RiSaveLine, RiArrowUpLine, RiArrowDownLine, RiArrowUpDoubleLine, RiArrowDownDoubleLine, RiListUnordered, RiCloseCircleLine } from "@remixicon/react";
import * as Input from "~/components/ui/input";
import * as Select from "~/components/ui/select";
import * as Button from "~/components/ui/button";

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
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<GiftContent>(content);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setLocalContent(content);
    contentRef.current = content;
    // Обновляем массив ссылок на блоки при изменении количества блоков
    blockRefs.current = blockRefs.current.slice(0, content.blocks.length);
  }, [content]);

  const autoSaveContent = async () => {
    if (!giftId) return;
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentRef.current,
        }),
      });
      
      if (response.ok) {
        setLastSaved(new Date());
        console.log("Контент автоматически сохранен:", new Date().toLocaleTimeString());
      } else {
        console.error("Ошибка автосохранения:", await response.text());
      }
    } catch (error) {
      console.error("Ошибка автосохранения:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    contentRef.current = localContent;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    if (giftId) {
      autoSaveTimerRef.current = setTimeout(autoSaveContent, 5000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [localContent, giftId]);

  const handleManualSave = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    await autoSaveContent();
  };

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
          orientation: "horizontal"
        };
        break;
      case "two-images":
        newBlock = {
          type: "two-images",
          images: [{ url: "" }, { url: "" }],
          size: "medium",
          orientation: "horizontal"
        };
        break;
      case "gallery":
        newBlock = { 
          type: "gallery", 
          images: [{ url: "" }], 
          columns: 2
        };
        break;
      case "video-circle":
        newBlock = {
          type: "video-circle",
          url: "",
          size: "medium",
          autoplay: false,
          muted: true,
          loop: false
        };
        break;
      case "video":
        newBlock = {
          type: "video",
          url: "",
          size: "medium",
          autoplay: false,
          muted: true,
          loop: false
        };
        break;
      case "audio-message":
        newBlock = { 
          type: "audio-message", 
          url: ""
        };
        break;
      case "music":
        newBlock = {
          type: "music",
          id: `music_${Date.now()}`,
          url: "",
          coverUrl: "",
          artist: "",
          trackName: ""
        };
        break;
      case "musicGallery":
        newBlock = {
          type: "musicGallery",
          id: `musicGallery_${Date.now()}`,
          title: "",
          text: "",
          tracks: [{
            id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url: "",
            artist: "",
            trackName: "",
            coverUrl: "",
            duration: undefined,
          }],
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
      case "text-columns":
        newBlock = { 
          type: "text-columns", 
          count: 2,
          items: [
            { title: "Заголовок 1", text: "Текст первой колонки" },
            { title: "Заголовок 2", text: "Текст второй колонки" }
          ],
          alignment: "left"
        };
        break;
      default:
        return;
    }

    const newBlocks = [...localContent.blocks, newBlock];
    handleContentChange({
      ...localContent,
      blocks: newBlocks,
    });
    
    // Прокручиваем к новому блоку после его создания
    setTimeout(() => {
      const newIndex = newBlocks.length - 1;
      blockRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleRemoveBlock = (index: number) => {
    const newBlocks = localContent.blocks.filter((_, i) => i !== index);
    handleContentChange({
      ...localContent,
      blocks: newBlocks,
    });
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
    
    setCollapsedBlocks(prev => {
      const newCollapsed = [...prev];
      if (newCollapsed.includes(fromIndex)) {
        newCollapsed.splice(newCollapsed.indexOf(fromIndex), 1);
        newCollapsed.push(toIndex);
      }
      return newCollapsed;
    });
    
    // Прокручиваем к перемещенному блоку
    setTimeout(() => {
      blockRefs.current[toIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return; // Уже в начале списка
    handleMoveBlock(index, index - 1);
  };

  const handleMoveBlockDown = (index: number) => {
    if (index === localContent.blocks.length - 1) return; // Уже в конце списка
    handleMoveBlock(index, index + 1);
  };

  const handleMoveBlockToTop = (index: number) => {
    if (index === 0) return; // Уже в начале списка
    handleMoveBlock(index, 0);
  };

  const handleMoveBlockToBottom = (index: number) => {
    if (index === localContent.blocks.length - 1) return; // Уже в конце списка
    handleMoveBlock(index, localContent.blocks.length - 1);
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
      setCollapsedBlocks([]);
      setAllCollapsed(false);
    } else {
      const allIndexes = localContent.blocks.map((_, index) => index);
      setCollapsedBlocks(allIndexes);
      setAllCollapsed(true);
    }
  };
  
  const scrollToBlock = (index: number) => {
    blockRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      type: "musicGallery",
      name: "Муз. Галерея",
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
    {
      type: "text-columns",
      name: "Колонки",
      icon: <RiLayoutColumnLine />,
    },
  ] as const;

  return (
    <div className="flex">
      {/* Боковая навигация по блокам */}
      {showNavigation && localContent.blocks.length > 0 && (
        <div className="fixed right-6 top-1/4 z-10 w-48 rounded-lg border border-gray-200 bg-white p-3 shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase">Навигация</h3>
            <button
              onClick={() => setShowNavigation(false)}
              className="text-gray-400 hover:text-gray-600"
              title="Закрыть навигацию"
            >
              <RiCloseCircleLine size={18} />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {localContent.blocks.map((block, index) => {
              const blockType = blockTypes.find((t) => t.type === block.type);
              return (
                <button
                  key={index}
                  onClick={() => scrollToBlock(index)}
                  className="mb-1 flex w-full items-center rounded-md p-2 text-left text-xs hover:bg-gray-100"
                  title={`Перейти к блоку #${index + 1}: ${blockType?.name || "Неизвестный тип"}`}
                >
                  <span className="mr-1 font-bold">{index + 1}:</span>
                  <span className="mr-1">{blockType?.icon}</span>
                  <span className="truncate">{blockType?.name || "???"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Контент подарка</h2>
          <div className="flex items-center gap-4">
            {giftId && (
              <div className="flex items-center gap-2">
                <Button.Root 
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="flex items-center gap-1"
                >
                  <RiSaveLine className="w-4 h-4" />
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </Button.Root>
                {lastSaved && (
                  <span className="text-xs text-gray-500">
                    Сохранено: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => setShowNavigation(!showNavigation)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              title={showNavigation ? "Скрыть навигацию" : "Показать навигацию"}
            >
              <RiListUnordered className="mr-1" /> {showNavigation ? "Скрыть навигацию" : "Навигация"}
            </button>
            <button
              onClick={toggleCollapseAll}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              {allCollapsed ? (
                <>
                  <RiEyeLine className="mr-1" /> Развернуть все
                </>
              ) : (
                <>
                  <RiEyeOffLine className="mr-1" /> Свернуть все
                </>
              )}
            </button>
          </div>
        </div>

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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label.Root htmlFor="description">
              Блоки контента ({localContent.blocks.length})
            </Label.Root>
          </div>

          {localContent.blocks.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
              <EmptyBlocksIcon className="mx-auto text-neutral-300" />
              <h3 className="mt-2 text-paragraph-md font-styrene uppercase text-adaptive font-medium">
                Нет блоков контента
              </h3>
              <div className="mt-8 p-4 border rounded-lg bg-white max-w-3xl mx-auto">
                <h3 className="font-styrene text-paragraph-sm font-medium uppercase mb-3">
                  Добавить первый блок
                </h3>
                <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("text")}
                  >
                    <RiText className="mb-2 h-6 w-6" />
                    <span className="text-xs">Текст</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("quote")}
                  >
                    <RiQuillPenLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Цитата</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("image")}
                  >
                    <RiImageLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Картинка</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("two-images")}
                  >
                    <RiMultiImageLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Две картинки</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("gallery")}
                  >
                    <RiGalleryLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Галерея</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("video-circle")}
                  >
                    <RiCircleLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Видеокруг</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("video")}
                  >
                    <RiVideoLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Видео</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("audio-message")}
                  >
                    <RiMicLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Аудио</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("music")}
                  >
                    <RiMusic2Line className="mb-2 h-6 w-6" />
                    <span className="text-xs">Музыка</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("musicGallery")}
                  >
                    <RiMusic2Line className="mb-2 h-6 w-6" />
                    <span className="text-xs">Плейлист</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("divider")}
                  >
                    <RiSeparator className="mb-2 h-6 w-6" />
                    <span className="text-xs">Разделитель</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("infographic")}
                  >
                    <RiPieChart2Line className="mb-2 h-6 w-6" />
                    <span className="text-xs">Инфографика</span>
                  </Button.Root>
                  
                  <Button.Root
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    onClick={() => handleAddBlock("text-columns")}
                  >
                    <RiLayoutColumnLine className="mb-2 h-6 w-6" />
                    <span className="text-xs">Колонки</span>
                  </Button.Root>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {localContent.blocks.map((block, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    blockRefs.current[index] = el;
                    return undefined;
                  }}
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
                      <div className="flex items-center mr-2 border-r pr-2 border-gray-200">
                        <button
                          onClick={() => handleMoveBlockToTop(index)}
                          disabled={index === 0}
                          className={`p-1 transition-colors ${index === 0 ? 'text-neutral-200' : 'text-neutral-400 hover:text-neutral-600'}`}
                          title="В начало списка"
                        >
                          <RiArrowUpDoubleLine size={18} />
                        </button>
                        <button
                          onClick={() => handleMoveBlockUp(index)}
                          disabled={index === 0}
                          className={`p-1 transition-colors ${index === 0 ? 'text-neutral-200' : 'text-neutral-400 hover:text-neutral-600'}`}
                          title="Переместить вверх"
                        >
                          <RiArrowUpLine size={18} />
                        </button>
                        <button
                          onClick={() => handleMoveBlockDown(index)}
                          disabled={index === localContent.blocks.length - 1}
                          className={`p-1 transition-colors ${index === localContent.blocks.length - 1 ? 'text-neutral-200' : 'text-neutral-400 hover:text-neutral-600'}`}
                          title="Переместить вниз"
                        >
                          <RiArrowDownLine size={18} />
                        </button>
                        <button
                          onClick={() => handleMoveBlockToBottom(index)}
                          disabled={index === localContent.blocks.length - 1}
                          className={`p-1 transition-colors ${index === localContent.blocks.length - 1 ? 'text-neutral-200' : 'text-neutral-400 hover:text-neutral-600'}`}
                          title="В конец списка"
                        >
                          <RiArrowDownDoubleLine size={18} />
                        </button>
                      </div>
                      
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
              
              {/* Кнопки добавления блоков перемещены в конец всех блоков */}
              <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-styrene text-paragraph-sm font-medium uppercase mb-3">
                  Добавить новый блок
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {blockTypes.map((blockType) => (
                    <button
                      key={blockType.type}
                      onClick={() => handleAddBlock(blockType.type)}
                      className="flex items-center rounded-lg border border-gray-200 bg-white p-2 text-left transition-colors hover:bg-gray-100"
                    >
                      <span className="mr-3 mt-1">{blockType.icon}</span>
                      <h4 className="font-styrene text-paragraph-sm font-medium uppercase text-adaptive">
                        {blockType.name}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
