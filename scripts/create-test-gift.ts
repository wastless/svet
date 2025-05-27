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

    // Создаем богатый контент для подарка со всеми типами блоков
    const content: GiftContent = {
      blocks: [
        // 1. Базовый блок (автоматически создается через metadata.senderName)
        
        // 2. Текстовый блок - заголовок
        {
          type: "text",
          content: "Дорогая Леся, поздравляю тебя с днем рождения! 🎉",
          style: "title"
        },
        
        // 3. Цитата с полоской слева (small - шрифт styrene)
        {
          type: "quote",
          content: "Each memory has a soundtrack of its own",
          author: "Неизвестный автор",
          style: "normal" // small размер
        },
        
        // 4. Обычный текст
        {
          type: "text",
          content: "Этот подарок создан специально для тебя, чтобы напомнить о всех прекрасных моментах, которые мы разделили вместе. Каждая фотография, каждое слово здесь наполнено любовью и теплыми воспоминаниями.",
          style: "normal"
        },
        
        // 5. Блок с фотографией
        {
          type: "image",
          url: "/uploads/1748280744731_image.png",
          caption: "Особенный момент для особенного человека",
          alt: "Памятная фотография"
        },
        
        // 6. Блок с фотографией и текстом (заголовок и текст сверху, фото снизу)
        {
          type: "photo-with-text",
          title: "Наши незабываемые моменты",
          text: "Помнишь этот день? Мы смеялись до слез и делали самые безумные фотографии. Это было одно из тех мгновений, которые остаются в сердце навсегда.",
          photoUrl: "/uploads/1748280744731_image.png",
          caption: "Тот самый день, когда мы поняли, что дружба - это магия",
          alt: "Фото с друзьями"
        },
        
        // 7. Блок с фотографией и текстом сбоку (фото слева, текст справа)
        {
          type: "photo-text-side",
          photoUrl: "/uploads/1748280744731_image.png",
          caption: "Закат, который мы встретили вместе",
          title: "Вечер, который изменил все",
          text: "Иногда самые простые моменты становятся самыми важными. Этот закат мы встретили в полной тишине, просто наслаждаясь компанией друг друга и красотой мира вокруг.",
          photoPosition: "left",
          alt: "Закат на природе"
        },
        
        // 8. Блок с фотографией и текстом сбоку (фото справа, текст слева)
        {
          type: "photo-text-side",
          photoUrl: "/uploads/1748280744731_image.png",
          caption: "Наше маленькое приключение",
          title: "Когда мы решили быть спонтанными",
          text: "Помнишь, как мы внезапно решили поехать в тот маленький городок? Никаких планов, никаких карт - просто мы и дорога впереди. Это было одно из лучших решений в нашей жизни!",
          photoPosition: "right",
          alt: "Путешествие в неизвестность"
        },
        
        // 9. Блок с двумя фотографиями (фото снизу под заголовком и текстом)
        {
          type: "two-photos",
          title: "Два мира, одна дружба",
          text: "Мы такие разные, но именно это делает нашу дружбу особенной. Ты - творческая душа, я - практичный реалист. Вместе мы создаем идеальный баланс.",
          photo1: {
            url: "/uploads/1748280744731_image.png",
            caption: "Твой мир творчества",
            alt: "Леся за творчеством"
          },
          photo2: {
            url: "/uploads/1748280744731_image.png",
            caption: "Мой мир логики",
            alt: "Дима за работой"
          },
          photosPosition: "bottom"
        },
        
        // 10. Блок с двумя фотографиями (фото сверху над заголовком и текстом)
        {
          type: "two-photos",
          photo1: {
            url: "/uploads/1748280744731_image.png",
            caption: "Начало вечера",
            alt: "Подготовка к празднику"
          },
          photo2: {
            url: "/uploads/1748280744731_image.png",
            caption: "Кульминация праздника",
            alt: "Момент счастья"
          },
          title: "Как мы умеем праздновать!",
          text: "Каждый наш праздник - это маленький спектакль. От тщательной подготовки до безудержного веселья. Мы знаем толк в том, как создавать незабываемые моменты!",
          photosPosition: "top"
        },
        
        // 11. Цитата большого размера (big - шрифт nyghtserif)
        {
          type: "quote",
          content: "Дружба - это когда можно молчать вместе и чувствовать себя комфортно",
          author: "Мудрость жизни",
          style: "handwritten" // big размер
        },
        
        // 12. Галерея изображений
        {
          type: "gallery",
          images: [
            {
              url: "/uploads/1748280744731_image.png",
              caption: "Наши приключения",
              alt: "Фото воспоминание 1"
            },
            {
              url: "/uploads/1748280744731_image.png",
              caption: "Счастливые моменты",
              alt: "Фото воспоминание 2"
            },
            {
              url: "/uploads/1748280744731_image.png",
              caption: "Незабываемые дни",
              alt: "Фото воспоминание 3"
            }
          ],
          layout: "grid"
        },
        
        // 13. Заключительный текст
        {
          type: "text",
          content: "Помни: ты удивительная, талантливая и невероятно важная для всех, кто тебя знает. Пусть этот новый год жизни принесет тебе еще больше радости, смеха и волшебных моментов!",
          style: "subtitle"
        },
        
        // 14. Видео блок
        {
          type: "video",
          url: "/uploads/birthday-video.mp4",
          title: "Специальное видеопоздравление",
          caption: "Посмотри это особенное сообщение для тебя"
        },
        
        // 15. Аудио блок
        {
          type: "audio",
          url: "/uploads/birthday-song.mp3",
          title: "Твоя любимая песня",
          caption: "Музыка, которая всегда напоминает о тебе"
        },
        
        // 16. Секретный блок
        {
          type: "secret",
          content: "P.S. Настоящий подарок ждет тебя дома! Загляни под подушку 😉",
          accessMessage: "Секретное сообщение только для именинницы"
        }
      ],
      metadata: {
        title: "С днем рождения, Леся!",
        description: "Персональный подарок с любовью и всеми типами блоков",
        author: "Твой секретный поклонник",
        senderName: "Дима", // Это создаст базовый блок автоматически
        createdAt: new Date().toISOString()
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
        photoUrl: "/uploads/1748280744731_image.png", // URL оригинальной фотографии
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

async function main() {
  try {
    // Создаем обычный тестовый подарок
    const gift1 = await createTestGift();
    
    console.log("\n🎊 Все тестовые подарки созданы успешно!");
    console.log("\n📋 Список созданных подарков:");
    console.log(`1. Обычный подарок: http://localhost:3000/gift/${gift1.id}`);
    
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