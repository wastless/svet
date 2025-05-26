import { createExampleGift, createSecretGift } from "../src/lib/seedGift";

async function main() {
  console.log("🎁 Создаю примеры подарков...");
  
  try {
    // Создаем обычный подарок
    const gift1 = await createExampleGift();
    console.log(`✅ Создан подарок #${gift1.number}: ${gift1.title}`);
    
    // Создаем секретный подарок
    const gift2 = await createSecretGift();
    console.log(`✅ Создан секретный подарок #${gift2.number}: ${gift2.title}`);
    
    console.log("🎉 Все подарки созданы успешно!");
  } catch (error) {
    console.error("❌ Ошибка при создании подарков:", error);
    process.exit(1);
  }
}

main(); 