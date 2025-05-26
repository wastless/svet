import { db } from "../src/server/db";

async function main() {
  console.log("🎁 Получаю ID созданных подарков...");
  
  const gifts = await db.gift.findMany({
    orderBy: { number: 'asc' }
  });

  gifts.forEach(gift => {
    console.log(`Подарок #${gift.number}: ${gift.title}`);
    console.log(`  ID: ${gift.id}`);
    console.log(`  URL: http://localhost:3000/gift/${gift.id}`);
    console.log(`  Секретный: ${gift.isSecret ? 'Да' : 'Нет'}`);
    console.log(`  Код: ${gift.code || 'Нет'}`);
    console.log(`  Дата открытия: ${gift.openDate.toLocaleDateString('ru-RU')}`);
    console.log('---');
  });
}

main(); 