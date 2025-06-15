"use client";

import * as Button from "~/components/ui/button";
import * as Input from "~/components/ui/input-login";
import React, { useEffect, useState } from "react";
import type { Gift } from "@/utils/types/gift";
import Link from "next/link";

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
  onDeleteGift,
}: GiftListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGifts = gifts.filter(
    (gift) =>
      gift.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.number.toString().includes(searchTerm) ||
      gift.englishDescription.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return (
      d.toLocaleDateString("ru-RU") +
      " " +
      d.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <div className="bg-transparent rounded-lg">
      {/* Заголовок и кнопка создания */}
      <div className="border-b border-gray-200 py-4">
        <div className="flex items-center justify-between">
          <h2 className="font-styrene text-paragraph-lg font-bold uppercase text-text-strong-950">
            Список подарков ({gifts.length})
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Поиск"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ring-1 ring-neutral-200 rounded-8 bg-transparent py-2 pl-2 pr-3 leading-5 placeholder-neutral-400 font-styrene placeholder:font-medium placeholder:text-paragraph-sm placeholder:uppercase"
            />
            <Button.Root onClick={onCreateGift}>Создать подарок</Button.Root>
          </div>
        </div>
      </div>

      {/* Список подарков */}
      <div className="divide-y divide-gray-200">
        {filteredGifts.length === 0 ? (
          <div className="px-6 py-24 text-center">
            <h3 className="mt-2 text-paragraph-md font-bold text-text-strong-950 uppercase font-styrene">
              Подарки не найдены
            </h3>
            <p className="mt-2 text-paragraph-md font-styrene font-regular text-text-soft-400">
              {searchTerm
                ? "Попробуйте изменить поисковый запрос"
                : "Начните с создания первого подарка"}
            </p>
          </div>
        ) : (
          filteredGifts.map((gift) => (
            <div key={gift.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-4">

                    {/* Основная информация */}
                    <div className="min-w-0 flex-1 ">

                      <div className="mb-1 flex items-center space-x-2">
                        <h3 className="truncate text-paragraph-md font-styrene font-medium text-text-strong-950 uppercase">
                          {gift.title || `Подарок #${gift.number}`}
                        </h3>
                        {gift.isSecret && (
                          <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Секретный
                          </span>
                        )}
                        {gift.code && (
                          <span className="bg-blue-100 text-blue-800 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium">
                            Код: {gift.code}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center mt-2 space-x-4 text-paragraph-sm font-styrene text-neutral-300">
                        <span>Открытие: {formatDate(gift.openDate)}</span>
                        {gift.memoryPhoto && (
                          <span className="inline-flex items-center">
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
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
                    className="border-transparent focus:ring-indigo-500 inline-flex items-center rounded-md border p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    title="Редактировать"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteGift(gift.id)}
                    className="border-transparent inline-flex items-center rounded-md border p-2 text-red-400 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    title="Удалить"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
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
