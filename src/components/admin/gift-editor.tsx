"use client";

import React, { useState, useEffect } from "react";
import type { Gift, GiftContent, GiftBlock } from "@/utils/types/gift";
import { GiftBasicInfo } from "./gift-basic-info";
import { ContentBlocksEditor } from "./content-blocks-editor";
import { MemoryPhotoEditor } from "./memory-photo-editor";

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
    number: gift?.number || 0,
    openDate: gift?.openDate ? new Date(gift.openDate).toISOString().slice(0, 16) : "",
    englishDescription: gift?.englishDescription || "",
    hintImageUrl: gift?.hintImageUrl || "",
    hintText: gift?.hintText || "look for a gift with this sticker",
    codeText: gift?.codeText || "This is the part of your cipher. Collect them all to reveal the last secret",
    code: gift?.code || "",
    isSecret: gift?.isSecret || false,
  });

  // Контент подарка
  const [giftContent, setGiftContent] = useState<GiftContent>({
    blocks: [],
    metadata: {
      senderName: "",
      description: "",
    }
  });

  // Данные полароида
  const [memoryPhoto, setMemoryPhoto] = useState({
    text: gift?.memoryPhoto?.text || "",
    photoUrl: gift?.memoryPhoto?.photoUrl || "",
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
        memoryPhoto: memoryPhoto.text || memoryPhoto.photoUrl ? memoryPhoto : null,
      };

      await onSave(giftData);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "basic", name: "Основные данные", icon: "📝" },
    { id: "content", name: "Контент", icon: "🎨" },
    { id: "memory", name: "Полароид", icon: "📸" },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Заголовок */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {gift ? `Редактирование подарка #${gift.number}` : "Создание нового подарка"}
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !basicData.openDate || !basicData.englishDescription || !basicData.number}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
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
                onChange={setBasicData}
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
              <MemoryPhotoEditor
                data={memoryPhoto}
                onChange={setMemoryPhoto}
                giftId={gift?.id}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 