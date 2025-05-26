import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import * as Button from "~/components/ui/button";
import { loadGiftContent } from "~/lib/giftContent";
import { PolaroidPhoto } from "~/components/polaroid-photo";
import type { TextBlock, QuoteBlock, SecretBlock } from "~/types/gift";

interface GiftPageProps {
  params: { id: string };
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { id } = params;

  // Проверяем авторизацию пользователя
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Получаем данные подарка из базы данных
  const gift = await db.gift.findUnique({
    where: { id },
    include: {
      memoryPhoto: true,
    },
  });

  // Если подарок не найден, показываем 404
  if (!gift) {
    notFound();
  }

  const now = new Date();
  const isAvailable = now >= gift.openDate;

  // Если подарок ещё не доступен
  if (!isAvailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            Подарок ещё не доступен
          </h1>
          <p className="text-gray-600">
            Этот подарок откроется: {gift.openDate.toLocaleDateString("ru-RU")}
          </p>
        </div>
      </div>
    );
  }

  // Загружаем контент поздравления
  const content = await loadGiftContent(gift.contentPath);

  if (!content) {
    notFound();
  }

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
          <img
            src={gift.hintImageUrl}
            className="rounded-2xl"
          />
          <p className="font-styrene text-paragraph-md-bold uppercase text-center">
            {gift.hintText}
          </p>
        </div>
      </div>

      {/* Секретный код (если есть) */}
      {gift.code && (
        <div className="pt-24 flex flex-col items-center gap-5 text-center">
          <p className="mx-auto max-w-[440px] font-styrene text-paragraph-md-bold uppercase">
            This is the part of your cipher. Collect them all to reveal
            the last secret.
          </p>
          <div className="font-founders text-title-h4 uppercase">
            {gift.code}
          </div>
        </div>
      )}

      <span className="text-label-xl m-16 flex items-center justify-center font-nyghtserif">
        ***
      </span>

      {/* Контент поздравления */}
      <div className="py-16 text-adaptive bg-bg-strong-950 dark-container">
        <div className="mx-auto max-w-4xl px-4">
          {gift.isSecret && !isAuthenticated ? (
            <div className="text-center">
              <p className="text-title-h3 font-founders uppercase max-w-[460px] mx-auto">
                Oops, only Lesya sees this content
              </p>
            </div>
          ) : (
            /* Здесь будет рендер блоков контента */
            <div className="space-y-8">
              {content.blocks.map((block, index) => (
                <div key={index} className="text-center">
                  {/* Временная заглушка для блоков */}
                  <div className="rounded-lg bg-gray-100 p-6">
                    <p className="mb-2 text-sm text-gray-500">
                      Блок типа: {block.type}
                    </p>
                    {block.type === "text" && (
                      <p className="text-lg">{(block as TextBlock).content}</p>
                    )}
                    {block.type === "quote" && (
                      <blockquote className="text-xl italic">
                        &ldquo;{(block as QuoteBlock).content}&rdquo;
                      </blockquote>
                    )}
                    {block.type === "secret" && (
                      <p className="text-gray-600">
                        {(block as SecretBlock).accessMessage ??
                          "Oops, only Lesya sees this content"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Memory unlock секция */}
      <div className="dark-container bg-bg-strong-950 py-20 text-center text-adaptive flex flex-col items-center gap-12">
        <span className="text-label-xl font-nyghtserif">
          ***
        </span>
        <h2 className="text-title-h4 font-founders">
          THE MEMORY <br /> IS UNLOCKED
        </h2>
        
        {gift.memoryPhoto && (
          <Link href="/gallery" className="mx-auto cursor-pointer transition-all duration-500 ease-out rotate-1 hover:scale-105 hover:rotate-0 ">
            <PolaroidPhoto
              memoryPhoto={gift.memoryPhoto}
              isRevealed={true}
              openDate={gift.openDate}
              size="medium"
            />
          </Link>
        )}
        
        <Link href="/gallery">
          <Button.Root>to the gallery</Button.Root>
        </Link>
      </div>
    </div>
  );
}
