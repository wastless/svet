"use client";

import * as Button from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 overflow-hidden">
      <main className="bg-adaptive h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-12 px-4">
          <h1 className="-mt-2 text-center font-founders text-sm-title-h1 md:text-md-title-h1 lg:text-title-h1 text-adaptive">
            404
          </h1>
          <div className="flex flex-col items-center justify-center text-center font-styrene font-bold text-paragraph-sm md:text-paragraph-md md:font-bold uppercase text-adaptive">
            <span>OHH, beda beda....</span>
            <br />
            <span>***</span>
            <span className="max-w-[300px] sm:max-w-[400px] md:max-w-[500px]">
              This page is lost. You've reached point 404, where broken links
              are hidden.
            </span>
          </div>
        </div>
      </main>

      {/* Кнопка фиксирована к viewport */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto absolute bottom-12 sm:bottom-8 left-1/2 -translate-x-1/2">
          <Button.Root onClick={() => router.push("/")}>Go home</Button.Root>
        </div>
      </div>
    </div>
  );
}
