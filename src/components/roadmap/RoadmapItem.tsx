"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { isGiftOpen } from "@/utils/hooks/gift-helpers";
import { GLImage } from "~/components/gl/GLImage";

// Типы пропсов компонента
interface RoadmapItemProps {
  id: string; // ID подарка для ссылки
  number: number;
  hintImageUrl: string;
  imageCover?: string; // Проп для оригинального изображения
  openDate: Date;
  title?: string;
}

export function RoadmapItem({ 
  id,
  number, 
  hintImageUrl, 
  imageCover,
  openDate,
  title
}: RoadmapItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Используем imageCover если он предоставлен, иначе используем hintImageUrl
  const coverImage = imageCover || hintImageUrl;
  
  useEffect(() => {
    // Проверяем, открыт ли подарок
    setIsOpen(isGiftOpen(openDate));
  }, [openDate]);
  
  // Для открытых подарков с изображением
  const OpenItemContent = () => (
    <div className="flex flex-col h-full justify-between">
      {/* Контейнер для изображения с фиксированной высотой */}
      <div className="relative w-full flex-grow">
        <div className="h-full flex items-start">
          <GLImage 
            imageUrl={coverImage}
            alt={title || `Roadmap item ${number}`}
          />
        </div>
      </div>
      
      {/* Номер элемента внизу для открытых подарков */}
      <div className="mt-4 flex justify-between items-center">
        <span className="font-styrene text-paragraph-md font-medium text-adaptive">
          {number < 10 ? `0${number}` : number}
        </span>
      </div>
    </div>
  );
  
  // Для закрытых подарков (пустой контейнер)
  const ClosedItemContent = () => (
    <div className="flex flex-col h-full">
      {/* Номер элемента сверху для закрытых подарков */}
      <div className="mb-4 flex justify-between items-center">
        <span className="font-styrene text-paragraph-md font-medium text-adaptive">
          {number < 10 ? `0${number}` : number}
        </span>
      </div>
      
      {/* Пустой контейнер */}
      <div 
        className="relative w-full flex-grow overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full">
          {/* Пустой контейнер для закрытого подарка */}
        </div>
      </div>
    </div>
  );
  
  // Если подарок открыт, оборачиваем в ссылку
  return isOpen ? (
    <Link href={`/gift/${id}`} className="block group cursor-pointer h-full">
      <OpenItemContent />
    </Link>
  ) : (
    <div className="block h-full">
      <ClosedItemContent />
    </div>
  );
} 