import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Получаем расширение файла
    const fileExtension = file.name.toLowerCase().split('.').pop() || '';
    
    // Проверяем тип файла по MIME type и расширению
    const allowedMimeTypes = [
      // Images
      "image/jpeg", 
      "image/jpg", 
      "image/png", 
      "image/gif", 
      "image/webp",
      "image/svg+xml",
      // Videos
      "video/mp4",
      // Audio
      "audio/mp3",
      "audio/mpeg", // MP3 альтернативный MIME type
      "audio/ogg",
    ];

    const allowedExtensions = [
      // Images
      "jpg", "jpeg", "png", "gif", "webp", "svg",
      // Videos  
      "mp4",
      // Audio
      "mp3", "ogg"
    ];
    
    const isMimeTypeValid = allowedMimeTypes.includes(file.type);
    const isExtensionValid = allowedExtensions.includes(fileExtension);
    
    // Для SVG файлов допускаем проверку по расширению, так как MIME type может варьироваться
    if (!isMimeTypeValid && !isExtensionValid) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: JPEG, PNG, GIF, WebP, SVG, MP4, MP3, OGG" },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${originalName}`;

    // Путь для сохранения файла
    const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);

    // Сохраняем файл
    await writeFile(uploadPath, buffer);

    // Возвращаем URL файла
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
      fileName: fileName,
      fileType: file.type,
      fileSize: file.size,
      fileExtension: fileExtension,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 