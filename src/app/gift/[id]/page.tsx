import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import * as Button from "~/components/ui/button";
import { loadGiftContent } from "@/utils/lib/giftContent";
import { PolaroidPhoto } from "~/components/gallery/polaroid-photo";
import { GiftContentRenderer } from "~/components/gift-blocks";
import type { MemoryPhoto, Gift } from "@/utils/types/gift";
import { NoiseBackground } from "~/components/home/NoiseBackground";

interface GiftPageProps {
  params: { id: string };
}

// Расширяем тип Gift для совместимости с данными из БД
interface DBGift extends Omit<Gift, 'codeText'> {
  codeText: string | null;
}

// Расширяем тип MemoryPhoto для совместимости с данными из БД
interface DBMemoryPhoto extends Omit<MemoryPhoto, 'gift'> {
  gift?: DBGift;
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { id } = await params;

  // Проверяем авторизацию пользователя
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Получаем данные подарка из базы данных
  const gift = await db.gift.findUnique({
    where: { id },
    include: {
      memoryPhoto: {
        include: {
          // Включаем данные подарка в memoryPhoto, чтобы иметь доступ к nickname
          gift: true,
        }
      },
    },
  }) as unknown as DBGift & { memoryPhoto: DBMemoryPhoto | null };

  // Если подарок не найден, показываем 404
  if (!gift) {
    notFound();
  }

  const now = new Date();
  const isAvailable = now >= gift.openDate;

  // Если подарок ещё не доступен
  {/* if (!isAvailable) {
    return (
      <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-black">
        <NoiseBackground opacity={25} />
        <div className="text-center z-20 relative">
          <h1 className="mb-5 text-title-h3 uppercase font-founders text-white">
            Shhh... (noise)
          </h1>
          <p className="text-white text-paragraph-md font-styrene">
            This gift will be available on: {gift.openDate.toLocaleDateString("ru-RU")}
          </p>
        </div>
      </div>
    );
  }*/}

  // Загружаем контент поздравления
  const content = await loadGiftContent(gift.contentPath);

  if (!content) {
    notFound();
  }

  // Преобразуем gift в тип, совместимый с ожидаемым типом Gift
  const typedGift: Gift = {
    ...gift,
    codeText: gift.codeText || "", // Преобразуем null в пустую строку
  };

  // Преобразуем memoryPhoto в правильный тип, если оно существует
  const typedMemoryPhoto: MemoryPhoto | undefined = gift.memoryPhoto 
    ? {
        ...gift.memoryPhoto,
        gift: typedGift,
      }
    : undefined;

  // Если подарок доступен, показываем его содержимое
  return (
    <div className="min-h-screen bg-white text-adaptive">
      <div className="flex flex-col gap-2 py-24 text-center font-founders">
        <h1 className="text-title-h4">
          YOUR GIFT <br /> OF THE DAY
        </h1>
        <div className="text-title-h5">({gift.number})</div>
      </div>

      <div className="flex flex-col items-center justify-center gap-8">
        <div className="text-center font-nyghtserif text-label-lg italic">
          „{gift.englishDescription}“
        </div>

        <div className="mx-auto flex max-w-[320px] flex-col items-center gap-6">
          <div className="w-full aspect-square rounded-2xl overflow-hidden">
            <img
              src={gift.hintImageUrl}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="font-styrene text-paragraph-md font-bold uppercase text-center">
            {gift.hintText}
          </p>
        </div>
      </div>

      {/* Секретный код (если есть) - только для авторизованных пользователей */}
      {gift.code && isAuthenticated && (
        <div className="pt-24 flex flex-col items-center gap-5 text-center">
          <p className="mx-auto max-w-[440px] font-styrene text-paragraph-md font-bold uppercase">
          {gift.codeText}
          </p>
          <div className="font-founders text-title-h4 uppercase">
            {gift.code}
          </div>
        </div>
      )}

      {/* Заглушка для неавторизованных пользователей */}
      {gift.code && !isAuthenticated && (
        <div className="pt-24 flex flex-col items-center gap-5 text-center">
          <p className="mx-auto max-w-[440px] font-styrene text-paragraph-md font-bold uppercase">
            {gift.codeText}
          </p>
          <div className="font-founders text-title-h4 uppercase text-bg-strong-950 bg-bg-strong-950 select-none px-4">
            SECRET CODE
          </div>
        </div>
      )}

      <span className="text-label-xl my-20 flex items-center justify-center font-nyghtserif">
        ***
      </span>

      {/* Контент поздравления */}
      <div className="py-16 text-adaptive bg-bg-strong-950 dark-container ">
        <div className="mx-auto max-w-4xl ">
          {gift.isSecret && !isAuthenticated ? (
            <div className="text-center">
              <p className="text-adaptive text-title-h3 font-founders uppercase max-w-[460px] mx-auto">
                Oops, only Lesya sees this content
              </p>
            </div>
          ) : (
            /* Рендер блоков контента*/
            <GiftContentRenderer
              content={content}
              memoryPhoto={typedMemoryPhoto}
              className="max-w-none"
              gift={typedGift}
            />
          )}
        </div>
      </div>

      {/* Memory unlock секция */}
      <div className="text-adaptive dark-container bg-bg-strong-950 pt-20 pb-28 text-center flex flex-col items-center gap-10">
        <span className="text-adaptive text-label-xl font-nyghtserif">
          ***
        </span>
        <h2 className="text-adaptive text-title-h4 font-founders">
          THE MEMORY <br /> IS UNLOCKED
        </h2>
        
        {typedMemoryPhoto && (
          <Link href="/gallery" className="mx-auto cursor-pointer transition-all">
            <PolaroidPhoto
              memoryPhoto={typedMemoryPhoto}
              isRevealed={true}
              openDate={gift.openDate}
              size="medium"
            />
          </Link>
        )}
        
        <Link href="/gallery">
          <Button.Root >to the gallery</Button.Root>
        </Link>
      </div>
    </div>
  );
}
