"use client";

import { useEffect } from "react";
import { useDate } from "@/utils/hooks/useDateContext";

export function DatePicker() {
  const { currentDate, setCurrentDate, isTestMode, setIsTestMode } = useDate();

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    setCurrentDate(selectedDate);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Не показываем DatePicker если не в тестовом режиме или дата не инициализирована
  if (!isTestMode || !currentDate) return null;

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-40 bg-adaptive border border-adaptive-stroke rounded-lg p-4 shadow-lg">
      <div className="flex flex-col items-center space-y-3">
        <label className="text-sm font-medium text-adaptive">
          🧪 Test Mode - Current Date:
        </label>
        <input
          type="date"
          value={formatDateForInput(currentDate)}
          onChange={handleDateChange}
          className="border border-adaptive-stroke rounded px-3 py-2 bg-adaptive text-adaptive"
        />
        <span className="text-xs text-adaptive opacity-75">
          Selected: {currentDate.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
} 