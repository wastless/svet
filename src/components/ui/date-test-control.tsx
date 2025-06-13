"use client";

import { useState } from 'react';
import { useDate } from '@/utils/hooks/useDateContext';
import * as Button from '~/components/ui/button';

export function DateTestControl() {
  const { currentDate, setCurrentDate, isTestMode, setIsTestMode } = useDate();
  const [dateInput, setDateInput] = useState('');

  // Format date to YYYY-MM-DD for input value
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
  };

  // Apply selected date
  const applyDate = () => {
    if (dateInput) {
      setCurrentDate(new Date(dateInput));
    }
  };

  // Toggle test mode
  const toggleTestMode = () => {
    if (!isTestMode) {
      // When entering test mode, keep the current date as starting point
      if (currentDate) {
        setDateInput(formatDateForInput(currentDate));
      }
    } else {
      // When exiting test mode, reset to current date
      setCurrentDate(new Date());
    }
    setIsTestMode(!isTestMode);
  };

  // If test mode is off, don't render anything
  if (!isTestMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-styrene text-paragraph-sm">Test Mode</span>
          <button
            onClick={toggleTestMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors bg-green-500`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform translate-x-6`}
            />
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="font-styrene text-paragraph-sm">
            Current: {currentDate?.toLocaleDateString()}
          </span>
          <input
            type="date"
            value={dateInput}
            onChange={handleDateChange}
            className="border p-2 rounded text-sm dark:bg-bg-strong-800 dark:border-bg-strong-700"
          />
          <Button.Root onClick={applyDate} className="text-sm py-1">
            Apply Date
          </Button.Root>
        </div>
      </div>
    </div>
  );
} 