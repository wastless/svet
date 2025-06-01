"use client";

import React from 'react';
import { IntroProvider as BaseIntroProvider } from "../../../utils/hooks/useIntro";

/**
 * Провайдер для управления интро
 */
export function IntroProvider({ children }: { children: React.ReactNode }) {
  return <BaseIntroProvider>{children}</BaseIntroProvider>;
} 