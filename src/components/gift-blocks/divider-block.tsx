"use client";

import type { DividerBlock as DividerBlockType } from "@/utils/types/gift";

interface DividerBlockProps {
  block: DividerBlockType;
  className?: string;
}

export function DividerBlock({ className = "" }: DividerBlockProps) {
  return (
    <div className={`py-0 flex flex-col items-center ${className}`}>
            <span className="font-nyghtserif text-adaptive sm:text-label-lg md:text-label-xl">
              ***
            </span>
    </div>
  );
} 