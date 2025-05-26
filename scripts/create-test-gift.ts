// npx tsx scripts/create-test-gift.ts

import { db } from "../src/server/db";
import { saveGiftContent, generateContentPath } from "../src/lib/giftContent";
import type { GiftContent } from "../src/types/gift";

async function createTestGift() {
  console.log("🎁 Создаю тестовый подарок...");
  
  try {
    // Создаем запись в базе данных
    const giftRecord = await db.gift.create({
      data: {
        number: Math.floor(Math.random() * 1000) + 1,
        title: "Тест",
        isSecret: false,
        openDate: new Date(), // Доступен сразу
        englishDescription: "Each memory has a soundtrack of its own",
        hintImageUrl: "/uploads/1748280744731_image.png",
        hintText: "look for a gift with this sticker",
        code: "LOVE2024",
        contentPath: "" // заполним ниже
      }
    });

    console.log(`✅ Создана запись подарка с ID: ${giftRecord.id}`);

    // Создаем богатый контент для подарка
    const content: GiftContent = {
      blocks: [
        {
          type: "text",
          content: "Дорогая Леся! 💕",
          style: "title"
        },
        {
          type: "text",
          content: "Этот особенный подарок создан специально для тебя. Каждый день с тобой - это новое приключение, полное смеха, любви и незабываемых моментов.",
          style: "normal"
        },
        {
          type: "quote",
          content: "Every moment with you is a treasure worth keeping.",
          author: "Твой любящий",
          style: "italic"
        },
        {
          type: "image",
          url: "/uploads/romantic-sunset.jpg",
          caption: "Помнишь этот закат? Мы смотрели на него вместе...",
          alt: "Романтический закат"
        },
        {
          type: "text",
          content: "Я хочу, чтобы ты знала: ты делаешь мой мир ярче каждый день. Твоя улыбка - это мое любимое произведение искусства, а твой смех - самая прекрасная мелодия.",
          style: "normal"
        },
        {
          type: "gallery",
          images: [
            {
              url: "/uploads/memory-1.jpg",
              caption: "Наша первая прогулка в парке",
              alt: "Прогулка в парке"
            },
            {
              url: "/uploads/memory-2.jpg",
              caption: "Тот день, когда мы готовили вместе",
              alt: "Готовим вместе"
            },
            {
              url: "/uploads/memory-3.jpg",
              caption: "Наш поход в музей",
              alt: "В музее"
            }
          ],
          layout: "grid"
        },
        {
          type: "text",
          content: "Этот подарок - лишь маленькая часть того, как сильно я тебя ценю. Спасибо за то, что ты есть в моей жизни! ✨",
          style: "subtitle"
        },
        {
          type: "audio",
          url: "/uploads/our-song.mp3",
          caption: "Наша песня - послушай и вспомни тот вечер...",
          title: "Наша особенная мелодия"
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0"
      }
    };

    // Генерируем путь к файлу контента
    const contentPath = generateContentPath(giftRecord.id);
    
    // Сохраняем контент в файл
    const contentSaved = await saveGiftContent(contentPath, content);
    
    if (!contentSaved) {
      throw new Error("Не удалось сохранить контент подарка");
    }

    console.log(`📄 Контент сохранен в: ${contentPath}`);

    // Обновляем запись с правильным путем к контенту
    const updatedGift = await db.gift.update({
      where: { id: giftRecord.id },
      data: { contentPath: contentPath }
    });

    // Создаем полароидную фотографию для подарка
    const memoryPhoto = await db.memoryPhoto.create({
      data: {
        text: "@savdis", // никнейм на полароиде
        photoUrl: "/uploads/polaroid-memory.jpg", // URL оригинальной фотографии
        giftId: giftRecord.id
      }
    });

    console.log(`📸 Создана полароидная фотография с ID: ${memoryPhoto.id}`);
    console.log("🎉 Тестовый подарок создан успешно!");
    console.log(`📋 Детали подарка:`);
    console.log(`   ID: ${updatedGift.id}`);
    console.log(`   Номер: ${updatedGift.number}`);
    console.log(`   Название: ${updatedGift.title}`);
    console.log(`   Текст подсказки: "${updatedGift.hintText}"`);
    console.log(`   Код: ${updatedGift.code}`);
    console.log(`   URL: http://localhost:3000/gift/${updatedGift.id}`);

    return updatedGift;

  } catch (error) {
    console.error("❌ Ошибка при создании тестового подарка:", error);
    throw error;
  }
}

// Функция для создания секретного тестового подарка
async function createSecretTestGift() {
  console.log("🔒 Создаю секретный тестовый подарок...");
  
  try {
    const giftRecord = await db.gift.create({
      data: {
        number: Math.floor(Math.random() * 1000) + 1000,
        title: "Секретный подарок только для Леси",
        isSecret: true,
        openDate: new Date(),
        englishDescription: "Some secrets are meant to be shared only with you.",
        hintImageUrl: "/uploads/secret-hint.jpg",
        hintText: "этот подарок видишь только ты 💕",
        code: null,
        contentPath: ""
      }
    });

    const content: GiftContent = {
      blocks: [
        {
          type: "secret",
          content: [
            {
              type: "text",
              content: "Это наш маленький секрет... 🤫",
              style: "title"
            },
            {
              type: "text",
              content: "Только ты можешь видеть это сообщение. Здесь я хочу сказать тебе что-то особенное, что предназначено только для твоих глаз.",
              style: "normal"
            },
            {
              type: "quote",
              content: "Some secrets are meant to be shared only with you.",
              style: "italic"
            },
            {
              type: "text",
              content: "Ты - самый важный человек в моей жизни, и я хочу, чтобы у нас были особенные моменты, которые принадлежат только нам двоим. 💕",
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
      throw new Error("Не удалось сохранить секретный контент");
    }

    const updatedGift = await db.gift.update({
      where: { id: giftRecord.id },
      data: { contentPath: contentPath }
    });

    console.log("🔒 Секретный подарок создан!");
    console.log(`   ID: ${updatedGift.id}`);
    console.log(`   URL: http://localhost:3000/gift/${updatedGift.id}`);

    return updatedGift;

  } catch (error) {
    console.error("❌ Ошибка при создании секретного подарка:", error);
    throw error;
  }
}

async function main() {
  try {
    // Создаем обычный тестовый подарок
    const gift1 = await createTestGift();
    
    // Создаем секретный тестовый подарок
    const gift2 = await createSecretTestGift();
    
    console.log("\n🎊 Все тестовые подарки созданы успешно!");
    console.log("\n📋 Список созданных подарков:");
    console.log(`1. Обычный подарок: http://localhost:3000/gift/${gift1.id}`);
    console.log(`2. Секретный подарок: http://localhost:3000/gift/${gift2.id}`);
    
  } catch (error) {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✨ Готово! Можете тестировать подарки.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Критическая ошибка:", error);
    process.exit(1);
  }); 