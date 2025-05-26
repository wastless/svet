"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as Button from "~/components/ui/button";
import { Countdown } from "~/components/countdown";
import { WordOfDay } from "~/components/word-of-day";
import { IntroOverlay } from "~/components/intro-overlay";
import { useIntro } from "~/hooks/useIntro";
import { COUNTDOWN_CONFIG, WORD_SYSTEM } from "../../utils/constants";
import { useDate } from "~/hooks/useDateContext";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentDate } = useDate();
  const { shouldShowIntro, isLoading, completeIntro } = useIntro();

  // Показываем лоадер пока проверяем куки или дата не инициализирована
  if (isLoading || !currentDate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-adaptive">
        <div className="text-adaptive font-styrene">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Интро оверлей */}
      {shouldShowIntro && (
        <IntroOverlay onComplete={completeIntro} />
      )}
      
      <main className="bg-adaptive min-h-screen">
        <div className="flex min-h-screen flex-col items-center justify-center">

          <div className="flex flex-col items-center justify-center gap-12">

            <div className="flex flex-col items-center justify-center">
              <h2 className="text-adaptive font-nyghtserif text-label-lg text-center italic">
                <WordOfDay
                  startDate={WORD_SYSTEM.START_DATE}
                  cycleLength={WORD_SYSTEM.CYCLE_LENGTH}
                  currentDate={currentDate}
                />
              </h2>
              <h1 className="text-adaptive text-title-h1 font-founders text-center -mt-2">
                LESYA
                <br />
                SVET
              </h1>
            </div>
            
            <h2 className="text-adaptive font-styrene text-paragraph-md-bold text-center uppercase">
              Before the birthday:
              <br />
              <Countdown
                targetDate={COUNTDOWN_CONFIG.TARGET_DATE}
                currentDate={currentDate}
                updateInterval={COUNTDOWN_CONFIG.UPDATE_INTERVAL}
              />
            </h2>
          </div>
        </div>
      </main>

      {/* Кнопка фиксирована к viewport */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button.Root 
            onClick={() => {
              if (session) {
                // Авторизованный пользователь - перейти к управлению контентом
                console.log("Authorized user - manage content");
                // Здесь будет логика перехода к управлению контентом
              } else {
                // Неавторизованный пользователь - перейти к авторизации
                router.push("/login");
              }
            }}
          >
            Let's GO
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
