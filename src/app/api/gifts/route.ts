import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { saveGiftContent, generateContentPath } from "@/utils/lib/giftContent";

interface CreateGiftRequest {
  title?: string | null;
  author?: string | null;
  nickname?: string | null;
  openDate: string;
  number: number;
  englishDescription: string;
  hintImageUrl: string;
  hintText?: string;
  imageCover?: string;
  codeText?: string;
  isSecret?: boolean;
  code?: string | null;
  content?: any;
  memoryPhoto?: {
    photoUrl: string;
  } | null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateGiftRequest;
    const { 
      title, 
      author,
      nickname,
      openDate, 
      number, 
      englishDescription, 
      hintImageUrl, 
      hintText, 
      imageCover,
      codeText,
      isSecret, 
      code, 
      content,
      memoryPhoto 
    } = body;

    // Валидация данных - hintImageUrl теперь необязательное
    if (!openDate || !number || !englishDescription) {
      return NextResponse.json(
        { error: "openDate, number, and englishDescription are required" },
        { status: 400 }
      );
    }

    // Проверяем уникальность номера
    const existingGift = await db.gift.findUnique({
      where: { number },
    });

    if (existingGift) {
      return NextResponse.json(
        { error: "Gift with this number already exists" },
        { status: 400 }
      );
    }

    // Генерируем временный путь для контента
    const tempContentPath = await generateContentPath(Math.random().toString(36).substring(7));

    // Создаём подарок в базе данных
    const gift = await db.gift.create({
      data: {
        title,
        author: author || "",
        nickname: nickname || "",
        openDate: new Date(openDate),
        number,
        englishDescription,
        hintImageUrl: hintImageUrl || "",
        imageCover: imageCover || null,
        hintText: hintText ?? "look for a gift with this sticker",
        codeText: codeText ?? "This is the part of your cipher. Collect them all to reveal the last secret",
        contentPath: tempContentPath,
        isSecret: isSecret ?? false,
        code,
      },
    });

    // Обновляем путь к контенту с использованием реального ID
    const contentPath = await generateContentPath(gift.id);
    await db.gift.update({
      where: { id: gift.id },
      data: { contentPath },
    });

    // Сохраняем контент подарка, если он есть
    if (content) {
      const success = await saveGiftContent(gift.id, content);
      if (!success) {
        // Если не удалось сохранить контент, удаляем подарок
        await db.gift.delete({ where: { id: gift.id } });
        return NextResponse.json(
          { error: "Failed to save gift content" },
          { status: 500 }
        );
      }
    } else {
      // Создаем пустой контент по умолчанию
      const defaultContent = {
        blocks: [],
        metadata: {
          senderName: "",
          description: "С днем рождения!",
        },
      };
      await saveGiftContent(gift.id, defaultContent);
    }

    // Создаем полароидную фотографию, если данные переданы
    if (memoryPhoto?.photoUrl) {
      await db.memoryPhoto.create({
        data: {
          photoUrl: memoryPhoto.photoUrl,
          giftId: gift.id,
        },
      });
    }

    // Получаем финальный подарок со всеми связанными данными
    const finalGift = await db.gift.findUnique({
      where: { id: gift.id },
      include: {
        memoryPhoto: {
          include: {
            gift: true,
          }
        },
      },
    });

    return NextResponse.json(finalGift, { status: 201 });
  } catch (error) {
    console.error("Error creating gift:", error);
    return NextResponse.json(
      { error: "Failed to create gift" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const gifts = await db.gift.findMany({
      include: {
        memoryPhoto: {
          include: {
            gift: true,
          }
        },
      },
      orderBy: { openDate: "desc" },
    });

    return NextResponse.json(gifts);
  } catch (error) {
    console.error("Error fetching gifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch gifts" },
      { status: 500 }
    );
  }
} 