"use client";

import { useState, useEffect } from "react";
import * as Input from "~/components/ui/input";
import { WORD_SYSTEM } from "@/utils/data/constants";
import * as Label from "~/components/ui/label";
import * as Textarea from "~/components/ui/textarea";
import * as Checkbox from "~/components/ui/checkbox";

interface GiftBasicInfoData {
  title: string;
  author: string;
  nickname: string;
  number: number;
  openDate: string;
  englishDescription: string;
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

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Автоматически генерируем номер при первой загрузке, если номер равен 0
  useEffect(() => {
    if (localData.number === 0) {
      generateNumber();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof GiftBasicInfoData, value: any) => {
    const newData = { ...localData, [field]: value };
    
    // Особая обработка для даты открытия
    if (field === "openDate" && value) {
      try {
        // Проверяем, что дата валидна
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.warn("Указана некорректная дата:", value);
        }
      } catch (e) {
        console.error("Ошибка при обработке даты:", e);
      }
    }

    setLocalData(newData);
    onChange(newData);
  };

  // Проверка валидности формы
  useEffect(() => {
    // Убедимся, что дата открытия, номер и английское описание заполнены
    if (localData.openDate && localData.number > 0 && localData.englishDescription) {
      // Проверка корректности даты
      const date = new Date(localData.openDate);
      if (isNaN(date.getTime())) {
        // Если дата некорректна, очистим ее
        handleChange("openDate", "");
      }
    }
  }, [localData.openDate, localData.number, localData.englishDescription]);

  const generateNumber = () => {
    // Генерируем номер на основе START_DATE из констант
    const startDate = new Date(WORD_SYSTEM.START_DATE);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    handleChange("number", diffDays);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Название подарка */}
        <div className="flex flex-col gap-3 sm:col-span-2">
          <Label.Root htmlFor="title">Название подарка</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={localData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Музыкальный плеер"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        {/* Номер подарка */}
        <div className="flex flex-col gap-3">
          <Label.Root htmlFor="number">
            Номер подарка <Label.Asterisk />
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="number"
                id="number"
                value={localData.number}
                onChange={(e) =>
                  handleChange("number", parseInt(e.target.value) || 0)
                }
                required
                min="1"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        {/* Дата открытия */}
        <div className="flex flex-col gap-3">
          <Label.Root htmlFor="openDate">
            Дата открытия <Label.Asterisk />
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="datetime-local"
                id="openDate"
                value={localData.openDate}
                onChange={(e) => handleChange("openDate", e.target.value)}
                required
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        {/* Автор подарка */}
        <div className="flex flex-col gap-3">
          <Label.Root htmlFor="author">Имя друга <Label.Asterisk /></Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                type="text"
                value={localData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                placeholder="Даша"
                required
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        {/* Никнейм подарка */}
        <div className="flex flex-col gap-3">
          <Label.Root htmlFor="nickname">Никнейм друга <Label.Asterisk /></Label.Root>
          <Input.Root>
            <Input.Wrapper>
            <Input.InlineAffix>@</Input.InlineAffix>
              <Input.Input
                type="text"
                value={localData.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
                placeholder="savdis"
                required
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>

      {/* Английское описание */}
      <div className="flex flex-col gap-3">
        <Label.Root htmlFor="englishDescription">
          Английское описание <Label.Asterisk />
        </Label.Root>
        <Textarea.Root
          placeholder="Each memory has a soundtrack of its own..."
          value={localData.englishDescription}
          onChange={(e) => handleChange("englishDescription", e.target.value)}
          required
        >
          <Textarea.CharCounter
            current={localData.englishDescription.length}
            max={200}
          />
        </Textarea.Root>
      </div>

      {/* Текст для кода */}
      <div className="flex flex-col gap-3 sm:col-span-2">
        <Label.Root htmlFor="codeText">Описание для кода</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id="codeText"
              value={localData.codeText}
              onChange={(e) => handleChange("codeText", e.target.value)}
              placeholder="This is the part of your cipher. Collect them all to reveal the last secret"
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      {/* Секретный код */}
      <div className="flex flex-col gap-3 sm:col-span-2">
        <Label.Root htmlFor="code">Секретный код</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id="code"
              value={localData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="fZX+g"
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      {/* Настройки приватности */}
      <div className="flex items-center gap-2">
        <Checkbox.Root
          id="isSecret"
          checked={localData.isSecret}
          onCheckedChange={(checked) => handleChange("isSecret", !!checked)}
        />
        <Label.Root
          className="text-paragraph-sm font-styrene uppercase text-text-strong-950"
          htmlFor="isSecret"
        >
          Секретный подарок (скрыт от публичного просмотра)
        </Label.Root>
      </div>
    </div>
  );
}
