// Типы блоков для контента поздравления
export type GiftBlock =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | QuoteBlock
  | GalleryBlock
  | SecretBlock;

// Блок с текстом
export type TextBlock = {
  type: "text";
  content: string;
  style?: "normal" | "title" | "subtitle"; // стили для разного оформления
};

// Блок с изображением
export type ImageBlock = {
  type: "image";
  url: string;
  caption?: string;
  alt?: string;
};

// Блок с видео
export type VideoBlock = {
  type: "video";
  url: string;
  caption?: string;
  thumbnail?: string; // превью для видео
};

// Блок с аудио
export type AudioBlock = {
  type: "audio";
  url: string;
  caption?: string;
  title?: string;
};

// Блок с цитатой
export type QuoteBlock = {
  type: "quote";
  content: string;
  author?: string;
  style?: "italic" | "bold" | "handwritten"; // разные стили цитат
};

// Блок с галереей изображений
export type GalleryBlock = {
  type: "gallery";
  images: Array<{
    url: string;
    caption?: string;
    alt?: string;
  }>;
  layout?: "grid" | "carousel" | "masonry"; // разные варианты отображения
};

// Секретный блок (скрытый контент)
export type SecretBlock = {
  type: "secret";
  content: GiftBlock[]; // может содержать любые другие блоки
  accessMessage?: string; // сообщение о том, что контент скрыт
};

// Основной тип для контента поздравления
export type GiftContent = {
  blocks: GiftBlock[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
};

// Тип для полароидной фотографии
export type MemoryPhoto = {
  id: string;
  text: string; // никнейм/подпись на полароиде
  photoUrl: string; // URL оригинальной фотографии
  createdAt: Date;
  giftId: string;
};

// Тип для полного объекта подарка (соответствует Prisma модели)
export type Gift = {
  id: string;
  number: number;
  title: string | null;
  isSecret: boolean;
  openDate: Date;
  englishDescription: string;
  hintImageUrl: string;
  hintText: string;
  code?: string | null;
  contentPath: string;
  memoryPhoto?: MemoryPhoto | null; // связь с полароидной фотографией
};

// Тип для подарка с загруженным контентом
export type GiftWithContent = Gift & {
  content: GiftContent;
}; 