import { NextResponse } from 'next/server';
import { loadGiftContent } from "@/utils/lib/giftContent";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // filename теперь это ID подарка
    const { filename } = params;
    const giftId = filename;
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