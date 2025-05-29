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
import * as Label from "~/components/ui/label";

export interface GiftPhotos {
  hintImageUrl: string;
  hintText?: string;
  imageCover?: string;
  memoryPhoto: {
    photoUrl: string;
    photoDate: string | null;
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
  const [uploadingCover, setUploadingCover] = useState(false);
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

  const handleCoverImageUpload = async (file: File) => {
    if (!giftId) {
      setError("Сначала сохраните подарок с основными данными");
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("giftId", giftId);
      formData.append("fileType", "cover");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        onPhotosChange({ ...photos, imageCover: url });
      } else {
        setError("Ошибка загрузки изображения обложки");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setError("Ошибка загрузки изображения обложки");
    } finally {
      setUploadingCover(false);
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
          memoryPhoto: { 
            ...photos.memoryPhoto,
            photoUrl: url 
          },
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
          
          {/* Текст подсказки */}
          <div className="mt-4">
            <Label.Root className="block mb-2">Текст подсказки</Label.Root>
            <InputRoot>
              <InputWrapper>
                <Input
                  id="hintText"
                  value={photos.hintText || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onPhotosChange({ ...photos, hintText: e.target.value })
                  }
                  placeholder="Look for a gift with this sticker"
                />
                {photos.hintText && (
                  <button
                    type="button"
                    onClick={() =>
                      onPhotosChange({ ...photos, hintText: "" })
                    }
                    className="p-1"
                  >
                    <InputIcon as={RiCloseLine} />
                  </button>
                )}
              </InputWrapper>
            </InputRoot>
          </div>

          {/* Оригинальное изображение для обложки (imageCover) */}
          <div className="mt-6">
            <h3 className="mb-2 font-styrene text-paragraph-md font-bold uppercase text-text-strong-950">
              Изображение обложки (оригинал)
            </h3>
            <div className="mb-2 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverImageUpload(file);
                }}
                className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                disabled={uploadingCover}
              />
              {uploadingCover && (
                <span className="text-sm text-gray-500">Загрузка...</span>
              )}
            </div>

            {/* Ручной ввод URL */}
            <InputRoot>
              <InputWrapper>
                <Input
                  type="url"
                  value={photos.imageCover || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onPhotosChange({ ...photos, imageCover: e.target.value })
                  }
                  placeholder="Или введите URL оригинального изображения..."
                />
                {photos.imageCover && (
                  <button
                    type="button"
                    onClick={() =>
                      onPhotosChange({ ...photos, imageCover: "" })
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
                      memoryPhoto: { 
                        ...photos.memoryPhoto,
                        photoUrl: e.target.value 
                      },
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
                        memoryPhoto: { 
                          ...photos.memoryPhoto,
                          photoUrl: "" 
                        }
                      })
                    }
                    className="p-1"
                  >
                    <InputIcon as={RiCloseLine} />
                  </button>
                )}
              </InputWrapper>
            </InputRoot>
            
            {/* Поле для ввода даты создания фотографии */}
            <div className="mt-4">
              <Label.Root className="block mb-2">Дата создания фотографии</Label.Root>
              <InputRoot>
                <InputWrapper>
                  <Input
                    type="date"
                    value={photos.memoryPhoto.photoDate || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onPhotosChange({
                        ...photos,
                        memoryPhoto: {
                          ...photos.memoryPhoto,
                          photoDate: e.target.value || null
                        },
                      })
                    }
                    placeholder="Выберите дату создания фотографии"
                  />
                  {photos.memoryPhoto.photoDate && (
                    <button
                      type="button"
                      onClick={() =>
                        onPhotosChange({
                          ...photos,
                          memoryPhoto: {
                            ...photos.memoryPhoto,
                            photoDate: null
                          },
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
    </div>
  );
}
