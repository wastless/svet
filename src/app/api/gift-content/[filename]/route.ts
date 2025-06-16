import { NextResponse } from 'next/server';
import { loadGiftContent } from "@/utils/lib/giftContent";
import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // filename теперь это ID подарка
    const { filename } = await params;
    const giftId = filename;
    
    // Получаем подарок из базы данных, чтобы проверить contentUrl
    const gift = await db.gift.findUnique({
      where: { id: giftId }
    });
    
    if (!gift) {
      return NextResponse.json(
        { error: "Gift not found" },
        { status: 404 }
      );
    }
    
    // Если есть contentUrl, перенаправляем на него
    if (gift.contentUrl) {
      // Возвращаем редирект на contentUrl
      return NextResponse.redirect(gift.contentUrl);
    }
    
    // Иначе загружаем контент из локального хранилища
    const content = await loadGiftContent(giftId);

    if (!content) {
      return NextResponse.json(
        { error: "Gift content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error loading gift content:", error);
    return NextResponse.json(
      { error: "Failed to load gift content" },
      { status: 500 }
    );
  }
} 