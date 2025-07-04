import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadFileToYandexStorage } from "@/utils/lib/yandexStorage";
import path from "path";
import { env } from "../../../env.js";

// Настройка для обработки больших файлов
export const config = {
  api: {
    bodyParser: false, // Отключаем встроенный парсер тела запроса
    responseLimit: false, // Отключаем лимит размера ответа
  },
};

export async function POST(request: NextRequest) {
  try {
    // Увеличиваем таймаут для обработки больших файлов
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const giftId = formData.get("giftId") as string;
    const fileType = formData.get("fileType") as string; // "hint", "memory", "block"
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!giftId) {
      return NextResponse.json(
        { error: "Gift ID is required" },
        { status: 400 }
      );
    }

    // Получаем буфер файла
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Генерируем безопасное имя файла
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext);
    const safeFileName = `${baseName}_${timestamp}${ext}`;

    // Определяем имя файла и подпапку в зависимости от типа файла
    let subfolder: string | undefined;
    let fileName: string;

    switch (fileType) {
      case "hint":
        fileName = `hint-image${ext}`;
        subfolder = undefined; // Прямо в папке подарка
        break;
      case "memory":
        fileName = `memory-photo${ext}`;
        subfolder = undefined; // Прямо в папке подарка
        break;
      case "block":
        fileName = safeFileName;
        subfolder = "blocks"; // В подпапке blocks
        break;
      default:
        fileName = safeFileName;
        subfolder = "blocks"; // По умолчанию в blocks
        break;
    }

    // Проверяем, настроены ли ключи для Yandex Object Storage
    if (!env.YANDEX_ACCESS_KEY_ID || !env.YANDEX_SECRET_ACCESS_KEY || !env.YANDEX_BUCKET_NAME) {
      return NextResponse.json(
        { error: "Yandex Object Storage is not configured" },
        { status: 500 }
      );
    }

    try {
      // Используем только Yandex Object Storage
      const url = await uploadFileToYandexStorage(buffer, fileName, giftId, subfolder);
      console.log(`Файл ${fileName} успешно загружен в Yandex Object Storage: ${url}`);
      
      return NextResponse.json({ 
        url,
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      });
    } catch (error) {
      console.error(`Ошибка загрузки в Yandex Object Storage:`, error);
      return NextResponse.json(
        { error: "Failed to upload file to Yandex Object Storage" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 