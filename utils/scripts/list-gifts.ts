import { db } from "../../src/server/db";

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