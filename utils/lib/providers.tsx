"use client";

// Импортируем патч сессии в самом начале
import "@/utils/patches/session-patch-init";

import { NavVisibilityProvider } from "~/components/providers/nav-visibility-provider";
import { IntroProvider } from "~/components/providers/intro-provider";
import { IntroRedirect } from "~/components/providers/intro-redirect";
import { AuthProvider } from "~/components/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NavVisibilityProvider> 
        <IntroProvider>
          <IntroRedirect 
            excludePaths={['/api', '/_next', '/favicon.ico', '/static']} 
            homePath="/"
          >
            {children}
          </IntroRedirect>
        </IntroProvider>
      </NavVisibilityProvider>
    </AuthProvider>
  );
} 