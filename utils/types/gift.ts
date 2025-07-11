// Основные типы для системы подарков

// Полароидная фотография
export interface MemoryPhoto {
  id: string;
  photoUrl: string; // URL оригинальной фотографии
  createdAt: Date;
  photoDate?: Date | null; // Дата создания фотографии (вводится пользователем)
  giftId: string;
  gift?: Gift; // связь с подарком для получения nickname
}

// Основная модель подарка (из базы данных)
export interface Gift {
  id: string;
  number: number; // номер подарка
  title?: string | null; // название подарка
  author?: string | null; // автор подарка
  nickname?: string | null; // никнейм (отображается на полароидной фотографии)
  isSecret: boolean; // публичность/конфиденциальность
  openDate: Date; // когда подарок становится доступен
  englishDescription: string; // английское описание
  hintImageUrl: string; // картинка-подсказка к физическому подарку
  imageOrientation: string; // ориентация изображения: "horizontal", "vertical", "square"
  imageCover?: string; // обложка подарка
  hintText: string; // текст подсказки
  codeText: string; // текст подсказки для кода
  code?: string | null; // секретный код (если есть)
  contentPath: string; // путь к файлу с контентом поздравления
  contentUrl?: string | null; // URL к файлу с контентом в облачном хранилище
  memoryPhoto?: MemoryPhoto | null; // связанная полароидная фотография
}

// Текстовый блок
export interface TextBlock {
  type: "text";
  content: string;
  heading?: string; // заголовок текстового блока
  style?: "title" | "subtitle" | "normal";
  alignment?: "left" | "center" | "right"; // выравнивание текста
}

// Цитата
export interface QuoteBlock {
  type: "quote";
  content: string;
  style?: "small" | "big";
}

// Блок-разделитель
export interface DividerBlock {
  type: "divider";
}

// Блок инфографики (большие цифры с текстом)
export interface InfoGraphicBlock {
  type: "infographic";
  items: Array<{
    number: string; // большая цифра
    text: string; // текст под цифрой
  }>;
  count: 1 | 2 | 3; // количество цифр (1, 2 или 3)
  alignment?: "left" | "center" | "right"; // выравнивание блока
}

// Блок с колонками текста
export interface TextColumnsBlock {
  type: "text-columns";
  items: Array<{
    title?: string; // заголовок колонки (опционально)
    text: string; // текст колонки
  }>;
  count: 1 | 2 | 3; // количество колонок (1, 2 или 3)
  alignment?: "left" | "center" | "right"; // выравнивание блока
}

// Блок с фотографией и текстом
export interface ImageBlock {
  type: "image";
  title?: string; // заголовок
  text?: string; // текст
  url: string; // фотография
  caption?: string; // подпись под фото
  layout?: "image-right" | "image-left" | "image-center"; // расположение фото
  size?: "small" | "medium" | "large"; // размер фото
  orientation?: "horizontal" | "vertical"; // ориентация фото
}

// Блок с двумя фотографиями
export interface TwoImagesBlock {
  type: "two-images";
  images: {
    url: string; // фотография
    title?: string; // заголовок для каждой фотографии
    text?: string; // описание для каждой фотографии
    caption?: string; // подпись под фото
    layout?: "text-top" | "text-bottom"; // расположение текста для каждой фотографии
  }[];
  size?: "small" | "medium" | "large"; // размер фото
  orientation?: "horizontal" | "vertical"; // ориентация фото
  description?: string; // общее описание для блока
  descriptionTitle?: string; // заголовок общего описания
  descriptionPosition?: "top" | "bottom"; // расположение общего описания (сверху или снизу)
}

// Блок с галереей изображений
export interface GalleryBlock {
  type: "gallery";
  title?: string; // заголовок галереи
  text?: string; // текст галереи
  images: {
    url: string; // URL изображения
    caption?: string; // подпись под изображением
  }[];
  columns?: 2 | 3; // количество колонок (автоматически определяется по количеству изображений)
}

// Блок с видеокружком
export interface VideoCircleBlock {
  type: "video-circle";
  title?: string; // заголовок
  text?: string; // текст
  url: string; // URL видео файла
  caption?: string; // подпись под видео
  size?: "small" | "medium" | "large"; // размер видеокружка
  autoplay?: boolean; // автовоспроизведение
  muted?: boolean; // отключить звук по умолчанию
  loop?: boolean; // зацикливание видео
}

// Блок с видео и текстом
export interface VideoBlock {
  type: "video";
  title?: string; // заголовок
  text?: string; // текст
  url: string; // видео
  caption?: string; // подпись под видео
  size?: "small" | "medium" | "large"; // размер видео
  orientation?: "horizontal" | "vertical"; // ориентация видео
  autoplay?: boolean; // автовоспроизведение
  muted?: boolean; // отключить звук по умолчанию
  loop?: boolean; // зацикливание видео
}

// Блок с двумя видео
export interface TwoVideosBlock {
  type: "two-videos";
  videos: {
    url: string; // видео
    title?: string; // заголовок для каждого видео
    text?: string; // описание для каждого видео
    caption?: string; // подпись под видео
    layout?: "text-top" | "text-bottom"; // расположение текста для каждого видео
    autoplay?: boolean; // автовоспроизведение
    muted?: boolean; // отключить звук по умолчанию
    loop?: boolean; // зацикливание видео
  }[];
  size?: "small" | "medium" | "large"; // размер видео
  orientation?: "horizontal" | "vertical"; // ориентация видео
}

// Блок с голосовым сообщением
export interface AudioMessageBlock {
  type: "audio-message";
  title?: string; // заголовок
  text?: string; // текст
  url: string; // URL аудио файла
  duration?: number; // длительность в секундах (опционально)
}

// Блок с музыкой
export interface MusicBlock {
  type: "music";
  id: string;
  url: string;
  artist: string;
  trackName: string;
  coverUrl?: string;
  title?: string;
  text?: string;
  duration?: number;
}

export type MusicGalleryBlock = {
  type: "musicGallery";
  id: string;
  title?: string;
  text?: string;
  tracks: Array<{
    id: string;
    url: string;
    artist: string;
    trackName: string;
    coverUrl?: string;
    duration?: number;
  }>;
};

// Объединенный тип блоков
export type GiftBlock = TextBlock | QuoteBlock | ImageBlock | TwoImagesBlock | VideoCircleBlock | VideoBlock | TwoVideosBlock | AudioMessageBlock | MusicBlock | MusicGalleryBlock | GalleryBlock | DividerBlock | InfoGraphicBlock | TextColumnsBlock;

// Основная структура контента подарка
export interface GiftContent {
  blocks: GiftBlock[];
  metadata?: {
    title?: string;
    description?: string;
    senderName?: string; // имя отправителя для базового блока
    createdAt?: string;
  };
} 