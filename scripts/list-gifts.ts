import { db } from "../src/server/db";

async function listAllGifts() {
  console.log("🎁 Список всех подарков в базе данных:\n");
  
  try {
    const gifts = await db.gift.findMany({
      orderBy: { number: 'asc' }
    });

    if (gifts.length === 0) {
      console.log("❌ Подарков не найдено");
      return;
    }

    gifts.forEach((gift, index) => {
      console.log(`${index + 1}. Подарок #${gift.number}`);
      console.log(`   📋 Название: ${gift.title || 'Без названия'}`);
      console.log(`   🆔 ID: ${gift.id}`);
      console.log(`   🔗 URL: http://localhost:3000/gift/${gift.id}`);
      console.log(`   📅 Дата открытия: ${gift.openDate.toLocaleString('ru-RU')}`);
      console.log(`   🌍 Английское описание: "${gift.englishDescription}"`);
      console.log(`   💬 Текст подсказки: "${gift.hintText}"`);
      console.log(`   🖼️ Картинка подсказки: ${gift.hintImageUrl}`);
      console.log(`   🔒 Секретный: ${gift.isSecret ? 'Да' : 'Нет'}`);
      console.log(`   🔑 Код: ${gift.code || 'Нет'}`);
      console.log(`   📄 Путь к контенту: ${gift.contentPath}`);
      console.log(`   📸 Фото памяти: ${gift.memoryPhotoUrl || 'Нет'}`);
      
      const now = new Date();
      const isAvailable = now >= gift.openDate;
      console.log(`   ⏰ Статус: ${isAvailable ? '✅ Доступен' : '⏳ Ожидает открытия'}`);
      
      console.log('   ' + '─'.repeat(50));
    });

    console.log(`\n📊 Всего подарков: ${gifts.length}`);
    console.log(`🔓 Доступных сейчас: ${gifts.filter(g => new Date() >= g.openDate).length}`);
    console.log(`🔒 Секретных: ${gifts.filter(g => g.isSecret).length}`);

  } catch (error) {
    console.error("❌ Ошибка при получении списка подарков:", error);
    process.exit(1);
  }
}

listAllGifts()
  .then(() => {
    console.log("\n✨ Готово!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Критическая ошибка:", error);
    process.exit(1);
  }); 