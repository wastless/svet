"use client";

import * as Button from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative">
      <main className="flex min-h-screen flex-col items-center justify-center bg-adaptive">
        <div className="flex flex-col items-center justify-center gap-12">
          <h1 className="-mt-2 text-center font-founders text-title-h1 text-adaptive">
            404
          </h1>
          <div className="flex flex-col items-center justify-center text-center font-styrene font-bold text-paragraph-md uppercase text-adaptive">
            <span>OHH, beda beda....</span>
            <br />
            <span>***</span>
            <span className="max-w-[500px]">
              This page is lost. You've reached point 404, where broken links
              are hidden.
            </span>
          </div>
        </div>
      </main>

      {/* Кнопка фиксирована к viewport */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button.Root onClick={() => router.push("/")}>Go home</Button.Root>
        </div>
      </div>
    </div>
  );
}
