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
      console.log(`Сохранение контента для подарка ${id}...`);
      try {
        const success = await saveGiftContent(id, content);
        if (!success) {
          console.error(`Ошибка сохранения контента для подарка ${id}`);
          return NextResponse.json(
            { error: "Failed to save gift content" },
            { status: 500 }
          );
        }
        console.log(`Контент для подарка ${id} успешно сохранен`);
        
        // Если используется Yandex Object Storage, обновляем contentUrl
        if (env.YANDEX_ACCESS_KEY_ID && env.YANDEX_SECRET_ACCESS_KEY && env.YANDEX_BUCKET_NAME) {
          const contentUrl = `https://${env.YANDEX_BUCKET_NAME}.storage.yandexcloud.net/${id}_content.json`;
          // Добавляем contentUrl к данным для обновления
          body.contentUrl = contentUrl;
        }
      } catch (error) {
        console.error(`Ошибка при сохранении контента для подарка ${id}:`, error);
        return NextResponse.json(
          { error: `Failed to save gift content: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};
    
    // Добавляем только те поля, которые были переданы в запросе
    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (openDate !== undefined) updateData.openDate = new Date(openDate);
    if (number !== undefined) updateData.number = number;
    if (englishDescription !== undefined) updateData.englishDescription = englishDescription;
    if (hintImageUrl !== undefined) updateData.hintImageUrl = hintImageUrl;
    if (imageCover !== undefined) updateData.imageCover = imageCover;
    if (hintText !== undefined) updateData.hintText = hintText;
    if (codeText !== undefined) updateData.codeText = codeText;
    if (code !== undefined) updateData.code = code;
    if (isSecret !== undefined) updateData.isSecret = isSecret;
    if (body.contentUrl) updateData.contentUrl = body.contentUrl;
    
    // Если нет данных для обновления и нет контента, возвращаем ошибку
    if (Object.keys(updateData).length === 0 && !content && memoryPhoto === undefined) {
      return NextResponse.json(
        { error: "No data provided for update" },
        { status: 400 }
      );
    }

    // Обновляем основные данные подарка
    const updatedGift = await db.gift.update({
      where: { id },
      data: updateData,
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

    // Добавляем информацию о сохранении контента в ответ
    return NextResponse.json({
      ...finalGift,
      contentSaved: content ? true : undefined
    });
  } catch (error) {
    console.error("Error updating gift:", error);
    return NextResponse.json(
      { error: `Failed to update gift: ${error instanceof Error ? error.message : 'Unknown error'}` },
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

    // Удаляем локальные файлы подарка
    try {
      await deleteGiftDir(id);
    } catch (error) {
      console.error(`Ошибка удаления локальных файлов подарка ${id}:`, error);
      // Продолжаем выполнение, даже если не удалось удалить локальные файлы
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gift:", error);
    return NextResponse.json(
      { error: "Failed to delete gift" },
      { status: 500 }
    );
  }
} 