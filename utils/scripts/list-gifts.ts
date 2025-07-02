import { db } from "../../src/server/db";

async function listAllGifts() {
  try {
    const gifts = await db.gift.findMany({
      orderBy: { number: 'asc' }
    });

    if (gifts.length === 0) {
      return;
    }

    gifts.forEach((gift, index) => {
      const now = new Date();
      const isAvailable = now >= gift.openDate;
    });

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

listAllGifts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 