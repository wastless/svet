"use client";

import React, { useState, useEffect } from "react";
import type { Gift, GiftContent } from "@/utils/types/gift";
import { GiftBasicInfo } from "./gift-basic-info";
import { ContentBlocksEditor } from "./content-blocks-editor";
import { GiftPhotosEditor } from "./gift-photos-editor";
import { WORD_SYSTEM } from "@/utils/data/constants";
import { ArrowRightIcon } from "../ui/icons";
import * as Button from "~/components/ui/button";
import * as IconButton from "~/components/ui/icon-button";
import { Root as AlertRoot, Icon as AlertIcon } from "../ui/alert";
import { RiErrorWarningLine } from "@remixicon/react";
import type { GiftPhotos } from "./gift-photos-editor";

interface GiftCreationWizardProps {
  onSave: (giftData: any) => void;
  onCancel: () => void;
  onSuccess?: () => void;
}

type Step = "basic" | "photos" | "content";

// Интерфейс для основных данных подарка
interface GiftBasicData {
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

export function GiftCreationWizard({
  onSave,
  onCancel,
  onSuccess,
}: GiftCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [savedGiftId, setSavedGiftId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Функция для генерации автоматического номера
  const generateAutomaticNumber = () => {
    const startDate = new Date(WORD_SYSTEM.START_DATE);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Основные данные подарка
  const [basicData, setBasicData] = useState<GiftBasicData>({
    title: "",
    author: "",
    nickname: "",
    number: generateAutomaticNumber(), // Автоматически генерируем номер
    openDate: "",
    englishDescription: "",
    hintText: "Look for a gift with this sticker",
    codeText:
      "This is the part of your cipher. Collect them all to reveal the last secret",
    code: "",
    isSecret: false,
  });

  // Фотографии подарка
  const [photos, setPhotos] = useState<GiftPhotos>({
    hintImageUrl: "",
    hintText: "Look for a gift with this sticker",
    imageCover: "",
    memoryPhoto: {
      photoUrl: "",
      photoDate: null
    },
  });

  // Контент подарка
  const [giftContent, setGiftContent] = useState<GiftContent>({
    blocks: [],
    metadata: {
      description: "",
    },
  });

  const steps: { id: Step; name: string }[] = [
    {
      id: "basic",
      name: "Информация",
    },
    {
      id: "photos",
      name: "Фотографии",
    },
    {
      id: "content",
      name: "Контент",
    },
  ];

  const handleNext = async () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        // Если переходим от базовой информации к следующему шагу, сохраняем данные
        if (currentStep === "basic" && !savedGiftId) {
          await handleSaveBasic();
          if (error) return; // Don't proceed if there was an error saving
        }
        setCurrentStep(nextStep.id);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep.id);
      }
    }
  };

  const handleSaveBasic = async () => {
    setIsSaving(true);
    try {
      // Validate required fields before proceeding
      if (!basicData.openDate || isNaN(new Date(basicData.openDate).getTime())) {
        setError("Пожалуйста, выберите корректную дату открытия");
        setIsSaving(false);
        return;
      }

      if (!basicData.number || basicData.number <= 0) {
        setError("Пожалуйста, укажите корректный номер подарка");
        setIsSaving(false);
        return;
      }

      if (!basicData.englishDescription) {
        setError("Пожалуйста, заполните английское описание");
        setIsSaving(false);
        return;
      }

      if (!basicData.author) {
        setError("Пожалуйста, укажите имя друга");
        setIsSaving(false);
        return;
      }

      if (!basicData.nickname) {
        setError("Пожалуйста, укажите никнейм друга");
        setIsSaving(false);
        return;
      }

      // Убедимся, что дата правильно преобразована
      let openDateIso;
      try {
        openDateIso = new Date(basicData.openDate).toISOString();
      } catch (e) {
        console.error("Ошибка преобразования даты:", e);
        setError("Некорректный формат даты открытия");
        setIsSaving(false);
        return;
      }

      // Явно укажем все необходимые поля в API запросе
      const giftData = {
        title: basicData.title || '',
        author: basicData.author,
        nickname: basicData.nickname,
        number: Number(basicData.number),
        openDate: openDateIso,
        englishDescription: basicData.englishDescription,
        hintText: basicData.hintText || 'Look for a gift with this sticker',
        codeText: basicData.codeText || 'This is the part of your cipher. Collect them all to reveal the last secret',
        code: basicData.code || '',
        isSecret: !!basicData.isSecret,
      };

      // Проверим данные перед отправкой
      console.log("Отправляемые данные:", giftData);
      
      if (!giftData.openDate || !giftData.number || !giftData.englishDescription) {
        setError("Не заполнены обязательные поля: дата открытия, номер или описание");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(giftData),
      });

      const responseData = await response.json();
      console.log("Ответ сервера:", responseData);
      
      if (response.ok) {
        setSavedGiftId(responseData.id);
      } else {
        console.error("Ошибка ответа сервера:", responseData);
        if (responseData.error) {
          setError(`Ошибка сохранения: ${responseData.error}`);
        } else {
          setError(`Ошибка сохранения: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setError("Ошибка при сохранении подарка");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContent = async () => {
    if (!savedGiftId) return;

    setIsSaving(true);
    try {
      // Получаем текущее состояние подарка перед обновлением
      const getGiftResponse = await fetch(`/api/gifts/${savedGiftId}`);
      if (!getGiftResponse.ok) {
        const error = await getGiftResponse.json();
        setError(`Не удалось получить данные подарка: ${error.error || getGiftResponse.statusText}`);
        setIsSaving(false);
        return;
      }

      const currentGift = await getGiftResponse.json();
      console.log("Текущее состояние подарка:", currentGift);

      // Убедимся, что обязательные поля присутствуют
      if (!currentGift.openDate || !currentGift.number || !currentGift.englishDescription) {
        console.error("В текущем подарке отсутствуют обязательные поля:", {
          openDate: currentGift.openDate,
          number: currentGift.number,
          englishDescription: currentGift.englishDescription
        });
      }

      // Передаем только те данные, которые нужно обновить
      const giftData = {
        // Добавляем новые/обновленные данные для контента и фотографий
        content: {
          ...giftContent,
        },
        hintImageUrl: photos.hintImageUrl,
        memoryPhoto: photos.memoryPhoto.photoUrl ? photos.memoryPhoto : null,
      };

      console.log("Данные для обновления:", giftData);

      const response = await fetch(`/api/gifts/${savedGiftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(giftData),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Ошибка при разборе ответа:", e);
        setError(`Ошибка при разборе ответа: ${e}`);
        setIsSaving(false);
        return;
      }
      
      console.log("Ответ сервера при сохранении контента:", responseData);

      if (response.ok) {
        // Успешное завершение создания подарка
        if (onSuccess) {
          onSuccess();
        } else {
          await onSave(responseData);
        }
      } else {
        console.error("Ошибка ответа сервера:", responseData);
        if (responseData.error) {
          setError(`Ошибка сохранения: ${responseData.error}`);
        } else {
          setError(`Ошибка сохранения: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setError(`Ошибка при сохранении подарка: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateGift = async () => {
    if (!savedGiftId) return;

    setIsSaving(true);
    try {
      // Подготавливаем полные данные для обновления
      const updateData = {
        ...basicData,
        openDate: new Date(basicData.openDate).toISOString(),
        number: Number(basicData.number),
        hintImageUrl: photos.hintImageUrl,
        hintText: photos.hintText,
        imageCover: photos.imageCover, // Добавляем поле imageCover
        content: giftContent,
        memoryPhoto: photos.memoryPhoto.photoUrl
          ? {
              photoUrl: photos.memoryPhoto.photoUrl,
              photoDate: photos.memoryPhoto.photoDate
                ? new Date(photos.memoryPhoto.photoDate).toISOString()
                : null,
            }
          : null,
      };

      const response = await fetch(`/api/gifts/${savedGiftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Ошибка при разборе ответа:", e);
        setError(`Ошибка при разборе ответа: ${e}`);
        setIsSaving(false);
        return;
      }
      
      console.log("Ответ сервера при сохранении подарка:", responseData);

      if (response.ok) {
        // Успешное завершение создания подарка
        if (onSuccess) {
          onSuccess();
        } else {
          await onSave(responseData);
        }
      } else {
        console.error("Ошибка ответа сервера:", responseData);
        if (responseData.error) {
          setError(`Ошибка сохранения: ${responseData.error}`);
        } else {
          setError(`Ошибка сохранения: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setError(`Ошибка при сохранении подарка: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isBasicStepValid = () => {
    return (
      basicData.openDate && 
      isNaN(new Date(basicData.openDate).getTime()) === false && 
      basicData.englishDescription && 
      basicData.number > 0 &&
      basicData.author &&
      basicData.nickname
    );
  };

  return (
    <>
      <div className="rounded-lg bg-white shadow-sm">
        {/* Заголовок */}
        <div className="border-b border-gray-200 py-6">
          <div className="flex items-center justify-between">
            <IconButton.Root
              onClick={currentStep === "basic" ? onCancel : handleBack}
              iconPosition="start"
              className=""
              icon={<ArrowRightIcon size={16} className="rotate-180" />}
            >
              {currentStep === "basic" ? "Отменить" : "Назад"}
            </IconButton.Root>

            {/* Шаги в заголовке */}
            <nav className="flex space-x-8" aria-label="Steps">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`whitespace-nowrap font-styrene text-paragraph-md font-bold uppercase ${
                    currentStep === step.id
                      ? "border-adaptive text-adaptive"
                      : index < steps.findIndex((s) => s.id === currentStep)
                        ? "border-adaptive text-adaptive"
                        : "border-transparent text-gray-500"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{index + 1}</span>
                    {step.name}
                  </div>
                </div>
              ))}
            </nav>

            <IconButton.Root
              onClick={handleNext}
              iconPosition="end"
              className=""
              icon={<ArrowRightIcon size={16} />}
            >
              Далее
            </IconButton.Root>
          </div>
        </div>

        {/* Контент шага */}
        <div className="py-8">
          {currentStep === "basic" && (
            <GiftBasicInfo data={basicData} onChange={setBasicData} />
          )}

          {currentStep === "photos" && (
            <GiftPhotosEditor
              photos={photos}
              onPhotosChange={setPhotos}
              nickname={basicData.nickname}
              giftId={savedGiftId || undefined}
            />
          )}

          {currentStep === "content" && (
            <ContentBlocksEditor
              content={giftContent}
              onChange={setGiftContent}
              giftId={savedGiftId || undefined}
            />
          )}
        </div>

        {/* Кнопка действия в конце формы */}
        <div className="px-8 py-6">
          <div className="flex justify-center">
            {currentStep === "content" ? (
              <Button.Root onClick={handleUpdateGift} disabled={isSaving}>
                {isSaving ? "Сохранение..." : "Сохранить подарок"}
              </Button.Root>
            ) : (
              <Button.Root 
                onClick={handleNext} 
                disabled={currentStep === "basic" && !isBasicStepValid() || isSaving}
              >
                {currentStep === "basic" && !savedGiftId && isSaving ? "Сохранение..." : "Далее"}
              </Button.Root>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-6 right-6 z-50">
          <AlertRoot variant="filled" status="error" size="small">
            <AlertIcon as={RiErrorWarningLine} />
            {error}
          </AlertRoot>
        </div>
      )}
    </>
  );
}
