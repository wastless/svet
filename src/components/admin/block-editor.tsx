"use client";

import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { GiftBlock } from "@/utils/types/gift";
import * as Textarea from "~/components/ui/textarea";
import * as Label from "~/components/ui/label";
import * as Input from "~/components/ui/input";
import * as Select from "~/components/ui/select";
import { RiCloseLine } from "@remixicon/react";
import * as Checkbox from "~/components/ui/checkbox";
import { fetchYandexMusicMetadata, isYandexMusicUrl } from "@/utils/yandex-music";

interface BlockEditorProps {
  block: GiftBlock;
  onChange: (block: GiftBlock) => void;
  giftId?: string;
}

export function BlockEditor({ block, onChange, giftId }: BlockEditorProps) {
  const [localBlock, setLocalBlock] = useState(block);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingImageIndexes, setUploadingImageIndexes] = useState<number[]>(
    [],
  );
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);

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
      alert(
        "Сначала сохраните подарок с основными данными, затем вы сможете загружать файлы",
      );
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
        <Label.Root className="mb-2 block text-paragraph-sm">
          Текст <Label.Asterisk />
        </Label.Root>
        <Textarea.Root
          value={(localBlock as any).content || ""}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange({ content: e.target.value })
          }
          placeholder="Введите текст..."
        />
      </div>
      <div>
        <Label.Root className="mb-2 block text-paragraph-sm">Стиль</Label.Root>
        <Select.Root
          value={(localBlock as any).style || "normal"}
          onValueChange={(value) => handleChange({ style: value as any })}
        >
          <Select.Trigger>
            <Select.Value placeholder="Выберите стиль" />
          </Select.Trigger>
          <Select.Content>
            {[
              { label: "Обычный текст", value: "normal" },
              { label: "Заголовок", value: "title" },
              { label: "Подзаголовок", value: "subtitle" },
            ].map(({ label, value }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  );

  const renderQuoteEditor = () => (
    <div className="space-y-4">
      <div>
        <Label.Root className="mb-2 block text-paragraph-sm">
          Текст цитаты <Label.Asterisk />
        </Label.Root>
        <Textarea.Root
          value={(localBlock as any).content || ""}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange({ content: e.target.value })
          }
          placeholder="Введите цитату..."
        />
      </div>
      <div>
        <Label.Root className="mb-2 block text-paragraph-sm">
          Стиль цитаты
        </Label.Root>
        <Select.Root
          value={(localBlock as any).style || "small"}
          onValueChange={(value) => handleChange({ style: value as any })}
        >
          <Select.Trigger>
            <Select.Value placeholder="Выберите стиль" />
          </Select.Trigger>
          <Select.Content>
            {[
              { label: "Малый", value: "small" },
              { label: "Большой", value: "big" },
            ].map(({ label, value }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  );

  const renderImageEditor = () => (
    <div className="space-y-4">
      <div>
        <Label.Root className="mb-2 block text-paragraph-sm">
          Заголовок
        </Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              type="text"
              value={(localBlock as any).title || ""}
              onChange={(e) => handleChange({ title: e.target.value })}
              placeholder="Заголовок блока"
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className="pt-2">
        <Label.Root className="mb-2 block text-paragraph-sm">Текст</Label.Root>
        <Textarea.Root
          value={(localBlock as any).text || ""}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange({ text: e.target.value })
          }
          placeholder="Описание к изображению"
        />
      </div>

      <div className="pt-2">
        <div className="space-y-2">
          {(localBlock as any).url && (
            <div className="mb-4">
              <img
                src={(localBlock as any).url}
                alt="Превью"
                className="h-40 rounded-lg border border-gray-300 object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "url");
            }}
            className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
            disabled={uploadingFile}
          />
          {uploadingFile && (
            <div className="text-blue-500 mt-1 text-xs">
              Загрузка изображения...
            </div>
          )}
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="url"
                value={(localBlock as any).url || ""}
                onChange={(e) => handleChange({ url: e.target.value })}
                placeholder="Или введите URL изображения..."
              />
              {(localBlock as any).url && (
                <button
                  type="button"
                  onClick={() => handleChange({ url: "" })}
                  className="p-1"
                >
                  <Input.Icon as={RiCloseLine} />
                </button>
              )}
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>

      <div className="pt-2">
        <Label.Root className="mb-3 block text-paragraph-sm">
          Подпись под фото
        </Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              type="text"
              value={(localBlock as any).caption || ""}
              onChange={(e) => handleChange({ caption: e.target.value })}
              placeholder="Подпись под изображением"
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Расположение
          </Label.Root>

          <Select.Root
            value={(localBlock as any).layout || "image-center"}
            onValueChange={(value) => handleChange({ layout: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите стиль" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "По центру", value: "image-center" },
                { label: "Слева", value: "image-left" },
                { label: "Справа", value: "image-right" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Размер
          </Label.Root>
          <Select.Root
            value={(localBlock as any).size || "medium"}
            onValueChange={(value) => handleChange({ size: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите стиль" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Маленький", value: "small" },
                { label: "Средний", value: "medium" },
                { label: "Большой", value: "large" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Ориентация
          </Label.Root>
          <Select.Root
            value={(localBlock as any).orientation || "horizontal"}
            onValueChange={(value) =>
              handleChange({ orientation: value as any })
            }
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите стиль" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Горизонтальная", value: "horizontal" },
                { label: "Вертикальная", value: "vertical" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </div>
  );

  const renderMusicEditor = () => {
    // Handle Yandex Music URL change with metadata fetching
    const handleYandexMusicUrlChange = async (url: string) => {
      handleChange({ yandexMusicUrl: url });
      
      // Clear previous errors and status
      setMetadataError(null);
      setLoadingStatus(null);
      
      // Check if it's a valid Yandex Music URL
      if (isYandexMusicUrl(url)) {
        setIsFetchingMetadata(true);
        setLoadingStatus("Загрузка данных из Яндекс.Музыки...");
        try {
          const metadata = await fetchYandexMusicMetadata(url);
          // Update the block with the fetched metadata
          handleChange({
            artist: metadata.artist,
            trackName: metadata.trackName,
            coverUrl: metadata.coverUrl,
            yandexMusicUrl: url,
            // Only update duration if it's provided
            ...(metadata.duration ? { duration: metadata.duration } : {}),
          });
          setLoadingStatus("Данные успешно загружены!");
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            if (url === (localBlock as any).yandexMusicUrl) {
              setLoadingStatus(null);
            }
          }, 3000);
        } catch (error) {
          console.error("Ошибка при загрузке метаданных из Яндекс.Музыки:", error);
          setMetadataError(error instanceof Error ? error.message : "Ошибка при загрузке данных");
        } finally {
          setIsFetchingMetadata(false);
        }
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label.Root className="mb-3 block text-paragraph-sm">
            Заголовок
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={(localBlock as any).title || ""}
                onChange={(e) => handleChange({ title: e.target.value })}
                placeholder="Заголовок блока"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className="pt-2">
          <Label.Root className="mb-3 block text-paragraph-sm">
            Аудио файл <Label.Asterisk />
          </Label.Root>
          <div className="space-y-2">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "url");
              }}
              className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
              disabled={uploadingFile}
            />
            {uploadingFile && (
              <div className="text-blue-500 mt-1 text-xs">
                Загрузка аудио...
              </div>
            )}
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  type="url"
                  value={(localBlock as any).url || ""}
                  onChange={(e) => handleChange({ url: e.target.value })}
                  placeholder="Или введите URL аудио файла"
                />
                {(localBlock as any).url && (
                  <button
                    type="button"
                    onClick={() => handleChange({ url: "" })}
                    className="p-1"
                  >
                    <Input.Icon as={RiCloseLine} />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>

        <div className="pt-2">
          <Label.Root className="mb-3 block text-paragraph-sm">
            Обложка <Label.Asterisk />
          </Label.Root>
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
              className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
              disabled={uploadingFile}
            />
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  type="url"
                  value={(localBlock as any).coverUrl || ""}
                  onChange={(e) => handleChange({ coverUrl: e.target.value })}
                  placeholder="URL обложки"
                />
                {(localBlock as any).coverUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange({ coverUrl: "" })}
                    className="p-1"
                  >
                    <Input.Icon as={RiCloseLine} />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
          <div>
            <Label.Root className="mb-3 block text-paragraph-sm">
              Исполнитель
            </Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  type="text"
                  value={(localBlock as any).artist || ""}
                  onChange={(e) => handleChange({ artist: e.target.value })}
                  placeholder="Имя исполнителя"
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div>
            <Label.Root className="mb-3 block text-paragraph-sm">
              Название трека
            </Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  type="text"
                  value={(localBlock as any).trackName || ""}
                  onChange={(e) => handleChange({ trackName: e.target.value })}
                  placeholder="Название песни"
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>

        <div className="pt-2">
          <Label.Root className="mb-3 block text-paragraph-sm">
            Ссылка на Яндекс.Музыку <Label.Asterisk />
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="url"
                value={(localBlock as any).yandexMusicUrl || ""}
                onChange={(e) => handleYandexMusicUrlChange(e.target.value)}
                placeholder="https://music.yandex.ru/..."
                disabled={isFetchingMetadata}
              />
              {isFetchingMetadata && (
                <div className="p-1">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              )}
            </Input.Wrapper>
          </Input.Root>
          {loadingStatus && (
            <div className="mt-1 text-xs text-blue-500">
              {loadingStatus}
            </div>
          )}
          {metadataError && (
            <div className="mt-2 text-xs text-red-500 p-2 border border-red-300 bg-red-50 rounded">
              <p>{metadataError}</p>
              <p className="mt-1 font-medium">Заполните данные о треке вручную:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Исполнитель</li>
                <li>Название трека</li>
                <li>URL обложки</li>
              </ul>
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            Вставьте ссылку на трек из Яндекс.Музыки, чтобы автоматически заполнить поля
          </div>
        </div>
      </div>
    );
  };

  const renderTwoImagesEditor = () => {
    // Если images массив не существует или пустой, инициализируем его с двумя элементами
    const images = (localBlock as any).images || [
      { url: "", title: "", text: "", caption: "", layout: "text-top" },
      { url: "", title: "", text: "", caption: "", layout: "text-top" },
    ];

    // Обновляем только массив images
    const handleImagesChange = (updatedImages: any[]) => {
      handleChange({ images: updatedImages });
    };

    // Обновляем конкретное поле в конкретном изображении
    const handleImageFieldChange = (
      index: number,
      field: string,
      value: any,
    ) => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      handleImagesChange(newImages);
    };

    // Обрабатываем загрузку файла для конкретного изображения
    const handleImageFileUpload = async (file: File, index: number) => {
      if (!giftId) {
        alert(
          "Сначала сохраните подарок с основными данными, затем вы сможете загружать файлы",
        );
        return;
      }

      // Добавляем индекс в массив загружаемых изображений
      setUploadingImageIndexes((prev) => [...prev, index]);

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
          handleImageFieldChange(index, "url", url);
        } else {
          alert("Ошибка загрузки файла");
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Ошибка загрузки файла");
      } finally {
        // Удаляем индекс из массива загружаемых изображений
        setUploadingImageIndexes((prev) => prev.filter((i) => i !== index));
      }
    };

    return (
      <div className="space-y-8">
        {/* Глобальные настройки для обоих изображений */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label.Root className="mb-2 block text-paragraph-sm">
              Размер
            </Label.Root>
            <Select.Root
              value={(localBlock as any).size || "medium"}
              onValueChange={(value) => handleChange({ size: value as any })}
            >
              <Select.Trigger>
                <Select.Value placeholder="Выберите размер" />
              </Select.Trigger>
              <Select.Content>
                {[
                  { label: "Маленький", value: "small" },
                  { label: "Средний", value: "medium" },
                  { label: "Большой", value: "large" },
                ].map(({ label, value }) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div>
            <Label.Root className="mb-2 block text-paragraph-sm">
              Ориентация
            </Label.Root>
            <Select.Root
              value={(localBlock as any).orientation || "horizontal"}
              onValueChange={(value) =>
                handleChange({ orientation: value as any })
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Выберите ориентацию" />
              </Select.Trigger>
              <Select.Content>
                {[
                  { label: "Горизонтальная", value: "horizontal" },
                  { label: "Вертикальная", value: "vertical" },
                ].map(({ label, value }) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {/* Первое изображение */}
        <div className="rounded-md border border-gray-200 p-4">
          <h3 className="mb-4 font-styrene text-lg font-medium">
            Изображение 1
          </h3>

          <div className="space-y-4">
            <div>
              {images[0]?.url && (
                <div className="mb-4">
                  <img
                    src={images[0].url}
                    alt="Превью"
                    className="h-40 rounded-lg border border-gray-300 object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFileUpload(file, 0);
                  }}
                  className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                  disabled={uploadingImageIndexes.includes(0)}
                />
                {uploadingImageIndexes.includes(0) && (
                  <div className="text-blue-500 mt-1 text-xs">
                    Загрузка изображения...
                  </div>
                )}
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input
                      type="url"
                      value={images[0]?.url || ""}
                      onChange={(e) =>
                        handleImageFieldChange(0, "url", e.target.value)
                      }
                      placeholder="Или введите URL изображения..."
                    />
                    {images[0]?.url && (
                      <button
                        type="button"
                        onClick={() => handleImageFieldChange(0, "url", "")}
                        className="p-1"
                      >
                        <Input.Icon as={RiCloseLine} />
                      </button>
                    )}
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Заголовок
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    type="text"
                    value={images[0]?.title || ""}
                    onChange={(e) =>
                      handleImageFieldChange(0, "title", e.target.value)
                    }
                    placeholder="Заголовок изображения"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Текст
              </Label.Root>
              <Textarea.Root
                value={images[0]?.text || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleImageFieldChange(0, "text", e.target.value)
                }
                placeholder="Описание изображения"
              />
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Подпись
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    type="text"
                    value={images[0]?.caption || ""}
                    onChange={(e) =>
                      handleImageFieldChange(0, "caption", e.target.value)
                    }
                    placeholder="Подпись под изображением"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Расположение текста
              </Label.Root>
              <Select.Root
                value={images[0]?.layout || "text-top"}
                onValueChange={(value) =>
                  handleImageFieldChange(0, "layout", value)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Выберите расположение" />
                </Select.Trigger>
                <Select.Content>
                  {[
                    { label: "Текст сверху", value: "text-top" },
                    { label: "Текст снизу", value: "text-bottom" },
                  ].map(({ label, value }) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        </div>

        {/* Второе изображение */}
        <div className="rounded-md border border-gray-200 p-4">
          <h3 className="mb-4 font-styrene text-lg font-medium">
            Изображение 2
          </h3>

          <div className="space-y-4">
            <div>
              {images[1]?.url && (
                <div className="mb-4">
                  <img
                    src={images[1].url}
                    alt="Превью"
                    className="h-40 rounded-lg border border-gray-300 object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFileUpload(file, 1);
                  }}
                  className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                  disabled={uploadingImageIndexes.includes(1)}
                />
                {uploadingImageIndexes.includes(1) && (
                  <div className="text-blue-500 mt-1 text-xs">
                    Загрузка изображения...
                  </div>
                )}
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input
                      type="url"
                      value={images[1]?.url || ""}
                      onChange={(e) =>
                        handleImageFieldChange(1, "url", e.target.value)
                      }
                      placeholder="Или введите URL изображения..."
                    />
                    {images[1]?.url && (
                      <button
                        type="button"
                        onClick={() => handleImageFieldChange(1, "url", "")}
                        className="p-1"
                      >
                        <Input.Icon as={RiCloseLine} />
                      </button>
                    )}
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Заголовок
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    type="text"
                    value={images[1]?.title || ""}
                    onChange={(e) =>
                      handleImageFieldChange(1, "title", e.target.value)
                    }
                    placeholder="Заголовок изображения"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Текст
              </Label.Root>
              <Textarea.Root
                value={images[1]?.text || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleImageFieldChange(1, "text", e.target.value)
                }
                placeholder="Описание изображения"
              />
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Подпись
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    type="text"
                    value={images[1]?.caption || ""}
                    onChange={(e) =>
                      handleImageFieldChange(1, "caption", e.target.value)
                    }
                    placeholder="Подпись под изображением"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Расположение текста
              </Label.Root>
              <Select.Root
                value={images[1]?.layout || "text-top"}
                onValueChange={(value) =>
                  handleImageFieldChange(1, "layout", value)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Выберите расположение" />
                </Select.Trigger>
                <Select.Content>
                  {[
                    { label: "Текст сверху", value: "text-top" },
                    { label: "Текст снизу", value: "text-bottom" },
                  ].map(({ label, value }) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGalleryEditor = () => {
    // Если images массив не существует или пустой, инициализируем его с одним элементом
    const images = (localBlock as any).images || [{ url: "", caption: "" }];

    // Обновляем только массив images
    const handleImagesChange = (updatedImages: any[]) => {
      handleChange({ images: updatedImages });
    };

    // Обновляем конкретное поле в конкретном изображении
    const handleImageFieldChange = (
      index: number,
      field: string,
      value: any,
    ) => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      handleImagesChange(newImages);
    };

    // Обрабатываем загрузку файла для конкретного изображения
    const handleImageFileUpload = async (file: File, index: number) => {
      if (!giftId) {
        alert(
          "Сначала сохраните подарок с основными данными, затем вы сможете загружать файлы",
        );
        return;
      }

      // Добавляем индекс в массив загружаемых изображений
      setUploadingImageIndexes((prev) => [...prev, index]);

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
          handleImageFieldChange(index, "url", url);
        } else {
          alert("Ошибка загрузки файла");
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Ошибка загрузки файла");
      } finally {
        // Удаляем индекс из массива загружаемых изображений
        setUploadingImageIndexes((prev) => prev.filter((i) => i !== index));
      }
    };

    // Добавление нового изображения в галерею
    const handleAddImage = () => {
      // Проверяем, что не превышаем лимит в 6 изображений
      if (images.length < 6) {
        handleImagesChange([...images, { url: "", caption: "" }]);
      }
    };

    // Удаление изображения из галереи
    const handleRemoveImage = (index: number) => {
      const newImages = images.filter((_: any, i: number) => i !== index);
      handleImagesChange(newImages);
    };

    return (
      <div className="space-y-6">
        {/* Заголовок и текст галереи */}
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Заголовок галереи
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={(localBlock as any).title || ""}
                onChange={(e) => handleChange({ title: e.target.value })}
                placeholder="Заголовок галереи"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Текст галереи
          </Label.Root>
          <Textarea.Root
            value={(localBlock as any).text || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange({ text: e.target.value })
            }
            placeholder="Описание галереи"
          />
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Размер текста
          </Label.Root>
          <Select.Root
            value={(localBlock as any).textSize || "small"}
            onValueChange={(value) => handleChange({ textSize: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите размер текста" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Маленький", value: "small" },
                { label: "Большой", value: "large" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Количество колонок
          </Label.Root>
          <Select.Root
            value={String((localBlock as any).columns || 2)}
            onValueChange={(value) =>
              handleChange({ columns: Number(value) as 2 | 3 })
            }
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите количество колонок" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "2 колонки", value: "2" },
                { label: "3 колонки", value: "3" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {/* Секция с изображениями */}
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Label.Root className="block text-paragraph-sm">
                Изображения галереи <Label.Asterisk />
              </Label.Root>
              <div className="mt-1 text-xs text-gray-500">
                {images.length} из 6 изображений
              </div>
            </div>
          </div>

          {images.map(
            (image: { url: string; caption?: string }, index: number) => (
              <div
                key={index}
                className="mb-6 rounded-md border border-gray-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-styrene text-paragraph-sm font-medium uppercase">
                    Изображение {index + 1}
                  </h3>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-600"
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    {image.url && (
                      <div className="mb-4">
                        <img
                          src={image.url}
                          alt={`Превью ${index + 1}`}
                          className="h-40 rounded-lg border border-gray-300 object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(file, index);
                        }}
                        className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                        disabled={uploadingImageIndexes.includes(index)}
                      />
                      {uploadingImageIndexes.includes(index) && (
                        <div className="text-blue-500 mt-1 text-xs">
                          Загрузка изображения...
                        </div>
                      )}
                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Input
                            type="url"
                            value={image.url || ""}
                            onChange={(e) =>
                              handleImageFieldChange(
                                index,
                                "url",
                                e.target.value,
                              )
                            }
                            placeholder="Или введите URL изображения..."
                          />
                          {image.url && (
                            <button
                              type="button"
                              onClick={() =>
                                handleImageFieldChange(index, "url", "")
                              }
                              className="p-1"
                            >
                              <Input.Icon as={RiCloseLine} />
                            </button>
                          )}
                        </Input.Wrapper>
                      </Input.Root>
                    </div>
                  </div>

                  <div>
                    <Label.Root className="mb-2 block text-paragraph-sm">
                      Подпись
                    </Label.Root>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="text"
                          value={image.caption || ""}
                          onChange={(e) =>
                            handleImageFieldChange(
                              index,
                              "caption",
                              e.target.value,
                            )
                          }
                          placeholder="Подпись под изображением"
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                </div>
              </div>
            ),
          )}

          {/* Кнопка добавления изображения */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleAddImage}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                images.length >= 6
                  ? "cursor-not-allowed bg-neutral-200 text-gray-500"
                  : "hover:bg-primary-600 bg-bg-strong-950 text-white"
              }`}
              disabled={images.length >= 6}
            >
              {images.length >= 6
                ? "Достигнут лимит изображений (6)"
                : "Добавить еще изображение"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVideoCircleEditor = () => (
    <div className="space-y-6">
      {/* Заголовок и текст */}
      <div>
        <Label.Root className="mb-2 block text-paragraph-sm">
          Заголовок
        </Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              type="text"
              value={(localBlock as any).title || ""}
              onChange={(e) => handleChange({ title: e.target.value })}
              placeholder="Заголовок блока"
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div>
        <Label.Root className="mb-2 block text-paragraph-sm">
          Текст
        </Label.Root>
        <Textarea.Root
          value={(localBlock as any).text || ""}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange({ text: e.target.value })
          }
          placeholder="Описание к видео"
        />
      </div>

      <div>
        <Label.Root className="mb-2 block text-paragraph-sm">
          Размер текста
        </Label.Root>
        <Select.Root
          value={(localBlock as any).textSize || "small"}
          onValueChange={(value) => handleChange({ textSize: value as any })}
        >
          <Select.Trigger>
            <Select.Value placeholder="Выберите размер текста" />
          </Select.Trigger>
          <Select.Content>
            {[
              { label: "Маленький", value: "small" },
              { label: "Большой", value: "large" },
            ].map(({ label, value }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      {/* Загрузка видео */}
      <div className="pt-0">
        <div className="space-y-2">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "url");
            }}
            className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
            disabled={uploadingFile}
          />
          {uploadingFile && (
            <div className="text-blue-500 mt-1 text-xs">
              Загрузка видео...
            </div>
          )}
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="url"
                value={(localBlock as any).url || ""}
                onChange={(e) => handleChange({ url: e.target.value })}
                placeholder="Или введите URL видео..."
              />
              {(localBlock as any).url && (
                <button
                  type="button"
                  onClick={() => handleChange({ url: "" })}
                  className="p-1"
                >
                  <Input.Icon as={RiCloseLine} />
                </button>
              )}
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>

      {/* Подпись под видео */}
      <div className="pt-2">
        <Label.Root className="mb-3 block text-paragraph-sm">
          Подпись под видео
        </Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              type="text"
              value={(localBlock as any).caption || ""}
              onChange={(e) => handleChange({ caption: e.target.value })}
              placeholder="Подпись под видео"
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      {/* Размер видеокружка */}
      <div className="pt-2">
        <Label.Root className="mb-2 block text-paragraph-sm">
          Размер видеокружка
        </Label.Root>
        <Select.Root
          value={(localBlock as any).size || "medium"}
          onValueChange={(value) => handleChange({ size: value as any })}
        >
          <Select.Trigger>
            <Select.Value placeholder="Выберите размер" />
          </Select.Trigger>
          <Select.Content>
            {[
              { label: "Маленький", value: "small" },
              { label: "Средний", value: "medium" },
              { label: "Большой", value: "large" },
            ].map(({ label, value }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      {/* Дополнительные настройки видео */}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox.Root
            id="autoplay"
            checked={(localBlock as any).autoplay || false}
            onCheckedChange={(checked) => handleChange({ autoplay: checked })}
          />
          <Label.Root
            className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
            htmlFor="autoplay"
          >
            Автовоспроизведение
          </Label.Root>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox.Root
            id="muted"
            checked={(localBlock as any).muted !== false}
            onCheckedChange={(checked) => handleChange({ muted: checked })}
          />
          <Label.Root
            className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
            htmlFor="muted"
          >
            Без звука
          </Label.Root>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox.Root
            id="loop"
            checked={(localBlock as any).loop !== false}
            onCheckedChange={(checked) => handleChange({ loop: checked })}
          />
          <Label.Root
            className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
            htmlFor="loop"
          >
            Зацикленное воспроизведение
          </Label.Root>
        </div>
      </div>
    </div>
  );

  const renderVideoEditor = () => {
    return (
      <div className="space-y-6">
        {/* Заголовок и текст */}
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Заголовок
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={(localBlock as any).title || ""}
                onChange={(e) => handleChange({ title: e.target.value })}
                placeholder="Заголовок блока"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Текст
          </Label.Root>
          <Textarea.Root
            value={(localBlock as any).text || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange({ text: e.target.value })
            }
            placeholder="Описание к видео"
          />
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Размер текста
          </Label.Root>
          <Select.Root
            value={(localBlock as any).textSize || "small"}
            onValueChange={(value) => handleChange({ textSize: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите размер текста" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Маленький", value: "small" },
                { label: "Большой", value: "large" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {/* Загрузка видео */}
        <div className="pt-0">
          <div className="space-y-2">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "url");
              }}
              className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
              disabled={uploadingFile}
            />
            {uploadingFile && (
              <div className="text-blue-500 mt-1 text-xs">
                Загрузка видео...
              </div>
            )}
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  type="url"
                  value={(localBlock as any).url || ""}
                  onChange={(e) => handleChange({ url: e.target.value })}
                  placeholder="Или введите URL видео..."
                />
                {(localBlock as any).url && (
                  <button
                    type="button"
                    onClick={() => handleChange({ url: "" })}
                    className="p-1"
                  >
                    <Input.Icon as={RiCloseLine} />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>

        {/* Подпись под видео */}
        <div className="pt-2">
          <Label.Root className="mb-3 block text-paragraph-sm">
            Подпись под видео
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={(localBlock as any).caption || ""}
                onChange={(e) => handleChange({ caption: e.target.value })}
                placeholder="Подпись под видео"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        {/* Размер видео */}
        <div className="pt-2">
          <Label.Root className="mb-2 block text-paragraph-sm">
            Размер видео
          </Label.Root>
          <Select.Root
            value={(localBlock as any).size || "medium"}
            onValueChange={(value) => handleChange({ size: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите размер" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Маленький (1/2 ширины)", value: "small" },
                { label: "Средний (2/3 ширины)", value: "medium" },
                { label: "Большой (полная ширина)", value: "large" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {/* Дополнительные настройки видео */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox.Root
              id="video-autoplay"
              checked={(localBlock as any).autoplay || false}
              onCheckedChange={(checked) => handleChange({ autoplay: checked })}
            />
            <Label.Root
              className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
              htmlFor="video-autoplay"
            >
              Автовоспроизведение
            </Label.Root>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox.Root
              id="video-muted"
              checked={(localBlock as any).muted !== false}
              onCheckedChange={(checked) => handleChange({ muted: checked })}
            />
            <Label.Root
              className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
              htmlFor="video-muted"
            >
              Без звука
            </Label.Root>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox.Root
              id="video-loop"
              checked={(localBlock as any).loop || false}
              onCheckedChange={(checked) => handleChange({ loop: checked })}
            />
            <Label.Root
              className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
              htmlFor="video-loop"
            >
              Зацикленное воспроизведение
            </Label.Root>
          </div>
        </div>
      </div>
    );
  };

  const renderAudioMessageEditor = () => {
    return (
      <div className="space-y-6">
        {/* Заголовок и текст */}
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Заголовок
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={(localBlock as any).title || ""}
                onChange={(e) => handleChange({ title: e.target.value })}
                placeholder="Заголовок блока"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Текст
          </Label.Root>
          <Textarea.Root
            value={(localBlock as any).text || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange({ text: e.target.value })
            }
            placeholder="Описание к голосовому сообщению"
          />
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Размер текста
          </Label.Root>
          <Select.Root
            value={(localBlock as any).textSize || "small"}
            onValueChange={(value) => handleChange({ textSize: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите размер текста" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Маленький", value: "small" },
                { label: "Большой", value: "large" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {/* Загрузка аудио */}
        <div className="pt-0">
          <div className="space-y-2">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "url");
              }}
              className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
              disabled={uploadingFile}
            />
            {uploadingFile && (
              <div className="text-blue-500 mt-1 text-xs">
                Загрузка аудио...
              </div>
            )}
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  type="url"
                  value={(localBlock as any).url || ""}
                  onChange={(e) => handleChange({ url: e.target.value })}
                  placeholder="Или введите URL аудио файла..."
                />
                {(localBlock as any).url && (
                  <button
                    type="button"
                    onClick={() => handleChange({ url: "" })}
                    className="p-1"
                  >
                    <Input.Icon as={RiCloseLine} />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
      </div>
    );
  };

  // Упрощенный рендер для других типов блоков
  const renderGenericEditor = () => (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <p className="font-styrene text-paragraph-sm">
          🚧 Редактор для блока типа "{block.type}" в разработке. Пока что можно
          редактировать только базовые поля.
        </p>
      </div>

      {/* URL поле для медиа блоков */}
      {"url" in block && (
        <div>
          <Label.Root className="mb-3 block text-paragraph-sm">
            URL файла
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="url"
                value={(localBlock as any).url || ""}
                onChange={(e) => handleChange({ url: e.target.value })}
                placeholder="URL медиа файла"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
      )}

      {/* Заголовок для блоков, которые его поддерживают */}
      {"title" in block && (
        <div>
          <Label.Root className="mb-3 block text-paragraph-sm">
            Заголовок
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={(localBlock as any).title || ""}
                onChange={(e) => handleChange({ title: e.target.value })}
                placeholder="Заголовок блока"
              />
            </Input.Wrapper>
          </Input.Root>
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
    case "two-images":
      return renderTwoImagesEditor();
    case "gallery":
      return renderGalleryEditor();
    case "video-circle":
      return renderVideoCircleEditor();
    case "video":
      return renderVideoEditor();
    case "audio-message":
      return renderAudioMessageEditor();
    default:
      return renderGenericEditor();
  }
}
