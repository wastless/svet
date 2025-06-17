"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { isGiftOpen } from "@/utils/hooks/gift-helpers";
import { GLImage } from "~/components/roadmap/GLImage";
import { useRouter } from "next/navigation";
import { useGifts } from "@/utils/hooks/useDateContext";
import { TargetDayIcon } from "~/components/ui/icons";

// Типы пропсов компонента
interface RoadmapItemProps {
  id: string; // ID подарка для ссылки
  number: number;
  hintImageUrl: string;
  imageCover?: string; // Проп для оригинального изображения
  openDate: Date;
  title?: string;
  isTargetDay?: boolean; // Флаг для выделения targetDay
}

// Внутренний компонент для отображения содержимого подарка
const GiftContent = memo(function GiftContent({
  id,
  number, 
  coverImage,
  isOpen,
  title,
  isTargetDay,
  onClick
}: {
  id: string;
  number: number;
  coverImage: string;
  isOpen: boolean;
  title?: string;
  isTargetDay?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Для открытых подарков с изображением
  const OpenItemContent = () => (
    <div className="flex flex-col justify-between">
      {/* Контейнер для изображения */}
      <div className="w-full overflow-visible">
        <GLImage 
          imageUrl={coverImage}
          alt={title || `Roadmap item ${number}`}
        />
      </div>
      
      {/* Номер элемента внизу для открытых подарков */}
      <div className="mt-2 flex justify-between items-center relative">
        <div className="relative">
          {isTargetDay && (
            <div className="absolute z-40" style={{ transform: 'translate(-8px, -4px)' }}>
              <TargetDayIcon className="absolute z-30 left-0" />
            </div>
          )}
          <span className="font-styrene text-paragraph-md font-medium text-adaptive relative z-20">
            {isTargetDay ? "DAY X" : (number < 10 ? `0${number}` : number)}
          </span>
        </div>
      </div>
    </div>
  );
  
  // Для закрытых подарков (пустой контейнер)
  const ClosedItemContent = () => (
    <div className="flex flex-col">
      {/* Номер элемента сверху для закрытых подарков */}
      <div className="mt-1 flex justify-between items-center">
        <div className="relative">
          {isTargetDay && (
            <div className="absolute z-40" style={{ transform: 'translate(-8px, -4px)' }}>
              <TargetDayIcon className="absolute z-30 left-0" />
            </div>
          )}
          <span className="font-styrene text-paragraph-md font-medium text-adaptive relative z-20">
            {isTargetDay ? "DAY X" : (number < 10 ? `0${number}` : number)}
          </span>
        </div>
      </div>
      
      {/* Пустой контейнер */}
      <div 
        className="relative w-full pb-[100%] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0"></div>
      </div>
    </div>
  );
  
  return (
    <div 
      className={`block h-full ${isOpen ? 'cursor-pointer' : ''} relative`}
      onClick={onClick}
    >
      {isOpen ? <OpenItemContent /> : <ClosedItemContent />}
    </div>
  );
});

function RoadmapItemComponent({ 
  id,
  number, 
  hintImageUrl, 
  imageCover,
  openDate,
  title,
  isTargetDay = false
}: RoadmapItemProps) {
  const router = useRouter();
  const { giftsDate } = useGifts();
  
  // Используем imageCover если он предоставлен и не пустой, иначе используем hintImageUrl
  // Для закрытых подарков изображение не будет использоваться
  const coverImage = imageCover && imageCover !== "" ? imageCover : hintImageUrl;
  
  // Мемоизируем состояние открытия подарка, чтобы избежать лишних перерисовок
  const isOpen = useMemo(() => {
    if (!giftsDate || !openDate) return false;
    
    // Используем полное сравнение дат с учетом времени, а не только дату
    const dateObj = new Date(openDate);
    return giftsDate >= dateObj;
  }, [openDate, giftsDate]);
  
  // Обработчик клика на открытый подарок
  const handleItemClick = (e: React.MouseEvent) => {
    if (isOpen) {
      e.stopPropagation(); // Предотвращаем всплытие события
      router.push(`/gift/${id}`);
    }
  };
  
  // Рендерим мемоизированный компонент содержимого
  return (
    <GiftContent
      id={id}
      number={number}
      coverImage={coverImage}
      isOpen={isOpen}
      title={title}
      isTargetDay={isTargetDay}
      onClick={handleItemClick}
    />
  );
}

// Мемоизируем компонент для предотвращения ненужных перерисовок
export const RoadmapItem = memo(RoadmapItemComponent); 