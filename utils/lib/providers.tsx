"use client";

import { SessionProvider } from "next-auth/react";
import { NavVisibilityProvider } from "~/components/providers/nav-visibility-provider";
import { IntroProvider } from "~/components/providers/intro-provider";
import { IntroRedirect } from "~/components/providers/intro-redirect";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
} 