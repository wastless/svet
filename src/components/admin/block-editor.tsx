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
  // Add a state for text columns initialization
  const [textColumnsInitialized, setTextColumnsInitialized] = useState(false);

  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  // Add a useEffect for initializing text columns
  useEffect(() => {
    if (block.type === "text-columns" && !Array.isArray((localBlock as any).items)) {
      handleChange({ 
        items: [{ title: "", text: "Текст колонки" }],
        count: (localBlock as any).count || 1
      });
      setTextColumnsInitialized(true);
    }
    
    // Добавляем инициализацию для блоков типа "infographic"
    if (block.type === "infographic" && !Array.isArray((localBlock as any).items)) {
      handleChange({ 
        items: [{ number: "0", text: "Текст под цифрой" }],
        count: (localBlock as any).count || 1,
        alignment: "center"
      });
    }
  }, [block.type]);

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

  const renderTextEditor = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Заголовок
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={(localBlock as any).heading || ""}
                onChange={(e) => handleChange({ heading: e.target.value })}
                placeholder="Заголовок блока (опционально)"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        
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
          <div className="text-sm text-gray-500 mt-1">
            Доступно форматирование текста: 
            <span className="font-bold px-1">**жирный**</span>,
            <span className="italic px-1">*курсив*</span>,
            <span className="underline px-1">__подчеркнутый__</span>,
            <span className="line-through px-1">~~зачеркнутый~~</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
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
          
          <div>
            <Label.Root className="mb-2 block text-paragraph-sm">Выравнивание</Label.Root>
            <Select.Root
              value={(localBlock as any).alignment || "left"}
              onValueChange={(value) => handleChange({ alignment: value as any })}
            >
              <Select.Trigger>
                <Select.Value placeholder="Выберите выравнивание" />
              </Select.Trigger>
              <Select.Content>
                {[
                  { label: "По левому краю", value: "left" },
                  { label: "По центру", value: "center" },
                  { label: "По правому краю", value: "right" },
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
  };

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
        <div className="text-sm text-gray-500 mt-1">
          Доступно форматирование текста: 
          <span className="font-bold px-1">**жирный**</span>,
          <span className="italic px-1">*курсив*</span>,
          <span className="underline px-1">__подчеркнутый__</span>,
          <span className="line-through px-1">~~зачеркнутый~~</span>
        </div>
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

        <div>
          <Label.Root className="mb-3 block text-paragraph-sm">
            Текст
          </Label.Root>
          <textarea
            value={(localBlock as any).text || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              handleChange({ text: e.target.value, textSize: "medium" })
            }
            placeholder="Текст блока"
            rows={3}
            className="block w-full resize-none rounded-xl px-3 py-2.5 ring-1 ring-inset ring-stroke-soft-200"
          />
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
      </div>
    );
  };

  const renderMusicGalleryEditor = () => {
    // Инициализация массива треков, если отсутствует
    const tracks = (localBlock as any).tracks || [];
    
    // Генерация уникального ID для нового трека
    const generateTrackId = () => {
      return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    
    // Обновление массива треков
    const handleTracksChange = (updatedTracks: any[]) => {
      handleChange({ tracks: updatedTracks, textSize: "medium" });
    };
    
    // Обновление конкретного поля трека
    const handleTrackFieldChange = (
      index: number, 
      field: string, 
      value: any
    ) => {
      const newTracks = [...tracks];
      newTracks[index] = { ...newTracks[index], [field]: value };
      handleTracksChange(newTracks);
    };
    
    // Загрузка файла (аудио или обложки) для трека
    const handleTrackFileUpload = async (file: File, index: number, field: string) => {
      if (!giftId) {
        alert(
          "Сначала сохраните подарок с основными данными, затем вы сможете загружать файлы"
        );
        return;
      }
      
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
          handleTrackFieldChange(index, field, url);
        } else {
          alert("Ошибка загрузки файла");
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Ошибка загрузки файла");
      } finally {
        setUploadingImageIndexes((prev) => 
          prev.filter((idx) => idx !== index)
        );
      }
    };
    
    // Добавление нового трека
    const handleAddTrack = () => {
      const newTrack = {
        id: generateTrackId(),
        url: "",
        artist: "",
        trackName: "",
        coverUrl: "",
        duration: 0,
      };
      
      const newTracks = [...tracks, newTrack];
      handleTracksChange(newTracks);
    };
    
    // Удаление трека
    const handleRemoveTrack = (index: number) => {
      const newTracks = [...tracks];
      newTracks.splice(index, 1);
      handleTracksChange(newTracks);
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
                onChange={(e) => handleChange({ title: e.target.value, textSize: "medium" })}
                placeholder="Заголовок галереи"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        
        <div>
          <Label.Root className="mb-3 block text-paragraph-sm">
            Текст
          </Label.Root>
          <Textarea.Root
            value={(localBlock as any).text || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange({ text: e.target.value, textSize: "medium" })
            }
            placeholder="Описание галереи музыки"
          />
          <div className="mt-1 text-xs text-gray-500">
            Доступно форматирование текста: 
            <span className="font-bold px-1">**жирный**</span>,
            <span className="italic px-1">*курсив*</span>
          </div>
        </div>
        
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Размер текста
          </Label.Root>
          <Select.Root
            value={(localBlock as any).textSize || "medium"}
            onValueChange={(value) => handleChange({ textSize: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите размер текста" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Средний", value: "medium" },
                { label: "Малый", value: "small" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-styrene text-paragraph-md">Список треков</h3>
            <button
              type="button"
              onClick={handleAddTrack}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
              disabled={tracks.length >= 10}
            >
              + Добавить трек
            </button>
          </div>
          
          {tracks.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              Нет добавленных треков. Добавьте трек, используя кнопку выше.
            </div>
          )}
          
          <div className="space-y-6">
            {tracks.map((track: any, index: number) => (
              <div key={track.id || index} className="border border-gray-200 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveTrack(index)}
                  className="absolute top-2 right-2 rounded-full bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  title="Удалить трек"
                >
                  <RiCloseLine className="h-4 w-4" />
                </button>
                
                {/* Детали трека */}
                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                  <div>
                    <Label.Root className="mb-3 block text-paragraph-sm">
                      Исполнитель <Label.Asterisk />
                    </Label.Root>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="text"
                          value={track.artist || ""}
                          onChange={(e) => handleTrackFieldChange(index, "artist", e.target.value)}
                          placeholder="Исполнитель"
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                  
                  <div>
                    <Label.Root className="mb-3 block text-paragraph-sm">
                      Название трека <Label.Asterisk />
                    </Label.Root>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="text"
                          value={track.trackName || ""}
                          onChange={(e) => handleTrackFieldChange(index, "trackName", e.target.value)}
                          placeholder="Название трека"
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                </div>
                
                {/* Аудиофайл */}
                <div className="mt-4">
                  <Label.Root className="mb-3 block text-paragraph-sm">
                    Аудио файл <Label.Asterisk />
                  </Label.Root>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleTrackFileUpload(file, index, "url");
                      }}
                      className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                      disabled={uploadingImageIndexes.includes(index)}
                    />
                    {uploadingImageIndexes.includes(index) && (
                      <div className="text-blue-500 mt-1 text-xs">
                        Загрузка аудио...
                      </div>
                    )}
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="url"
                          value={track.url || ""}
                          onChange={(e) => handleTrackFieldChange(index, "url", e.target.value)}
                          placeholder="Или введите URL аудио файла"
                        />
                        {track.url && (
                          <button
                            type="button"
                            onClick={() => handleTrackFieldChange(index, "url", "")}
                            className="p-1"
                          >
                            <Input.Icon as={RiCloseLine} />
                          </button>
                        )}
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                </div>
                
                {/* Обложка */}
                <div className="mt-4">
                  <Label.Root className="mb-3 block text-paragraph-sm">
                    Обложка
                  </Label.Root>
                  {track.coverUrl && (
                    <div className="mb-4">
                      <img
                        src={track.coverUrl}
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
                        if (file) handleTrackFileUpload(file, index, "coverUrl");
                      }}
                      className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                      disabled={uploadingImageIndexes.includes(index)}
                    />
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="url"
                          value={track.coverUrl || ""}
                          onChange={(e) => handleTrackFieldChange(index, "coverUrl", e.target.value)}
                          placeholder="URL обложки"
                        />
                        {track.coverUrl && (
                          <button
                            type="button"
                            onClick={() => handleTrackFieldChange(index, "coverUrl", "")}
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
            ))}
          </div>
          
          {tracks.length > 0 && tracks.length < 10 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleAddTrack}
                className="rounded-md bg-bg-strong-950 px-4 py-2 text-sm text-white"
                disabled={tracks.length >= 10}
              >
                + Добавить трек ({tracks.length}/10)
              </button>
            </div>
          )}
          
          {tracks.length >= 10 && (
            <div className="mt-4 text-center text-red-500">
              Достигнут максимум треков (10)
            </div>
          )}
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
        {/* Общее описание для блока */}
        <div className="rounded-md border border-gray-200 p-4">
          <h3 className="mb-4 font-styrene text-lg font-medium">
            Общее описание
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Заголовок описания
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    type="text"
                    value={(localBlock as any).descriptionTitle || ""}
                    onChange={(e) =>
                      handleChange({ descriptionTitle: e.target.value })
                    }
                    placeholder="Заголовок общего описания"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            
            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Текст описания
              </Label.Root>
              <Textarea.Root
                value={(localBlock as any).description || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange({ description: e.target.value })
                }
                placeholder="Общее описание блока"
              />
            </div>
            
            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Расположение описания
              </Label.Root>
              <Select.Root
                value={(localBlock as any).descriptionPosition || "top"}
                onValueChange={(value) =>
                  handleChange({ descriptionPosition: value as any })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Выберите расположение" />
                </Select.Trigger>
                <Select.Content>
                  {[
                    { label: "Сверху", value: "top" },
                    { label: "Снизу", value: "bottom" },
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
    // Инициализация массива изображений, если отсутствует
    const images = (localBlock as any).images || [];
    
    // Обновление массива изображений
    const handleImagesChange = (updatedImages: any[]) => {
      handleChange({ images: updatedImages, textSize: "medium" });
    };
    
    // Обновление конкретного поля изображения
    const handleImageFieldChange = (
      index: number,
      field: string,
      value: any,
    ) => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      handleImagesChange(newImages);
    };
    
    // Загрузка файла изображения
    const handleImageFileUpload = async (file: File, index: number) => {
      if (!giftId) {
        alert(
          "Сначала сохраните подарок с основными данными, затем вы сможете загружать файлы"
        );
        return;
      }
      
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
        setUploadingImageIndexes((prev) =>
          prev.filter((idx) => idx !== index)
        );
      }
    };
    
    // Добавление нового изображения
    const handleAddImage = () => {
      const newImage = { url: "", caption: "" };
      const newImages = [...images, newImage];
      handleImagesChange(newImages);
    };
    
    // Удаление изображения
    const handleRemoveImage = (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      handleImagesChange(newImages);
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
                onChange={(e) => handleChange({ title: e.target.value, textSize: "medium" })}
                placeholder="Заголовок галереи"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root className="mb-3 block text-paragraph-sm">
            Текст
          </Label.Root>
          <Textarea.Root
            value={(localBlock as any).text || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange({ text: e.target.value, textSize: "medium" })
            }
            placeholder="Описание галереи"
          />
        </div>

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Количество колонок
          </Label.Root>
          <Select.Root
            value={String((localBlock as any).columns || 2)}
            onValueChange={(value) =>
              handleChange({ columns: Number(value) as 2 | 3, textSize: "medium" })
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
              onChange={(e) => handleChange({ title: e.target.value, textSize: "medium" })}
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
            handleChange({ text: e.target.value, textSize: "medium" })
          }
          placeholder="Описание к видео"
        />
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

      {/* Ориентация видео */}
      <div className="pt-2">
        <Label.Root className="mb-2 block text-paragraph-sm">
          Ориентация видео
        </Label.Root>
        <Select.Root
          value={(localBlock as any).orientation || "horizontal"}
          onValueChange={(value) => handleChange({ orientation: value as any })}
        >
          <Select.Trigger>
            <Select.Value placeholder="Выберите ориентацию" />
          </Select.Trigger>
          <Select.Content>
            {[
              { label: "Горизонтальное (16:9)", value: "horizontal" },
              { label: "Вертикальное (9:16)", value: "vertical" },
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
                onChange={(e) => handleChange({ title: e.target.value, textSize: "medium" })}
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
              handleChange({ text: e.target.value, textSize: "medium" })
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
                { label: "Большой", value: "medium" },
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

        {/* Ориентация видео */}
        <div className="pt-2">
          <Label.Root className="mb-2 block text-paragraph-sm">
            Ориентация видео
          </Label.Root>
          <Select.Root
            value={(localBlock as any).orientation || "horizontal"}
            onValueChange={(value) => handleChange({ orientation: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите ориентацию" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "Горизонтальное (16:9)", value: "horizontal" },
                { label: "Вертикальное (9:16)", value: "vertical" },
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
                onChange={(e) => handleChange({ title: e.target.value, textSize: "medium" })}
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
              handleChange({ text: e.target.value, textSize: "medium" })
            }
            placeholder="Описание к голосовому сообщению"
          />
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

  const renderDividerEditor = () => (
    <div className="space-y-4 flex flex-col items-center">
            <span className="font-nyghtserif text-adaptive sm:text-label-lg md:text-label-xl">
              ***
            </span>
    </div>
  );

  const renderInfoGraphicEditor = () => {
    // Проверяем, что items является массивом
    if (!Array.isArray((localBlock as any).items)) {
      return <div className="p-4 text-center">Инициализация блока...</div>;
    }
    
    // Обеспечиваем, что у нас есть правильное количество элементов в массиве
    const ensureItemsCount = (count: number) => {
      const currentItems = [...((localBlock as any).items || [])];
      
      // Если элементов меньше, чем нужно, добавляем новые
      while (currentItems.length < count) {
        currentItems.push({ number: "0", text: "Текст под цифрой" });
      }
      
      // Если элементов больше, чем нужно, удаляем лишние
      if (currentItems.length > count) {
        currentItems.splice(count);
      }
      
      return currentItems;
    };
    
    // Обработчик изменения количества цифр
    const handleCountChange = (count: number) => {
      const items = ensureItemsCount(count);
      handleChange({ count, items });
    };
    
    // Обработчик изменения элемента
    const handleItemChange = (index: number, field: string, value: string) => {
      const items = [...((localBlock as any).items || [])];
      if (items[index]) {
        items[index] = { ...items[index], [field]: value };
        handleChange({ items });
      }
    };
    
    return (
      <div className="space-y-4">
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Количество цифр
          </Label.Root>
          <Select.Root
            value={String((localBlock as any).count || 1)}
            onValueChange={(value) => handleCountChange(Number(value) as 1 | 2 | 3)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите количество" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "1 цифра", value: "1" },
                { label: "2 цифры", value: "2" },
                { label: "3 цифры", value: "3" },
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
            Выравнивание
          </Label.Root>
          <Select.Root
            value={(localBlock as any).alignment || "center"}
            onValueChange={(value) => handleChange({ alignment: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите выравнивание" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "По левому краю", value: "left" },
                { label: "По центру", value: "center" },
                { label: "По правому краю", value: "right" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div className="space-y-4 pt-4">
          {(localBlock as any).items.map((item: any, index: number) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label.Root className="mb-2 block text-paragraph-sm">
                    Цифра №{index + 1} <Label.Asterisk />
                  </Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        type="text"
                        value={item.number || ""}
                        onChange={(e) =>
                          handleItemChange(index, "number", e.target.value)
                        }
                        placeholder="Например: 42"
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
                <div>
                  <Label.Root className="mb-2 block text-paragraph-sm">
                    Текст <Label.Asterisk />
                  </Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        type="text"
                        value={item.text || ""}
                        onChange={(e) =>
                          handleItemChange(index, "text", e.target.value)
                        }
                        placeholder="Текст под цифрой"
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  <div className="text-sm text-gray-500 mt-1">
                    Доступно форматирование: 
                    <span className="font-bold px-1">**жирный**</span>,
                    <span className="italic px-1">*курсив*</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Добавляем функцию renderTextColumnsEditor после renderInfoGraphicEditor

  const renderTextColumnsEditor = () => {
    // If items is not initialized yet, render a loading state
    if (!Array.isArray((localBlock as any).items)) {
      return <div className="p-4 text-center">Инициализация блока...</div>;
    }
    
    // Обеспечиваем, что у нас есть правильное количество элементов в массиве
    const ensureItemsCount = (count: number) => {
      const currentItems = [...((localBlock as any).items || [])];
      
      // Если элементов меньше, чем нужно, добавляем новые
      while (currentItems.length < count) {
        currentItems.push({ title: "", text: "Текст колонки" });
      }
      
      // Если элементов больше, чем нужно, удаляем лишние
      if (currentItems.length > count) {
        currentItems.splice(count);
      }
      
      return currentItems;
    };
    
    // Обработчик изменения количества колонок
    const handleCountChange = (count: number) => {
      const items = ensureItemsCount(count);
      handleChange({ count, items });
    };
    
    // Обработчик изменения элемента
    const handleItemChange = (index: number, field: string, value: string) => {
      const items = [...((localBlock as any).items || [])];
      if (items[index]) {
        items[index] = { ...items[index], [field]: value };
        handleChange({ items });
      }
    };
    
    return (
      <div className="space-y-4">
        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Количество колонок
          </Label.Root>
          <Select.Root
            value={String((localBlock as any).count || 1)}
            onValueChange={(value) => handleCountChange(Number(value) as 1 | 2 | 3)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите количество" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "1 колонка", value: "1" },
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

        <div>
          <Label.Root className="mb-2 block text-paragraph-sm">
            Выравнивание
          </Label.Root>
          <Select.Root
            value={(localBlock as any).alignment || "left"}
            onValueChange={(value) => handleChange({ alignment: value as any })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Выберите выравнивание" />
            </Select.Trigger>
            <Select.Content>
              {[
                { label: "По левому краю", value: "left" },
                { label: "По центру", value: "center" },
                { label: "По правому краю", value: "right" },
              ].map(({ label, value }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div className="space-y-4 pt-4">
          {(localBlock as any).items.map((item: any, index: number) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label.Root className="mb-2 block text-paragraph-sm">
                    Заголовок колонки №{index + 1}
                  </Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        type="text"
                        value={item.title || ""}
                        onChange={(e) =>
                          handleItemChange(index, "title", e.target.value)
                        }
                        placeholder="Заголовок колонки (опционально)"
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
                <div>
                  <Label.Root className="mb-2 block text-paragraph-sm">
                    Текст колонки <Label.Asterisk />
                  </Label.Root>
                  <Textarea.Root
                    value={item.text || ""}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleItemChange(index, "text", e.target.value)
                    }
                    placeholder="Текст колонки"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Доступно форматирование: 
                    <span className="font-bold px-1">**жирный**</span>,
                    <span className="italic px-1">*курсив*</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTwoVideosEditor = () => {
    // Если videos массив не существует или пустой, инициализируем его с двумя элементами
    const videos = (localBlock as any).videos || [
      { url: "", title: "", text: "", caption: "", layout: "text-top", autoplay: false, muted: true, loop: false },
      { url: "", title: "", text: "", caption: "", layout: "text-top", autoplay: false, muted: true, loop: false },
    ];

    // Обновляем только массив videos
    const handleVideosChange = (updatedVideos: any[]) => {
      handleChange({ videos: updatedVideos });
    };

    // Обновляем конкретное поле в конкретном видео
    const handleVideoFieldChange = (
      index: number,
      field: string,
      value: any,
    ) => {
      const newVideos = [...videos];
      newVideos[index] = { ...newVideos[index], [field]: value };
      handleVideosChange(newVideos);
    };

    // Загрузка видео
    const handleVideoFileUpload = async (file: File, index: number) => {
      if (!giftId) {
        alert(
          "Сначала сохраните подарок с основными данными, затем вы сможете загружать файлы",
        );
        return;
      }

      // Добавляем индекс в массив загружаемых
      setUploadingImageIndexes((prev) => [...prev, index]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("giftId", giftId);
        formData.append("fileType", "video");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const { url } = await response.json();
          handleVideoFieldChange(index, "url", url);
        } else {
          alert("Ошибка загрузки видео");
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Ошибка загрузки видео");
      } finally {
        // Удаляем индекс из массива загружаемых
        setUploadingImageIndexes((prev) =>
          prev.filter((i) => i !== index),
        );
      }
    };

    return (
      <div className="space-y-8">
        {/* Глобальные настройки для обоих видео */}
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

        {/* Первое видео */}
        <div className="rounded-md border border-gray-200 p-4">
          <h3 className="mb-4 font-styrene text-lg font-medium">
            Видео 1
          </h3>

          <div className="space-y-4">
            <div>
              {videos[0]?.url && (
                <div className="mb-4">
                  <video
                    src={videos[0].url}
                    controls
                    className="h-40 rounded-lg border border-gray-300 object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoFileUpload(file, 0);
                  }}
                  className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                  disabled={uploadingImageIndexes.includes(0)}
                />
                {uploadingImageIndexes.includes(0) && (
                  <div className="text-blue-500 mt-1 text-xs">
                    Загрузка видео...
                  </div>
                )}
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input
                      type="url"
                      value={videos[0]?.url || ""}
                      onChange={(e) =>
                        handleVideoFieldChange(0, "url", e.target.value)
                      }
                      placeholder="Или введите URL видео..."
                    />
                    {videos[0]?.url && (
                      <button
                        type="button"
                        onClick={() => handleVideoFieldChange(0, "url", "")}
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
                    value={videos[0]?.title || ""}
                    onChange={(e) =>
                      handleVideoFieldChange(0, "title", e.target.value)
                    }
                    placeholder="Заголовок видео"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Текст
              </Label.Root>
              <Textarea.Root
                value={videos[0]?.text || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleVideoFieldChange(0, "text", e.target.value)
                }
                placeholder="Описание видео"
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
                    value={videos[0]?.caption || ""}
                    onChange={(e) =>
                      handleVideoFieldChange(0, "caption", e.target.value)
                    }
                    placeholder="Подпись под видео"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Расположение текста
              </Label.Root>
              <Select.Root
                value={videos[0]?.layout || "text-top"}
                onValueChange={(value) =>
                  handleVideoFieldChange(0, "layout", value)
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

            {/* Дополнительные настройки видео */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="video1-autoplay"
                  checked={videos[0]?.autoplay || false}
                  onCheckedChange={(checked) => handleVideoFieldChange(0, "autoplay", checked)}
                />
                <Label.Root
                  className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
                  htmlFor="video1-autoplay"
                >
                  Автовоспроизведение
                </Label.Root>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="video1-muted"
                  checked={videos[0]?.muted !== false}
                  onCheckedChange={(checked) => handleVideoFieldChange(0, "muted", checked)}
                />
                <Label.Root
                  className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
                  htmlFor="video1-muted"
                >
                  Без звука
                </Label.Root>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="video1-loop"
                  checked={videos[0]?.loop || false}
                  onCheckedChange={(checked) => handleVideoFieldChange(0, "loop", checked)}
                />
                <Label.Root
                  className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
                  htmlFor="video1-loop"
                >
                  Зацикленное воспроизведение
                </Label.Root>
              </div>
            </div>
          </div>
        </div>

        {/* Второе видео */}
        <div className="rounded-md border border-gray-200 p-4">
          <h3 className="mb-4 font-styrene text-lg font-medium">
            Видео 2
          </h3>

          <div className="space-y-4">
            <div>
              {videos[1]?.url && (
                <div className="mb-4">
                  <video
                    src={videos[1].url}
                    controls
                    className="h-40 rounded-lg border border-gray-300 object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoFileUpload(file, 1);
                  }}
                  className="block w-full font-styrene text-paragraph-sm font-medium uppercase text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:font-styrene file:text-paragraph-sm file:font-medium file:uppercase"
                  disabled={uploadingImageIndexes.includes(1)}
                />
                {uploadingImageIndexes.includes(1) && (
                  <div className="text-blue-500 mt-1 text-xs">
                    Загрузка видео...
                  </div>
                )}
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input
                      type="url"
                      value={videos[1]?.url || ""}
                      onChange={(e) =>
                        handleVideoFieldChange(1, "url", e.target.value)
                      }
                      placeholder="Или введите URL видео..."
                    />
                    {videos[1]?.url && (
                      <button
                        type="button"
                        onClick={() => handleVideoFieldChange(1, "url", "")}
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
                    value={videos[1]?.title || ""}
                    onChange={(e) =>
                      handleVideoFieldChange(1, "title", e.target.value)
                    }
                    placeholder="Заголовок видео"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Текст
              </Label.Root>
              <Textarea.Root
                value={videos[1]?.text || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleVideoFieldChange(1, "text", e.target.value)
                }
                placeholder="Описание видео"
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
                    value={videos[1]?.caption || ""}
                    onChange={(e) =>
                      handleVideoFieldChange(1, "caption", e.target.value)
                    }
                    placeholder="Подпись под видео"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <Label.Root className="mb-2 block text-paragraph-sm">
                Расположение текста
              </Label.Root>
              <Select.Root
                value={videos[1]?.layout || "text-top"}
                onValueChange={(value) =>
                  handleVideoFieldChange(1, "layout", value)
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

            {/* Дополнительные настройки видео */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="video2-autoplay"
                  checked={videos[1]?.autoplay || false}
                  onCheckedChange={(checked) => handleVideoFieldChange(1, "autoplay", checked)}
                />
                <Label.Root
                  className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
                  htmlFor="video2-autoplay"
                >
                  Автовоспроизведение
                </Label.Root>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="video2-muted"
                  checked={videos[1]?.muted !== false}
                  onCheckedChange={(checked) => handleVideoFieldChange(1, "muted", checked)}
                />
                <Label.Root
                  className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
                  htmlFor="video2-muted"
                >
                  Без звука
                </Label.Root>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="video2-loop"
                  checked={videos[1]?.loop || false}
                  onCheckedChange={(checked) => handleVideoFieldChange(1, "loop", checked)}
                />
                <Label.Root
                  className="font-styrene text-paragraph-sm font-medium text-text-strong-950"
                  htmlFor="video2-loop"
                >
                  Зацикленное воспроизведение
                </Label.Root>
              </div>
            </div>
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
    case "musicGallery":
      return renderMusicGalleryEditor();
    case "two-images":
      return renderTwoImagesEditor();
    case "two-videos":
      return renderTwoVideosEditor();
    case "gallery":
      return renderGalleryEditor();
    case "video-circle":
      return renderVideoCircleEditor();
    case "video":
      return renderVideoEditor();
    case "audio-message":
      return renderAudioMessageEditor();
    case "divider":
      return renderDividerEditor();
    case "infographic":
      return renderInfoGraphicEditor();
    case "text-columns":
      return renderTextColumnsEditor();
    default:
      return renderGenericEditor();
  }
}
