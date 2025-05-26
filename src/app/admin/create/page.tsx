"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGiftPage() {
  const [title, setTitle] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [number, setNumber] = useState("");
  const [englishDescription, setEnglishDescription] = useState("");
  const [hintImageUrl, setHintImageUrl] = useState("");
  const [hintText, setHintText] = useState("look for a gift with this sticker");
  const [contentPath, setContentPath] = useState("");
  const [code, setCode] = useState("");
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          openDate: new Date(openDate).toISOString(),
          number: parseInt(number),
          englishDescription,
          hintImageUrl,
          hintText,
          contentPath,
          code: code || null,
          memoryPhotoUrl: memoryPhotoUrl || null,
          isSecret,
        }),
      });

      if (response.ok) {
        const gift = await response.json();
        router.push(`/gift/${gift.id}`);
      } else {
        const errorData = await response.json();
        alert(`Ошибка при создании подарка: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating gift:", error);
      alert("Ошибка при создании подарка");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для создания тестового подарка (доступен сейчас)
  const createTestGift = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      now.setMinutes(now.getMinutes() - 1); // Делаем доступным сейчас
      
      const response = await fetch("/api/gifts", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Тестовый подарок",
          openDate: now.toISOString(),
          number: Math.floor(Math.random() * 1000) + 1,
          englishDescription: "This is a test gift",
          hintImageUrl: "/test-hint.jpg",
          hintText: "найди подарок с этой наклейкой",
          contentPath: "/test-content.json",
          code: "TEST123",
          memoryPhotoUrl: "/test-memory.jpg",
          isSecret: false,
        }),
      });

      if (response.ok) {
        const gift = await response.json();
        router.push(`/gift/${gift.id}`);
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating test gift:", error);
      alert("Ошибка при создании тестового подарка");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для создания подарка, который откроется через минуту
  const createFutureGift = async () => {
    setIsLoading(true);
    try {
      const future = new Date();
      future.setMinutes(future.getMinutes() + 1);
      
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Подарок из будущего",
          openDate: future.toISOString(),
          number: Math.floor(Math.random() * 1000) + 1,
          englishDescription: "This gift will be available in the future",
          hintImageUrl: "/future-hint.jpg",
          hintText: "ищи подарок с этой картинкой",
          contentPath: "/future-content.json",
          code: "FUTURE",
          memoryPhotoUrl: "/future-memory.jpg",
          isSecret: false,
        }),
      });

      if (response.ok) {
        const gift = await response.json();
        router.push(`/gift/${gift.id}`);
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating future gift:", error);
      alert("Ошибка при создании подарка из будущего");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎁</div>
            <h1 className="text-3xl font-bold text-gray-800">
              Создать подарок
            </h1>
            <p className="text-gray-600 mt-2">
              Создайте особенный подарок для кого-то важного
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Название подарка
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="С Днём Рождения!"
                />
              </div>

              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                  Номер подарка *
                </label>
                <input
                  type="number"
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 mb-2">
                Дата и время открытия *
              </label>
              <input
                type="datetime-local"
                id="openDate"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="englishDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Английское описание *
              </label>
              <input
                type="text"
                id="englishDescription"
                value={englishDescription}
                onChange={(e) => setEnglishDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Each memory has a soundtrack of its own."
                required
              />
            </div>

            <div>
              <label htmlFor="hintImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL картинки-подсказки *
              </label>
              <input
                type="url"
                id="hintImageUrl"
                value={hintImageUrl}
                onChange={(e) => setHintImageUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="/uploads/hint-sticker.jpg"
                required
              />
            </div>

            <div>
              <label htmlFor="hintText" className="block text-sm font-medium text-gray-700 mb-2">
                Текст подсказки
              </label>
              <input
                type="text"
                id="hintText"
                value={hintText}
                onChange={(e) => setHintText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="look for a gift with this sticker"
              />
            </div>

            <div>
              <label htmlFor="contentPath" className="block text-sm font-medium text-gray-700 mb-2">
                Путь к контенту *
              </label>
              <input
                type="text"
                id="contentPath"
                value={contentPath}
                onChange={(e) => setContentPath(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="/content/gift-1.json"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Секретный код
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ABC123"
                />
              </div>

              <div>
                <label htmlFor="memoryPhotoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL фото памяти
                </label>
                <input
                  type="url"
                  id="memoryPhotoUrl"
                  value={memoryPhotoUrl}
                  onChange={(e) => setMemoryPhotoUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="/uploads/memory.jpg"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSecret"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isSecret" className="ml-2 block text-sm text-gray-700">
                Секретный подарок
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? "Создаём..." : "🎉 Создать подарок"}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                Быстрое тестирование
              </h3>
              
              <button
                onClick={createTestGift}
                disabled={isLoading}
                className="w-full mb-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                ✅ Создать доступный подарок
              </button>
              
              <button
                onClick={createFutureGift}
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                ⏰ Создать подарок на будущее
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 