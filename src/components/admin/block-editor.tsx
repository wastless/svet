"use client";

import React, { useState, useEffect } from "react";
import * as Button from "~/components/ui/button";
import type { GiftBlock } from "@/utils/types/gift";

interface BlockEditorProps {
  block: GiftBlock;
  onChange: (block: GiftBlock) => void;
  giftId?: string;
}

export function BlockEditor({ block, onChange, giftId }: BlockEditorProps) {
  const [localBlock, setLocalBlock] = useState(block);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  const handleChange = (updates: Partial<any>) => {
    const updatedBlock = { ...localBlock, ...updates };
    setLocalBlock(updatedBlock);
    onChange(updatedBlock as GiftBlock);
  };

  const handleFileUpload = async (file: File, field: string) => {
    if (!giftId) {
      alert("Сначала сохраните подарок с основными данными, затем вы сможете загружать файлы");
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("giftId", giftId);
      formData.append("fileType", "block");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        handleChange({ [field]: url } as Partial<GiftBlock>);
      } else {
        alert("Ошибка загрузки файла");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert("Ошибка загрузки файла");
    } finally {
      setUploadingFile(false);
    }
  };

  const renderTextEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Текст
        </label>
        <textarea
          value={(localBlock as any).content || ""}
          onChange={(e) => handleChange({ content: e.target.value })}
          rows={4}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Введите текст..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Стиль
        </label>
        <select
          value={(localBlock as any).style || "normal"}
          onChange={(e) => handleChange({ style: e.target.value as any })}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="normal">Обычный текст</option>
          <option value="title">Заголовок</option>
          <option value="subtitle">Подзаголовок</option>
        </select>
      </div>
    </div>
  );

  const renderQuoteEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Текст цитаты
        </label>
        <textarea
          value={(localBlock as any).content || ""}
          onChange={(e) => handleChange({ content: e.target.value })}
          rows={3}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Введите цитату..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Стиль цитаты
        </label>
        <select
          value={(localBlock as any).style || "small"}
          onChange={(e) => handleChange({ style: e.target.value as any })}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="small">Малый (styrene)</option>
          <option value="big">Большой (nyghtserif)</option>
        </select>
      </div>
    </div>
  );

  const renderImageEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Заголовок (опционально)
        </label>
        <input
          type="text"
          value={(localBlock as any).title || ""}
          onChange={(e) => handleChange({ title: e.target.value })}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Заголовок блока"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Текст (опционально)
        </label>
        <textarea
          value={(localBlock as any).text || ""}
          onChange={(e) => handleChange({ text: e.target.value })}
          rows={3}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Описание к изображению"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Изображение
        </label>
        {(localBlock as any).url && (
          <div className="mb-4">
            <img
              src={(localBlock as any).url}
              alt="Превью"
              className="h-32 w-auto rounded-lg border border-gray-300"
            />
          </div>
        )}
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "url");
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700"
            disabled={uploadingFile}
          />
          <input
            type="url"
            value={(localBlock as any).url || ""}
            onChange={(e) => handleChange({ url: e.target.value })}
            placeholder="Или введите URL изображения"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Подпись под фото
        </label>
        <input
          type="text"
          value={(localBlock as any).caption || ""}
          onChange={(e) => handleChange({ caption: e.target.value })}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Подпись под изображением"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Расположение
          </label>
          <select
            value={(localBlock as any).layout || "image-center"}
            onChange={(e) => handleChange({ layout: e.target.value as any })}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="image-center">По центру</option>
            <option value="image-left">Слева</option>
            <option value="image-right">Справа</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Размер
          </label>
          <select
            value={(localBlock as any).size || "medium"}
            onChange={(e) => handleChange({ size: e.target.value as any })}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="small">Маленький</option>
            <option value="medium">Средний</option>
            <option value="large">Большой</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ориентация
          </label>
          <select
            value={(localBlock as any).orientation || "horizontal"}
            onChange={(e) => handleChange({ orientation: e.target.value as any })}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="horizontal">Горизонтальная</option>
            <option value="vertical">Вертикальная</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMusicEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Заголовок (опционально)
        </label>
        <input
          type="text"
          value={(localBlock as any).title || ""}
          onChange={(e) => handleChange({ title: e.target.value })}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Заголовок блока"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Аудио файл
        </label>
        <div className="space-y-2">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "url");
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700"
            disabled={uploadingFile}
          />
          <input
            type="url"
            value={(localBlock as any).url || ""}
            onChange={(e) => handleChange({ url: e.target.value })}
            placeholder="Или введите URL аудио файла"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Обложка
        </label>
        {(localBlock as any).coverUrl && (
          <div className="mb-4">
            <img
              src={(localBlock as any).coverUrl}
              alt="Обложка"
              className="h-20 w-20 rounded-lg border border-gray-300 object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "coverUrl");
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700"
            disabled={uploadingFile}
          />
          <input
            type="url"
            value={(localBlock as any).coverUrl || ""}
            onChange={(e) => handleChange({ coverUrl: e.target.value })}
            placeholder="URL обложки"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Исполнитель
          </label>
          <input
            type="text"
            value={(localBlock as any).artist || ""}
            onChange={(e) => handleChange({ artist: e.target.value })}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Имя исполнителя"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название трека
          </label>
          <input
            type="text"
            value={(localBlock as any).trackName || ""}
            onChange={(e) => handleChange({ trackName: e.target.value })}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Название песни"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ссылка на Яндекс.Музыку (опционально)
        </label>
        <input
          type="url"
          value={(localBlock as any).yandexMusicUrl || ""}
          onChange={(e) => handleChange({ yandexMusicUrl: e.target.value })}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="https://music.yandex.ru/..."
        />
      </div>
    </div>
  );

  // Упрощенный рендер для других типов блоков
  const renderGenericEditor = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">
          🚧 Редактор для блока типа "{block.type}" в разработке.
          Пока что можно редактировать только базовые поля.
        </p>
      </div>
      
      {/* URL поле для медиа блоков */}
      {"url" in block && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL файла
          </label>
          <input
            type="url"
            value={(localBlock as any).url || ""}
            onChange={(e) => handleChange({ url: e.target.value })}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="URL медиа файла"
          />
        </div>
      )}

      {/* Заголовок для блоков, которые его поддерживают */}
      {"title" in block && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заголовок
          </label>
          <input
            type="text"
            value={(localBlock as any).title || ""}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Заголовок блока"
          />
        </div>
      )}
    </div>
  );

  // Основной рендер в зависимости от типа блока
  switch (block.type) {
    case "text":
      return renderTextEditor();
    case "quote":
      return renderQuoteEditor();
    case "image":
      return renderImageEditor();
    case "music":
      return renderMusicEditor();
    default:
      return renderGenericEditor();
  }
} 