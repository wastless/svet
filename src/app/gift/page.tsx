import Link from "next/link";
import * as Button from "~/components/ui/button";
import { db } from "~/server/db";
import { RoadmapGrid } from "~/components/roadmap/RoadmapGrid";
import type { Gift } from "@prisma/client";

export default async function GiftPage() {
  // Получаем все подарки из базы данных, сортировка по номеру
  const gifts = await db.gift.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <div className="relative bg-bg-white-0">
      <main className="min-h-screen bg-adaptive">
        {/* Заголовок в верхней части */}
        <div className="flex justify-center pt-24 md:pt-20 lg:pt-24 mb-8 md:mb-16">
          <h4 className="text-center font-founders text-title-h4 uppercase text-adaptive">
          gift roadmap
          </h4>
        </div>

        {/* Основной контент - сетка с подарками */}
        <div className="pb-6">
          <RoadmapGrid gifts={gifts} />
        </div>

        {/* Нижний текст */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-28 text-center px-4">
          <span className="font-nyghtserif text-label-xl">***</span>
          <h2 className="font-founders text-title-h4 md:text-title-h3 uppercase">
          To feel the  <br />
          sunlight
          </h2>

          <Link href="/">
            <Button.Root>go home</Button.Root>
          </Link>
        </div>
      </main>
    </div>
  );
}
