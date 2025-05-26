import Link from "next/link";
import { db } from "~/server/db";

export default async function GiftsPage() {
  // Получаем все подарки из базы данных
  const gifts = await db.gift.findMany({
    orderBy: { openDate: "desc" },
  });

  const now = new Date();

  return (
    <div className="min-h-screen bg-adaptive">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4">🎁</div>
          <h1 className="text-5xl font-bold text-adaptive mb-4">
            Все подарки
          </h1>
        </div>

        {/* Список подарков */}
        <div className="max-w-6xl mx-auto">
          {gifts.length === 0 ? (
            /* Пустое состояние */
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
              <div className="text-6xl mb-6">📦</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Пока нет подарков
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Создайте свой первый подарок и начните дарить радость!
              </p>

            </div>
          ) : (
            /* Сетка подарков */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gifts.map((gift) => {
                const isAvailable = now >= gift.openDate;
                const isPast = now > gift.openDate;
                const isFuture = now < gift.openDate;
                
                return (
                  <Link
                    key={gift.id}
                    href={`/gift/${gift.id}`}
                    className="group block"
                  >
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-2xl">
                      {/* Статус подарка */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isAvailable 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {isAvailable ? "🟢 Доступен" : "🟡 Ожидает"}
                        </div>
                        <div className="text-2xl">
                          {isAvailable ? "🎉" : "⏰"}
                        </div>
                      </div>

                      {/* Заголовок */}
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                        {gift.title || "Без названия"}
                      </h3>

                      {/* Дата открытия */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Дата открытия:</span>
                        </p>
                        <p className="text-gray-800 font-mono text-sm">
                          {gift.openDate.toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* ID подарка */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          ID: <span className="font-mono">{gift.id}</span>
                        </p>
                      </div>

                      {/* Время до открытия или с момента открытия */}
                      <div className="mt-3">
                        {isFuture && (
                          <p className="text-xs text-orange-600 font-medium">
                            ⏳ Откроется через: {Math.ceil((gift.openDate.getTime() - now.getTime()) / (1000 * 60))} мин
                          </p>
                        )}
                        {isPast && (
                          <p className="text-xs text-green-600 font-medium">
                            ✅ Открыт {Math.floor((now.getTime() - gift.openDate.getTime()) / (1000 * 60))} мин назад
                          </p>
                        )}
                      </div>

                      {/* Кнопка перехода */}
                      <div className="mt-4">
                        <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-700 group-hover:to-pink-700 text-white text-center py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium">
                          {isAvailable ? "🎁 Открыть подарок" : "👀 Посмотреть"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

