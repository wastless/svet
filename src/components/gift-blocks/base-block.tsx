"use client";

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
    'ия': 'ии', // Мария -> Марии, Анастасия -> Анастасии
    'га': 'ги', // Ольга -> Ольги
    'ка': 'ки', // Вероника -> Вероники
    'ла': 'лы', // Мила -> Милы
    'на': 'ньi', // Алёна -> Алёны, Яна -> Яны
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
      <div className="text-paragraph-xl text-adaptive font-euclid">
        {text}
      </div>
    </div>
  );
} 