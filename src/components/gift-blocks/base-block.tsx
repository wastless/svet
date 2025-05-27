"use client";

interface BaseBlockProps {
  name: string; 
  memoryPhotoText?: string; 
  text: string;
  className?: string;
}

export function BaseBlock({
  name,
  memoryPhotoText,
  text,
  className = "",
}: BaseBlockProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок с именем отправителя */}
      <div className="space-y-2">
        <div className="text-label-md font-nyghtserif italic text-adaptive tracking-wider">
          от <span>{name}</span>
          {memoryPhotoText && (
            <span className="text-text-soft-400"> ({memoryPhotoText})</span>
          )}
        </div>
      </div>

      {/* Основной текст поздравления */}
      <div className="text-paragraph-xl text-adaptive font-euclid">
        {text}
      </div>
    </div>
  );
} 