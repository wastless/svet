"use client";

import { useState } from "react";
import * as Button from "~/components/ui/button";
import { Countdown } from "~/components/countdown";
import { WordOfDay } from "~/components/word-of-day";
import { Navigation } from "~/components/navigation";
import { COUNTDOWN_CONFIG, WORD_SYSTEM } from "../../utils/constants";

export default function HomePage() {
  const [currentTestDate, setCurrentTestDate] = useState<Date>(new Date());

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    setCurrentTestDate(selectedDate);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="relative">
      <Navigation />
      
      {/* Datepicker для тестирования 
      <div className="bg-gray-100 p-4 border-b">
        <div className="container mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Current Date (for debugging):
          </label>
          <input
            type="date"
            value={formatDateForInput(currentTestDate)}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <span className="ml-4 text-sm text-gray-600">
            Selected: {currentTestDate.toLocaleDateString()}
          </span>
        </div>
      </div>*/}

      <main className="bg-bg-white-0 min-h-screen">
        <div className="flex min-h-screen flex-col items-center justify-center">

          <div className="flex flex-col items-center justify-center gap-12">

            <div className="flex flex-col items-center justify-center">
              <h2 className="text-text-strong-950 font-nyghtserif text-label-lg text-center italic">
                <WordOfDay
                  startDate={WORD_SYSTEM.START_DATE}
                  cycleLength={WORD_SYSTEM.CYCLE_LENGTH}
                  currentDate={currentTestDate}
                />
              </h2>
              <h1 className="text-text-strong-950 text-title-h1 font-founders text-center -mt-2">
                LESYA
                <br />
                SVET
              </h1>
            </div>
            
            <h2 className="text-text-strong-950 font-styrene text-paragraph-md-bold text-center uppercase">
              Before the birthday:
              <br />
              <Countdown
                targetDate={COUNTDOWN_CONFIG.TARGET_DATE}
                // currentDate={currentTestDate}
                updateInterval={COUNTDOWN_CONFIG.UPDATE_INTERVAL}
              />
            </h2>
          </div>
        </div>
      </main>

      {/* Кнопка фиксирована к viewport */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button.Root>Let's GO</Button.Root>
        </div>
      </div>
    </div>
  );
}
