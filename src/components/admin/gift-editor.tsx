"use client";

import React, { useState, useEffect } from "react";
import type { Gift, GiftContent, GiftBlock } from "@/utils/types/gift";
import { GiftBasicInfo } from "./gift-basic-info";
import { ContentBlocksEditor } from "./content-blocks-editor";
import { GiftPhotosEditor } from "./gift-photos-editor";
import * as IconButton from "~/components/ui/icon-button";
import { useGiftContent, useUpdateGift } from "@/utils/hooks/useGiftQueries";

// Импортируем интерфейс GiftPhotos из компонента GiftPhotosEditor
import type { GiftPhotos } from "./gift-photos-editor";

interface GiftEditorProps {
  gift: Gift | null;
  onSave: (giftData: any) => void;
  onCancel: () => void;
}

export function GiftEditor({ gift, onSave, onCancel }: GiftEditorProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "memory">("basic");
  const [isSaving, setIsSaving] = useState(false);
  
  // Получаем контент подарка с использованием React Query
  const { data: giftContent, isLoading } = useGiftContent(gift?.id || "");
  
  // Основные данные подарка
  const [basicData, setBasicData] = useState({
    title: gift?.title || "",
    author: gift?.author || "",
    nickname: gift?.nickname || "",
    number: gift?.number || 0,
    openDate: gift?.openDate ? formatDateForDateTimeLocal(new Date(gift.openDate)) : "",
    englishDescription: gift?.englishDescription || "",
    hintText: gift?.hintText || "look for a gift with this sticker",
    codeText: gift?.codeText || "This is the part of your cipher. Collect them all to reveal the last secret",
    code: gift?.code || "",
    isSecret: gift?.isSecret || false,
  });

  // Локальная копия контента подарка
  const [localGiftContent, setLocalGiftContent] = useState<GiftContent>({
    blocks: [],
    metadata: {
      description: "",
    }
  });

  // Данные фотографий
  const [giftPhotos, setGiftPhotos] = useState<GiftPhotos>({
    hintImageUrl: gift?.hintImageUrl || "",
    hintText: gift?.hintText || "look for a gift with this sticker",
    imageCover: gift?.imageCover || "",
    memoryPhoto: {
      photoUrl: gift?.memoryPhoto?.photoUrl || "",
      photoDate: (gift?.memoryPhoto?.photoDate ? new Date(gift.memoryPhoto.photoDate).toISOString().split('T')[0] : null) as string | null
    }
  });

  // Обновляем локальный контент когда данные загрузятся
  useEffect(() => {
    if (giftContent) {
      setLocalGiftContent(giftContent);
    }
  }, [giftContent]);

  // Функция для преобразования даты в формат для поля datetime-local с учетом локального часового пояса
  function formatDateForDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Используем время, которое выбрал пользователь
      const openDate = new Date(basicData.openDate);
      
      // Подготавливаем данные для сохранения
      const giftData = {
        ...basicData,
        openDate: openDate.toISOString(),
        number: Number(basicData.number),
        content: localGiftContent,
        hintImageUrl: giftPhotos.hintImageUrl,
        hintText: giftPhotos.hintText || "look for a gift with this sticker",
        imageCover: giftPhotos.imageCover || "",
        memoryPhoto: giftPhotos.memoryPhoto.photoUrl ? {
          photoUrl: giftPhotos.memoryPhoto.photoUrl,
          photoDate: giftPhotos.memoryPhoto.photoDate ? new Date(giftPhotos.memoryPhoto.photoDate).toISOString() : null
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
        <IconButton.Root onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить"}
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
                content={localGiftContent}
                onChange={setLocalGiftContent}
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