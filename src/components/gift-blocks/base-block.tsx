"use client";

import React from "react";

interface BaseBlockProps {
  name: string; 
  nickname?: string;
  text: string;
  className?: string;
}

// Функция для склонения имени в родительный падеж
function declineName(name: string): string {
  // Самые распространенные женские имена
  const femaleEndings: Record<string, string> = {
    'а': 'и',   // Даша -> Даши, Маша -> Маши
    'я': 'и',   // Соня -> Сони, Катя -> Кати
    'ь': 'и',   // Любовь -> Любови
    'ия': 'и', // Мария -> Марии, Анастасия -> Анастасии
    'га': 'и', // Ольга -> Ольги
    'ка': 'и', // Вероника -> Вероники
    'ла': 'ы', // Мила -> Милы
    'на': 'ы', // Алёна -> Алёны, Яна -> Яны
  };
  
  // Имена, которые не меняются или имеют особые формы
  const specialNames: Record<string, string> = {
    'Павел': 'Павла',
    'Пётр': 'Петра',
    'Лев': 'Льва',
    'Николай': 'Николая',
    'Андрей': 'Андрея',
    'Сергей': 'Сергея',
    'Алексей': 'Алексея',
    'Евгений': 'Евгения',
    'Юрий': 'Юрия',
    'Дмитрий': 'Дмитрия',
  };
  
  // Проверка на особые случаи
  if (specialNames[name]) {
    return specialNames[name];
  }
  
  // Сначала проверяем более специфичные окончания, затем общие
  const orderedEndings = Object.entries(femaleEndings).sort(
    (a, b) => b[0].length - a[0].length
  );
  
  // Проверяем окончания женских имен
  for (const [ending, replacement] of orderedEndings) {
    if (name.endsWith(ending)) {
      // Для имен на "ия" нужно убрать 2 символа
      if (ending === 'ия') {
        return name.slice(0, -2) + replacement;
      }
      // Для остальных убираем последний символ
      return name.slice(0, -1) + replacement;
    }
  }
  
  // Для мужских имен, оканчивающихся на согласную, добавляем "а"
  if (/[бвгджзклмнпрстфхцчшщ]$/i.test(name)) {
    return name + 'а';
  }
  
  // Если не подошло ни одно правило, возвращаем исходное имя
  return name;
}

// Утилита для обработки текста с переносами строк и списками
export const processText = (text: string) => {
  if (!text) return null;
  
  // Разбиваем текст на строки
  const lines = text.split('\n');
  
  // Проходим по каждой строке и определяем, является ли она элементом списка
  return lines.map((line, index) => {
    // Проверяем, начинается ли строка с маркера списка (- или *)
    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
      // Удаляем маркер и начальные пробелы
      const listItemContent = line.trim().substring(1).trim();
      
      // Возвращаем элемент списка
      return (
        <li key={index} className="ml-5 list-disc">
          {listItemContent}
        </li>
      );
    }
    
    // Если это обычная строка, возвращаем ее с переносом строки
    return (
      <React.Fragment key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export function BaseBlock({
  name,
  nickname,
  text,
  className = "",
}: BaseBlockProps) {
  // Склоняем имя автора
  const declinedName = declineName(name);
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок с именем отправителя */}
      <div className="space-y-2">
        <div className="text-label-md font-nyghtserif italic text-adaptive tracking-wider">
          от <span>{declinedName}</span>
          {nickname && (
            <span className="text-text-soft-400"> (@{nickname})</span>
          )}
        </div>
      </div>

      {/* Основной текст поздравления */}
      <div className="text-paragraph-lg text-adaptive font-euclid md:text-paragraph-xl">
        {text}
      </div>
    </div>
  );
} 