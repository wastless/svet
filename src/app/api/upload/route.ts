import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { saveGiftFile } from "@/utils/lib/giftContent";
import path from "path";

export async function POST(request: NextRequest) {
  try {
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

    // Определяем подпапку в зависимости от типа файла
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

    // Сохраняем файл
    const url = await saveGiftFile(giftId, fileName, buffer, subfolder);

    return NextResponse.json({ 
      url,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 