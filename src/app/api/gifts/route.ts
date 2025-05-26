import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

interface CreateGiftRequest {
  title?: string | null;
  openDate: string;
  number: number;
  englishDescription: string;
  hintImageUrl: string;
  hintText?: string;
  contentPath: string;
  isSecret?: boolean;
  code?: string | null;
  memoryPhotoUrl?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateGiftRequest;
    const { title, openDate, number, englishDescription, hintImageUrl, hintText, contentPath, isSecret, code, memoryPhotoUrl } = body;

    // Валидация данных
    if (!openDate || !number || !englishDescription || !hintImageUrl || !contentPath) {
      return NextResponse.json(
        { error: "openDate, number, englishDescription, hintImageUrl, and contentPath are required" },
        { status: 400 }
      );
    }

    // Создаём подарок в базе данных
    const gift = await db.gift.create({
      data: {
        title,
        openDate: new Date(openDate),
        number,
        englishDescription,
        hintImageUrl,
        hintText: hintText ?? "look for a gift with this sticker",
        contentPath,
        isSecret: isSecret ?? false,
        code,
        memoryPhotoUrl,
      },
    });

    return NextResponse.json(gift, { status: 201 });
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
      orderBy: { openDate: "desc" },
      take: 10, // Ограничиваем количество для безопасности
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