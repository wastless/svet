"use client";

import { useState, useEffect } from "react";

interface GiftBasicInfoData {
  title: string;
  number: number;
  openDate: string;
  englishDescription: string;
  hintImageUrl: string;
  hintText: string;
  codeText: string;
  code: string;
  isSecret: boolean;
}

interface GiftBasicInfoProps {
  data: GiftBasicInfoData;
  onChange: (data: GiftBasicInfoData) => void;
  giftId?: string;
}

export function GiftBasicInfo({ data, onChange, giftId }: GiftBasicInfoProps) {
  const [localData, setLocalData] = useState(data);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (field: keyof GiftBasicInfoData, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange(newData);
  };

  const handleImageUpload = async (file: File) => {
    if (!giftId) {
      alert("Сначала сохраните подарок с базовыми данными, затем вы сможете загружать изображения");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("giftId", giftId);
      formData.append("fileType", "hint");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        handleChange("hintImageUrl", url);
      } else {
        alert("Ошибка загрузки изображения");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert("Ошибка загрузки изображения");
    } finally {
      setUploadingImage(false);
    }
  };

  const generateNumber = () => {
    // Генерируем номер на основе текущей даты
    const startDate = new Date("2024-01-01"); // START_DATE
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    handleChange("number", diffDays);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Название подарка */}
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Название подарка
          </label>
          <input
            type="text"
            id="title"
            value={localData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Например: День рождения Леси"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Номер подарка */}
        <div>
          <label htmlFor="number" className="block text-sm font-medium text-gray-700">
            Номер подарка <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="number"
              id="number"
              value={localData.number}
              onChange={(e) => handleChange("number", parseInt(e.target.value) || 0)}
              className="flex-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={generateNumber}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
              title="Генерировать номер по дате"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Автоматическая генерация от START_DATE
          </p>
        </div>

        {/* Дата открытия */}
        <div>
          <label htmlFor="openDate" className="block text-sm font-medium text-gray-700">
            Дата открытия <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="openDate"
            value={localData.openDate}
            onChange={(e) => handleChange("openDate", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Английское описание */}
      <div>
        <label htmlFor="englishDescription" className="block text-sm font-medium text-gray-700">
          Английское описание <span className="text-red-500">*</span>
        </label>
        <textarea
          id="englishDescription"
          rows={3}
          value={localData.englishDescription}
          onChange={(e) => handleChange("englishDescription", e.target.value)}
          placeholder="Описание подарка на английском языке..."
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Изображение подсказки */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Изображение подсказки
        </label>
        
        {/* Информация для новых подарков */}
        {!giftId && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Сначала сохраните подарок с основными данными, затем вы сможете загружать изображения.
                  Пока можно указать URL изображения или оставить поле пустым.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Превью изображения */}
        {localData.hintImageUrl && (
          <div className="mb-4">
            <img
              src={localData.hintImageUrl}
              alt="Подсказка"
              className="h-32 w-auto rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* Загрузка файла - только для существующих подарков */}
        {giftId && (
          <div className="flex items-center space-x-4 mb-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              disabled={uploadingImage}
            />
            {uploadingImage && (
              <span className="text-sm text-gray-500">Загрузка...</span>
            )}
          </div>
        )}

        {/* Ручной ввод URL */}
        <div>
          <input
            type="url"
            value={localData.hintImageUrl}
            onChange={(e) => handleChange("hintImageUrl", e.target.value)}
            placeholder="Введите URL изображения или оставьте пустым для загрузки файла после сохранения"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Текст подсказки */}
      <div>
        <label htmlFor="hintText" className="block text-sm font-medium text-gray-700">
          Текст подсказки
        </label>
        <input
          type="text"
          id="hintText"
          value={localData.hintText}
          onChange={(e) => handleChange("hintText", e.target.value)}
          placeholder="look for a gift with this sticker"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Текст для кода */}
      <div>
        <label htmlFor="codeText" className="block text-sm font-medium text-gray-700">
          Описание для кода
        </label>
        <textarea
          id="codeText"
          rows={2}
          value={localData.codeText}
          onChange={(e) => handleChange("codeText", e.target.value)}
          placeholder="This is the part of your cipher. Collect them all to reveal the last secret"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Секретный код */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Секретный код
        </label>
        <input
          type="text"
          id="code"
          value={localData.code}
          onChange={(e) => handleChange("code", e.target.value)}
          placeholder="Опциональный секретный код..."
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Настройки приватности */}
      <div className="flex items-center">
        <input
          id="isSecret"
          type="checkbox"
          checked={localData.isSecret}
          onChange={(e) => handleChange("isSecret", e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isSecret" className="ml-2 block text-sm text-gray-900">
          Секретный подарок (скрыт от публичного просмотра)
        </label>
      </div>

      {/* Примечание об обязательных полях */}
      <div className="bg-gray-50 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> - обязательные поля для создания подарка.
              Изображения и дополнительные файлы можно загрузить после первого сохранения.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 