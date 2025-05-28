import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { saveGiftContent, generateContentPath, deleteGiftDir } from "@/utils/lib/giftContent";

interface UpdateGiftRequest {
  title?: string | null;
  openDate?: string;
  number?: number;
  englishDescription?: string;
  hintImageUrl?: string;
  hintText?: string;
  codeText?: string;
  code?: string | null;
  isSecret?: boolean;
  content?: any;
  memoryPhoto?: {
    text: string;
    photoUrl: string;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const gift = await db.gift.findUnique({
      where: { id },
      include: {
        memoryPhoto: true,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { error: "Gift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gift);
  } catch (error) {
    console.error("Error fetching gift:", error);
    return NextResponse.json(
      { error: "Failed to fetch gift" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json() as UpdateGiftRequest;
    const { 
      title, 
      openDate, 
      number, 
      englishDescription, 
      hintImageUrl, 
      hintText, 
      codeText,
      code, 
      isSecret,
      content,
      memoryPhoto 
    } = body;

    // Проверяем существование подарка
    const existingGift = await db.gift.findUnique({
      where: { id },
      include: { memoryPhoto: true },
    });

    if (!existingGift) {
      return NextResponse.json(
        { error: "Gift not found" },
        { status: 404 }
      );
    }

    // Сохраняем контент, если он передан
    if (content) {
      const success = await saveGiftContent(id, content);
      if (!success) {
        return NextResponse.json(
          { error: "Failed to save gift content" },
          { status: 500 }
        );
      }
    }

    // Обновляем основные данные подарка
    const updatedGift = await db.gift.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(openDate && { openDate: new Date(openDate) }),
        ...(number !== undefined && { number }),
        ...(englishDescription && { englishDescription }),
        ...(hintImageUrl && { hintImageUrl }),
        ...(hintText && { hintText }),
        ...(codeText && { codeText }),
        ...(code !== undefined && { code }),
        ...(isSecret !== undefined && { isSecret }),
      },
      include: {
        memoryPhoto: true,
      },
    });

    // Обрабатываем полароидную фотографию
    if (memoryPhoto !== undefined) {
      if (memoryPhoto === null) {
        // Удаляем существующую фотографию
        if (existingGift.memoryPhoto) {
          await db.memoryPhoto.delete({
            where: { id: existingGift.memoryPhoto.id },
          });
        }
      } else if (memoryPhoto.text || memoryPhoto.photoUrl) {
        // Создаем или обновляем фотографию
        if (existingGift.memoryPhoto) {
          await db.memoryPhoto.update({
            where: { id: existingGift.memoryPhoto.id },
            data: {
              text: memoryPhoto.text,
              photoUrl: memoryPhoto.photoUrl,
            },
          });
        } else {
          await db.memoryPhoto.create({
            data: {
              text: memoryPhoto.text,
              photoUrl: memoryPhoto.photoUrl,
              giftId: id,
            },
          });
        }
      }
    }

    // Возвращаем обновленный подарок с новыми данными
    const finalGift = await db.gift.findUnique({
      where: { id },
      include: {
        memoryPhoto: true,
      },
    });

    return NextResponse.json(finalGift);
  } catch (error) {
    console.error("Error updating gift:", error);
    return NextResponse.json(
      { error: "Failed to update gift" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    // Проверяем существование подарка
    const existingGift = await db.gift.findUnique({
      where: { id },
      include: { memoryPhoto: true },
    });

    if (!existingGift) {
      return NextResponse.json(
        { error: "Gift not found" },
        { status: 404 }
      );
    }

    // Удаляем подарок из базы данных (каскадное удаление автоматически удалит связанную фотографию)
    await db.gift.delete({
      where: { id },
    });

    // Удаляем папку с файлами подарка
    await deleteGiftDir(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gift:", error);
    return NextResponse.json(
      { error: "Failed to delete gift" },
      { status: 500 }
    );
  }
} 