"use client";

import { useState } from "react";
import { fetchYandexMusicMetadata, isYandexMusicUrl, type YandexMusicMetadata } from "~/utils/yandex-music";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Состояние для Яндекс.Музыки
  const [yandexUrl, setYandexUrl] = useState<string>("");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadata, setMetadata] = useState<YandexMusicMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string>("");
  const [debugData, setDebugData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setUploadedUrl("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadedUrl(result.url);
        setFile(null);
        // Очищаем input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleFetchMetadata = async () => {
    if (!yandexUrl.trim()) {
      setMetadataError("Введите ссылку на Яндекс.Музыку");
      return;
    }

    if (!isYandexMusicUrl(yandexUrl)) {
      setMetadataError("Неверный формат ссылки. Используйте ссылки вида: https://music.yandex.ru/album/123/track/456");
      return;
    }

    setFetchingMetadata(true);
    setMetadataError("");
    setMetadata(null);

    try {
      const result = await fetchYandexMusicMetadata(yandexUrl);
      if (result) {
        setMetadata(result);
      } else {
        setMetadataError("Не удалось получить метаданные. Проверьте ссылку и попробуйте снова.");
      }
    } catch (err) {
      setMetadataError("Ошибка при получении метаданных: " + (err as Error).message);
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleDebugMetadata = async () => {
    if (!yandexUrl.trim()) {
      setMetadataError("Введите ссылку на Яндекс.Музыку");
      return;
    }

    if (!isYandexMusicUrl(yandexUrl)) {
      setMetadataError("Неверный формат ссылки");
      return;
    }

    setFetchingMetadata(true);
    setMetadataError("");
    setDebugData(null);

    try {
      const response = await fetch('/api/yandex-music/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: yandexUrl }),
      });

      const result = await response.json();
      if (result.success) {
        setDebugData(result.debug);
        setShowDebug(true);
      } else {
        setMetadataError("Ошибка отладки: " + result.error);
      }
    } catch (err) {
      setMetadataError("Ошибка отладки: " + (err as Error).message);
    } finally {
      setFetchingMetadata(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyMetadataAsJson = () => {
    if (!metadata) return;
    
    const musicBlock = {
      type: "music",
      title: "Название блока (опционально)",
      text: "Описание (опционально)",
      url: "/audio/your-audio-file.mp3", // Нужно загрузить аудио файл отдельно
      coverUrl: metadata.coverUrl,
      artist: metadata.artist,
      trackName: metadata.trackName,
      duration: metadata.duration,
      yandexMusicUrl: yandexUrl
    };

    copyToClipboard(JSON.stringify(musicBlock, null, 2));
  };

  // Определяем тип файла для превью
  const getFileType = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    if (['mp4'].includes(extension || '')) {
      return 'video';
    }
    if (['mp3', 'ogg'].includes(extension || '')) {
      return 'audio';
    }
    return 'other';
  };

  const renderPreview = (url: string, fileName: string) => {
    const fileType = getFileType(fileName);
    const extension = fileName.toLowerCase().split('.').pop();

    switch (fileType) {
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={url}
              alt="Uploaded file"
              className="max-w-full h-auto max-h-64 rounded border"
              onError={(e) => {
                // Если изображение не загружается, показываем информацию о файле
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="p-4 bg-gray-100 rounded border text-center hidden">
              <p className="text-gray-600">Image file: {fileName}</p>
              <p className="text-sm text-gray-500">Type: {extension?.toUpperCase()}</p>
            </div>
          </div>
        );
      case 'video':
        return (
          <video
            src={url}
            controls
            className="max-w-full h-auto max-h-64 rounded border"
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            <audio
              src={url}
              controls
              className="w-full"
            >
              Your browser does not support the audio tag.
            </audio>
            <div className="p-3 bg-gray-50 rounded text-center">
              <p className="text-gray-600 font-medium">{fileName}</p>
              <p className="text-sm text-gray-500">Audio file • {extension?.toUpperCase()}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-gray-100 rounded border text-center">
            <p className="text-gray-600">File uploaded: {fileName}</p>
            <p className="text-sm text-gray-500">Type: {extension?.toUpperCase()}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Upload Media Files & Get Metadata</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Секция загрузки файлов */}
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📁 Upload Files</h2>
            
          <div className="mb-4">
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                Select Media File
            </label>
            <input
              id="file-input"
              type="file"
                accept="image/*,video/mp4,audio/mp3,audio/ogg,.svg"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {file && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {getFileType(file.name)}
                </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
              {uploading ? "Uploading..." : "Upload File"}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {uploadedUrl && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 font-medium mb-2">Upload successful!</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL:</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm">{uploadedUrl}</code>
                    <button
                      onClick={() => copyToClipboard(uploadedUrl)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview:</label>
                    {renderPreview(uploadedUrl, file?.name || '')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Секция Яндекс.Музыки */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎵 Yandex Music Metadata</h2>
            
            <div className="mb-4">
              <label htmlFor="yandex-url" className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка на Яндекс.Музыку
              </label>
              <input
                id="yandex-url"
                type="url"
                value={yandexUrl}
                onChange={(e) => setYandexUrl(e.target.value)}
                placeholder="https://music.yandex.ru/album/123/track/456"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Поддерживаются ссылки на треки Яндекс.Музыки
              </p>
            </div>

            <button
              onClick={handleFetchMetadata}
              disabled={!yandexUrl.trim() || fetchingMetadata}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-2"
            >
              {fetchingMetadata ? "Получение данных..." : "Получить метаданные"}
            </button>

            <button
              onClick={handleDebugMetadata}
              disabled={!yandexUrl.trim() || fetchingMetadata}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              🐛 Отладка HTML
            </button>

            {showDebug && debugData && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-yellow-800">Отладочная информация</h4>
                  <button
                    onClick={() => setShowDebug(false)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    ✕
                  </button>
                </div>
                <pre className="text-xs text-yellow-800 whitespace-pre-wrap">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </div>
            )}

            {metadataError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{metadataError}</p>
              </div>
            )}

            {metadata && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700 font-medium mb-3">Метаданные получены!</p>
                
                {/* Превью трека */}
                <div className="bg-white rounded-lg p-4 mb-4 border">
                  <div className="flex items-center gap-4">
                    <img
                      src={metadata.coverUrl}
                      alt={`${metadata.trackName} - ${metadata.artist}`}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-album-cover.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{metadata.trackName}</h3>
                      <p className="text-gray-600 truncate">{metadata.artist}</p>
                      {metadata.duration && (
                        <p className="text-sm text-gray-500">
                          Длительность: {Math.floor(metadata.duration / 60)}:{(metadata.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Данные для копирования */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Исполнитель:</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm">{metadata.artist}</code>
                      <button
                        onClick={() => copyToClipboard(metadata.artist)}
                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Название:</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm">{metadata.trackName}</code>
                      <button
                        onClick={() => copyToClipboard(metadata.trackName)}
                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Обложка:</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">{metadata.coverUrl}</code>
                      <button
                        onClick={() => copyToClipboard(metadata.coverUrl)}
                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <button
                      onClick={copyMetadataAsJson}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      📋 Скопировать JSON блок
                    </button>
                    <p className="mt-1 text-xs text-gray-500 text-center">
                      Скопирует готовый JSON блок для использования в подарке
                    </p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Информационная секция */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg bg-blue-50 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">📁 Supported File Types</h2>
            <div className="grid grid-cols-1 gap-4 text-blue-800 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Images:</h3>
                <ul className="space-y-1">
                  <li>• JPEG, JPG</li>
                  <li>• PNG</li>
                  <li>• GIF</li>
                  <li>• WebP</li>
                  <li>• SVG</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Media:</h3>
                <ul className="space-y-1">
                  <li>• MP4 (video)</li>
                  <li>• MP3 (audio)</li>
                  <li>• OGG (audio)</li>
          </ul>
              </div>
            </div>
            <div className="mt-4 text-blue-800 text-sm">
              <p>• Maximum file size: 10MB</p>
              <p>• Files will be saved to /public/uploads/</p>
            </div>
          </div>

          <div className="rounded-lg bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-3">🎵 Yandex Music Integration</h2>
            <div className="text-red-800 text-sm space-y-2">
              <p>• Автоматическое получение метаданных</p>
              <p>• Поддержка всех доменов Яндекс.Музыки</p>
              <p>• Извлечение обложек в высоком качестве</p>
              <p>• Готовые JSON блоки для копирования</p>
            </div>
            <div className="mt-4 p-3 bg-red-100 rounded text-red-800 text-xs">
              <p className="font-semibold">Примеры поддерживаемых ссылок:</p>
              <p>• music.yandex.ru/album/123/track/456</p>
              <p>• music.yandex.com/album/123/track/456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 