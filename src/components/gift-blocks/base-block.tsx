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
  
  // Результат рендеринга
  const result: React.ReactNode[] = [];
  
  // Временные массивы для хранения элементов списков
  let bulletListItems: string[] = [];
  let numberedListItems: string[] = [];
  
  // Функция для добавления маркированного списка в результат
  const addBulletList = () => {
    if (bulletListItems.length > 0) {
      result.push(
        <ul key={`ul-${result.length}`} className="list-disc ml-5 space-y-1">
          {bulletListItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      bulletListItems = [];
    }
  };
  
  // Функция для добавления нумерованного списка в результат
  const addNumberedList = () => {
    if (numberedListItems.length > 0) {
      result.push(
        <ol key={`ol-${result.length}`} className="list-decimal ml-5 space-y-1">
          {numberedListItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
      numberedListItems = [];
    }
  };
  
  // Проходим по каждой строке
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue; // Skip undefined lines
    
    const trimmedLine = line.trim();
    
    // Проверяем, является ли строка элементом маркированного списка
    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      // Если у нас есть активный нумерованный список, добавляем его в результат
      addNumberedList();
      
      // Удаляем маркер и начальные пробелы
      const listItemContent = trimmedLine.substring(1).trim();
      
      // Добавляем элемент в маркированный список
      bulletListItems.push(listItemContent);
    }
    // Проверяем, является ли строка элементом нумерованного списка
    else if (/^\d+\.\s/.test(trimmedLine)) {
      // Если у нас есть активный маркированный список, добавляем его в результат
      addBulletList();
      
      // Удаляем номер и точку
      const listItemContent = trimmedLine.replace(/^\d+\.\s/, '');
      
      // Добавляем элемент в нумерованный список
      numberedListItems.push(listItemContent);
    }
    // Если это обычная строка
    else {
      // Если у нас есть активные списки, добавляем их в результат
      addBulletList();
      addNumberedList();
      
      // Добавляем обычную строку в результат
      if (trimmedLine) {
        result.push(
          <React.Fragment key={`text-${result.length}`}>
            {trimmedLine}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        );
      } else if (i < lines.length - 1) {
        // Пустая строка - просто добавляем перенос
        result.push(<br key={`br-${result.length}`} />);
      }
    }
  }
  
  // Добавляем оставшиеся списки в результат
  addBulletList();
  addNumberedList();
  
  return result;
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
        {processText(text)}
      </div>
    </div>
  );
} 