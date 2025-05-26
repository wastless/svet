import { db } from "~/server/db";
import { saveGiftContent, generateContentPath } from "./giftContent";
import type { GiftContent } from "~/types/gift";

// Пример данных для подарка
export async function createExampleGift() {
  // Сначала создаем запись в базе данных (ID генерируется автоматически)
  const giftRecord = await db.gift.create({
    data: {
      number: 1,
      title: "Первый подарок",
      isSecret: false,
      openDate: new Date("2024-12-25T00:00:00Z"), // Рождество
      englishDescription: "Each memory has a soundtrack of its own.",
      hintImageUrl: "/uploads/hint-sticker.jpg",
      code: "fZX+gs6J",
      contentPath: "", // временно пустой, заполним ниже
      memoryPhoto: {
        create: {
          text: "@savdis",
          photoUrl: "/uploads/memory-unlock.jpg"
        }
      }
    }
  });

  // Теперь используем сгенерированный ID для контента
  const content: GiftContent = {
    blocks: [
      {
        type: "text",
        content: "Дорогая Леся, поздравляю тебя с этим особенным днем!",
        style: "title"
      },
      {
        type: "quote",
        content: "Each memory has a soundtrack of its own.",
        style: "italic"
      },
      {
        type: "image",
        url: "/uploads/hint-card.jpg",
        caption: "Подсказка к твоему подарку",
        alt: "Карточка с подсказкой"
      },
      {
        type: "text",
        content: "Помнишь, как мы говорили о том, что каждый момент важен? Этот подарок - отражение всех наших прекрасных воспоминаний.",
        style: "normal"
      },
      {
        type: "gallery",
        images: [
          {
            url: "/uploads/memory-1.jpg",
            caption: "Наша первая встреча",
            alt: "Фото первой встречи"
          },
          {
            url: "/uploads/memory-2.jpg", 
            caption: "День на природе",
            alt: "Фото с природы"
          }
        ],
        layout: "grid"
      }
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0"
    }
  };

  // Генерируем путь к файлу контента на основе сгенерированного ID
  const contentPath = generateContentPath(giftRecord.id);
  
  // Сохраняем контент в файл
  const contentSaved = await saveGiftContent(contentPath, content);
  
  if (!contentSaved) {
    throw new Error("Не удалось сохранить контент подарка");
  }

  // Обновляем запись с правильным путем к контенту
  const updatedGift = await db.gift.update({
    where: { id: giftRecord.id },
    data: { contentPath: contentPath }
  });

  return updatedGift;
}

// Функция для создания секретного подарка
export async function createSecretGift() {
  // Сначала создаем запись в базе данных
  const giftRecord = await db.gift.create({
    data: {
      number: 2,
      title: "Секретный подарок", 
      isSecret: true,
      openDate: new Date("2024-12-26T00:00:00Z"),
      englishDescription: "Some memories are meant to be kept secret.",
      hintImageUrl: "/uploads/secret-hint.jpg",
      code: null,
      contentPath: "", // временно пустой
      memoryPhoto: {
        create: {
          text: "secret memory",
          photoUrl: "/uploads/secret-memory.jpg"
        }
      }
    }
  });
  
  const content: GiftContent = {
    blocks: [
      {
        type: "secret",
        content: [
          {
            type: "text",
            content: "Это секретное сообщение только для Леси! 💕",
            style: "title"
          },
          {
            type: "text",
            content: "Здесь может быть что-то очень личное и особенное...",
            style: "normal"
          }
        ],
        accessMessage: "Oops, only Lesya sees this content"
      }
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0"
    }
  };

  const contentPath = generateContentPath(giftRecord.id);
  const contentSaved = await saveGiftContent(contentPath, content);
  
  if (!contentSaved) {
    throw new Error("Не удалось сохранить контент секретного подарка");
  }

  // Обновляем запись с правильным путем к контенту
  const updatedGift = await db.gift.update({
    where: { id: giftRecord.id },
    data: { contentPath: contentPath }
  });

  return updatedGift;
} 