import Link from "next/link";
import * as Button from "~/components/ui/button";
import { db } from "~/server/db";
import { RoadmapGrid } from "~/components/roadmap";
import type { Gift } from "@prisma/client";

export default async function GiftPage() {
  // Получаем все подарки из базы данных, сортировка по номеру
  const gifts = await db.gift.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <div className="relative bg-bg-white-0">
      <main className="min-h-screen bg-adaptive pb-12">
        {/* Заголовок в верхней части */}
        <div className="flex justify-center pt-[100px] mb-10">
          <h4 className="text-center font-founders text-title-h4 uppercase text-adaptive">
          gift roadmap
          </h4>
        </div>

        {/* Основной контент - сетка с подарками */}
        <div className="px-8">
          <RoadmapGrid gifts={gifts} />
        </div>

        {/* Нижний текст */}
        <div className="flex flex-col items-center gap-8 bg-bg-white-0 py-20 text-center text-adaptive">
          <span className="font-nyghtserif text-label-xl">***</span>
          <h2 className="font-founders text-title-h3 uppercase">
          To feel the  <br />
          sunlight
          </h2>

          <Link href="/">
            <Button.Root>to the home</Button.Root>
          </Link>
        </div>
      </main>
    </div>
  );
}
