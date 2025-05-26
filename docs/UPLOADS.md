# Загрузка изображений

## Структура папок

Все изображения для подарков хранятся в папке `/public/uploads/`. Эта папка доступна по URL `/uploads/` в браузере.

## Как загрузить изображения

### Способ 1: Через веб-интерфейс (рекомендуется)

1. Перейдите на страницу `/admin/upload`
2. Выберите изображение (поддерживаются форматы: JPEG, PNG, GIF, WebP)
3. Нажмите "Upload Image"
4. Скопируйте полученный URL и используйте его в данных подарка

### Способ 2: Через API

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@path/to/your/image.jpg"
```

Ответ:
```json
{
  "message": "File uploaded successfully",
  "url": "/uploads/1234567890_image.jpg",
  "fileName": "1234567890_image.jpg"
}
```

### Способ 3: Ручная загрузка

1. Скопируйте файлы напрямую в папку `/public/uploads/`
2. Используйте путь `/uploads/filename.jpg` в данных подарка

## Ограничения

- **Максимальный размер файла**: 5MB
- **Поддерживаемые форматы**: JPEG, JPG, PNG, GIF, WebP
- **Имена файлов**: автоматически добавляется timestamp для уникальности

## Использование в подарках

После загрузки изображения используйте полученный URL в следующих местах:

### В базе данных подарка:
```sql
UPDATE gifts SET 
  hintImageUrl = '/uploads/your-image.jpg',
  memoryPhotoUrl = '/uploads/memory-image.jpg'
WHERE id = 'gift-id';
```

### В JSON контенте подарка:
```json
{
  "type": "image",
  "url": "/uploads/your-image.jpg",
  "caption": "Описание изображения",
  "alt": "Альтернативный текст"
}
```

### В галерее:
```json
{
  "type": "gallery",
  "images": [
    {
      "url": "/uploads/gallery-1.jpg",
      "caption": "Первое фото",
      "alt": "Описание первого фото"
    },
    {
      "url": "/uploads/gallery-2.jpg", 
      "caption": "Второе фото",
      "alt": "Описание второго фото"
    }
  ],
  "layout": "grid"
}
```

## Примеры путей

- Изображение-подсказка: `/uploads/secret-hint.jpg`
- Фото памяти: `/uploads/memory-unlock.jpg`
- Галерея: `/uploads/gallery-1.jpg`, `/uploads/gallery-2.jpg`
- Аудио файлы: `/uploads/our-song.mp3`

## Безопасность

- Все загруженные файлы проверяются на тип и размер
- Имена файлов очищаются от небезопасных символов
- Добавляется timestamp для предотвращения конфликтов имен 