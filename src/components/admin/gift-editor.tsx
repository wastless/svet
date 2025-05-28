"use client";

import React, { useState, useEffect } from "react";
import type { Gift, GiftContent, GiftBlock } from "@/utils/types/gift";
import { GiftBasicInfo } from "./gift-basic-info";
import { ContentBlocksEditor } from "./content-blocks-editor";
import { GiftPhotosEditor } from "./gift-photos-editor";
import * as IconButton from "~/components/ui/icon-button";


interface GiftEditorProps {
  gift: Gift | null;
  onSave: (giftData: any) => void;
  onCancel: () => void;
}

export function GiftEditor({ gift, onSave, onCancel }: GiftEditorProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "memory">("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Основные данные подарка
  const [basicData, setBasicData] = useState({
    title: gift?.title || "",
    author: gift?.author || "",
    nickname: gift?.nickname || "",
    number: gift?.number || 0,
    openDate: gift?.openDate ? new Date(gift.openDate).toISOString().slice(0, 16) : "",
    englishDescription: gift?.englishDescription || "",
    hintText: gift?.hintText || "look for a gift with this sticker",
    codeText: gift?.codeText || "This is the part of your cipher. Collect them all to reveal the last secret",
    code: gift?.code || "",
    isSecret: gift?.isSecret || false,
  });

  // Контент подарка
  const [giftContent, setGiftContent] = useState<GiftContent>({
    blocks: [],
    metadata: {
      description: "",
    }
  });

  // Данные фотографий
  const [giftPhotos, setGiftPhotos] = useState({
    hintImageUrl: gift?.hintImageUrl || "",
    memoryPhoto: {
      photoUrl: gift?.memoryPhoto?.photoUrl || "",
    }
  });

  // Загрузка контента подарка при редактировании
  useEffect(() => {
    if (gift?.contentPath) {
      loadGiftContent(gift.contentPath);
    }
  }, [gift]);

  const loadGiftContent = async (contentPath: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/gift-content/${contentPath}`);
      if (response.ok) {
        const content = await response.json();
        setGiftContent(content);
      }
    } catch (error) {
      console.error("Ошибка загрузки контента:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Подготавливаем данные для сохранения
      const giftData = {
        ...basicData,
        openDate: new Date(basicData.openDate).toISOString(),
        number: Number(basicData.number),
        content: giftContent,
        hintImageUrl: giftPhotos.hintImageUrl,
        memoryPhoto: giftPhotos.memoryPhoto.photoUrl ? {
          photoUrl: giftPhotos.memoryPhoto.photoUrl
        } : null,
      };

      await onSave(giftData);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "basic", name: "Основные данные" },
    { id: "content", name: "Контент" },
    { id: "memory", name: "Полароид" },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Заголовок */}
      <div className="py-0 border-b border-gray-200">

        <div className="flex justify-between items-center">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-paragraph-md font-styrene uppercase ${
                activeTab === tab.id
                  ? "border-bg-strong-950"
                  : "border-transparent border-b-0 text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        <div className="flex space-x-6">
        <IconButton.Root onClick={onCancel}>
          Назад
        </IconButton.Root>
        <IconButton.Root onClick={handleSave}>
          Сохранить
        </IconButton.Root>
        </div>
        </div>
      </div>

      {/* Контент табов */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-500">Загрузка...</div>
          </div>
        ) : (
          <>
            {activeTab === "basic" && (
              <GiftBasicInfo
                data={basicData}
                onChange={(data) => setBasicData(data)}
                giftId={gift?.id}
              />
            )}
            
            {activeTab === "content" && (
              <ContentBlocksEditor
                content={giftContent}
                onChange={setGiftContent}
                giftId={gift?.id}
              />
            )}
            
            {activeTab === "memory" && (
              <GiftPhotosEditor
                photos={giftPhotos}
                onPhotosChange={setGiftPhotos}
                nickname={basicData.nickname}
                giftId={gift?.id}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 