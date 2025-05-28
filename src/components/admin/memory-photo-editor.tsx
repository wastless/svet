"use client";

import { useState, useEffect } from "react";

interface MemoryPhotoData {
  text: string;
  photoUrl: string;
}

interface MemoryPhotoEditorProps {
  data: MemoryPhotoData;
  onChange: (data: MemoryPhotoData) => void;
  giftId?: string;
}

export function MemoryPhotoEditor({ data, onChange, giftId }: MemoryPhotoEditorProps) {
  const [localData, setLocalData] = useState(data);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (field: keyof MemoryPhotoData, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange(newData);
  };

  const handleImageUpload = async (file: File) => {
    if (!giftId) {
      alert("Сначала сохраните подарок с основными данными, затем вы сможете загружать изображения");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("giftId", giftId);
      formData.append("fileType", "memory");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        handleChange("photoUrl", url);
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

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          📸 Полароидная фотография
        </h3>
        <p className="text-sm text-gray-600">
          Добавьте фотографию и подпись для создания полароидного снимка, который будет отображаться в подарке.
        </p>
      </div>

      {/* Превью полароида */}
      {(localData.photoUrl || localData.text) && (
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Превью полароида:</h4>
          <div className="inline-block bg-white p-3 shadow-lg transform rotate-1">
            {localData.photoUrl ? (
              <img
                src={localData.photoUrl}
                alt="Полароид"
                className="w-40 h-40 object-cover rounded mb-2"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {localData.text && (
              <p className="text-xs text-gray-700 text-center font-handwritten">
                {localData.text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Загрузка фотографии */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фотография для полароида
        </label>
        
        {/* Превью изображения */}
        {localData.photoUrl && (
          <div className="mb-4">
            <img
              src={localData.photoUrl}
              alt="Фотография"
              className="h-32 w-auto rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* Загрузка файла */}
        <div className="flex items-center space-x-4">
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

        {/* Ручной ввод URL */}
        <div className="mt-2">
          <input
            type="url"
            value={localData.photoUrl}
            onChange={(e) => handleChange("photoUrl", e.target.value)}
            placeholder="Или введите URL изображения..."
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Текст на полароиде */}
      <div>
        <label htmlFor="polaroidText" className="block text-sm font-medium text-gray-700">
          Подпись на полароиде
        </label>
        <input
          type="text"
          id="polaroidText"
          value={localData.text}
          onChange={(e) => handleChange("text", e.target.value)}
          placeholder="Например: @username или короткое сообщение"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Этот текст будет отображаться внизу полароида рукописным шрифтом
        </p>
      </div>

      {/* Советы по использованию */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Советы для полароида</h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-4 space-y-1">
                <li>Используйте квадратные фотографии для лучшего отображения</li>
                <li>Короткие подписи выглядят лучше (до 30 символов)</li>
                <li>Популярные форматы: @username, даты, короткие фразы</li>
                <li>Полароид добавляет винтажный шарм к подарку</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => {
            setLocalData({ text: "", photoUrl: "" });
            onChange({ text: "", photoUrl: "" });
          }}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Очистить полароид
        </button>
      </div>
    </div>
  );
} 