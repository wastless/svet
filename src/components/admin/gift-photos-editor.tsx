"use client";

import { useState } from "react";
import {
  Root as InputRoot,
  Wrapper as InputWrapper,
  Input,
  Icon as InputIcon,
} from "../ui/input";
import { RiCloseLine } from "@remixicon/react";
import { Root as AlertRoot, Icon as AlertIcon } from "../ui/alert";
import { RiErrorWarningLine } from "@remixicon/react";

interface GiftPhotos {
  hintImageUrl: string;
  memoryPhoto: {
    photoUrl: string;
  };
}

interface GiftPhotosEditorProps {
  photos: GiftPhotos;
  onPhotosChange: (photos: GiftPhotos) => void;
  nickname: string;
  giftId?: string;
}

export function GiftPhotosEditor({
  photos,
  onPhotosChange,
  nickname,
  giftId,
}: GiftPhotosEditorProps) {
  const [uploadingHint, setUploadingHint] = useState(false);
  const [uploadingMemory, setUploadingMemory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHintImageUpload = async (file: File) => {
    if (!giftId) {
      setError("Сначала сохраните подарок с основными данными");
      return;
    }

    setUploadingHint(true);
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
        onPhotosChange({ ...photos, hintImageUrl: url });
      } else {
        setError("Ошибка загрузки изображения");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setError("Ошибка загрузки изображения");
    } finally {
      setUploadingHint(false);
    }
  };

  const handleMemoryPhotoUpload = async (file: File) => {
    if (!giftId) {
      setError("Сначала сохраните подарок с основными данными");
      return;
    }

    setUploadingMemory(true);
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
        onPhotosChange({
          ...photos,
          memoryPhoto: { photoUrl: url },
        });
      } else {
        setError("Ошибка загрузки изображения");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setError("Ошибка загрузки изображения");
    } finally {
      setUploadingMemory(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <AlertRoot variant="filled" status="error" size="small">
          <AlertIcon as={RiErrorWarningLine} />
          {error}
        </AlertRoot>
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Левая колонка - Фото подсказки */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-styrene text-paragraph-md font-bold uppercase text-text-strong-950">
              Фотография-подсказка
            </h3>
          </div>

          {/* Загрузка фотографии подсказки */}
          <div>
            {/* Загрузка файла */}
            <div className="mb-2 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleHintImageUpload(file);
                }}
                className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                disabled={uploadingHint}
              />
              {uploadingHint && (
                <span className="text-sm text-gray-500">Загрузка...</span>
              )}
            </div>

            {/* Ручной ввод URL */}
            <InputRoot>
              <InputWrapper>
                <Input
                  type="url"
                  value={photos.hintImageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onPhotosChange({ ...photos, hintImageUrl: e.target.value })
                  }
                  placeholder="Или введите URL изображения..."
                />
                {photos.hintImageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      onPhotosChange({ ...photos, hintImageUrl: "" })
                    }
                    className="p-1"
                  >
                    <InputIcon as={RiCloseLine} />
                  </button>
                )}
              </InputWrapper>
            </InputRoot>
          </div>
        </div>

        {/* Правая колонка - Полароидная фотография */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-styrene text-paragraph-md font-bold uppercase text-text-strong-950">
              Полароидная фотография
            </h3>
          </div>

          {/* Загрузка фотографии полароида */}
          <div>
            {/* Загрузка файла */}
            <div className="mb-2 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMemoryPhotoUpload(file);
                }}
                className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                disabled={uploadingMemory}
              />
              {uploadingMemory && (
                <span className="text-sm text-gray-500">Загрузка...</span>
              )}
            </div>

            {/* Ручной ввод URL */}
            <InputRoot>
              <InputWrapper>
                <Input
                  type="url"
                  value={photos.memoryPhoto.photoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onPhotosChange({
                      ...photos,
                      memoryPhoto: { photoUrl: e.target.value },
                    })
                  }
                  placeholder="Или введите URL изображения..."
                />
                {photos.memoryPhoto.photoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      onPhotosChange({
                        ...photos,
                        memoryPhoto: { photoUrl: "" },
                      })
                    }
                    className="p-1"
                  >
                    <InputIcon as={RiCloseLine} />
                  </button>
                )}
              </InputWrapper>
            </InputRoot>
          </div>
        </div>
      </div>
    </div>
  );
}
