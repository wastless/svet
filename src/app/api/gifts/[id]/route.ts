import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { saveGiftContent, generateContentPath, deleteGiftDir } from "@/utils/lib/giftContent";
import { deleteGiftFilesFromYandexStorage } from "@/utils/lib/yandexStorage";
import { env } from "../../../../env.js";

interface UpdateGiftRequest {
  title?: string | null;
  author?: string;
  nickname?: string;
  openDate?: string;
  number?: number;
  englishDescription?: string;
  hintImageUrl?: string;
  imageCover?: string;
  hintText?: string;
  codeText?: string;
  code?: string | null;
  isSecret?: boolean;
  content?: any;
  memoryPhoto?: {
    photoUrl: string;
    photoDate?: string | null;
  } | null;
  contentUrl?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const gift = await db.gift.findUnique({
      where: { id },
      include: {
        memoryPhoto: {
          include: {
            gift: true,
          }
        },
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json() as UpdateGiftRequest;
    const { 
      title,
      author,
      nickname, 
      openDate, 
      number, 
      englishDescription, 
      hintImageUrl, 
      imageCover,
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

    // Проверяем уникальность номера, если он изменился
    if (number !== undefined && number !== existingGift.number) {
      const giftWithSameNumber = await db.gift.findFirst({
        where: { 
          number,
          id: {
            not: id
          }
        }
      });

      if (giftWithSameNumber) {
        return NextResponse.json(
          { error: "Gift with this number already exists" },
          { status: 400 }
        );
      }
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
      
      // Если используется Yandex Object Storage, обновляем contentUrl
      if (env.YANDEX_ACCESS_KEY_ID && env.YANDEX_SECRET_ACCESS_KEY && env.YANDEX_BUCKET_NAME) {
        const contentUrl = `https://${env.YANDEX_BUCKET_NAME}.storage.yandexcloud.net/${id}_content.json`;
        // Добавляем contentUrl к данным для обновления
        body.contentUrl = contentUrl;
      }
    }

    // Обновляем основные данные подарка
    const updatedGift = await db.gift.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(author && { author }),
        ...(nickname && { nickname }),
        ...(openDate && { openDate: new Date(openDate) }),
        ...(number !== undefined && { number }),
        ...(englishDescription && { englishDescription }),
        ...(hintImageUrl && { hintImageUrl }),
        ...(imageCover !== undefined && { imageCover }),
        ...(hintText && { hintText }),
        ...(codeText && { codeText }),
        ...(code !== undefined && { code }),
        ...(isSecret !== undefined && { isSecret }),
        ...(body.contentUrl && { contentUrl: body.contentUrl }),
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
      } else if (memoryPhoto.photoUrl) {
        // Создаем или обновляем фотографию
        if (existingGift.memoryPhoto) {
          await db.memoryPhoto.update({
            where: { id: existingGift.memoryPhoto.id },
            data: {
              photoUrl: memoryPhoto.photoUrl,
              ...(memoryPhoto.photoDate !== undefined && { 
                photoDate: memoryPhoto.photoDate ? new Date(memoryPhoto.photoDate) : null 
              }),
            },
          });
        } else {
          await db.memoryPhoto.create({
            data: {
              photoUrl: memoryPhoto.photoUrl,
              giftId: id,
              ...(memoryPhoto.photoDate !== undefined && { 
                photoDate: memoryPhoto.photoDate ? new Date(memoryPhoto.photoDate) : null 
              }),
            },
          });
        }
      }
    }

    // Возвращаем обновленный подарок с новыми данными
    const finalGift = await db.gift.findUnique({
      where: { id },
      include: {
        memoryPhoto: {
          include: {
            gift: true,
          }
        },
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
  request: Request,
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

    // Удаляем файлы из Yandex Object Storage, если настроен
    if (env.YANDEX_ACCESS_KEY_ID && env.YANDEX_SECRET_ACCESS_KEY && env.YANDEX_BUCKET_NAME) {
      try {
        const deletedCount = await deleteGiftFilesFromYandexStorage(id);
        console.log(`Удалено ${deletedCount} файлов из Yandex Object Storage для подарка ${id}`);
      } catch (error) {
        console.error(`Ошибка удаления файлов из Yandex Object Storage для подарка ${id}:`, error);
        // Продолжаем выполнение, даже если не удалось удалить файлы из Object Storage
      }
    }

    // Удаляем локальную папку с файлами подарка
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