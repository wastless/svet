"use client";

import React, { useEffect, useState } from "react";
import type { Gift } from "@/utils/types/gift";

interface GiftListProps {
  gifts: Gift[];
  onCreateGift: () => void;
  onEditGift: (gift: Gift) => void;
  onDeleteGift: (giftId: string) => void;
}

export function GiftList({ 
  gifts, 
  onCreateGift, 
  onEditGift, 
  onDeleteGift 
}: GiftListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGifts = gifts.filter(gift => 
    gift.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.number.toString().includes(searchTerm) ||
    gift.englishDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Заголовок и кнопка создания */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Список подарков ({gifts.length})
          </h2>
          <button
            onClick={onCreateGift}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать подарок
          </button>
        </div>
      </div>

      {/* Поиск */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Поиск по названию, номеру или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Список подарков */}
      <div className="divide-y divide-gray-200">
        {filteredGifts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.414A2 2 0 0116.586 16H7.414A2 2 0 016 14.586V8a2 2 0 012-2V6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Подарки не найдены</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Попробуйте изменить поисковый запрос" : "Начните с создания первого подарка"}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={onCreateGift}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Создать первый подарок
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredGifts.map((gift) => (
            <div key={gift.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4">
                    {/* Номер подарка */}
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-indigo-600 rounded-full">
                        {gift.number}
                      </span>
                    </div>
                    
                    {/* Основная информация */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {gift.title || `Подарок #${gift.number}`}
                        </h3>
                        {gift.isSecret && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Секретный
                          </span>
                        )}
                        {gift.code && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Код: {gift.code}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-2">
                        {gift.englishDescription}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Открытие: {formatDate(gift.openDate)}</span>
                        {gift.memoryPhoto && (
                          <span className="inline-flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            Полароид
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Действия */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditGift(gift)}
                    className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Редактировать"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteGift(gift.id)}
                    className="inline-flex items-center p-2 border border-transparent rounded-md text-red-400 hover:text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 