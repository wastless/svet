import "~/styles/globals.css";
import { type Metadata } from "next";
import { fontVariables, fontClasses } from "./fonts/config";
import { Providers } from "~/components/providers";
import { Navigation } from "~/components/navigation";
import { DateProvider } from "~/hooks/useDateContext";
import { DatePicker } from "~/components/date-picker";

export const metadata: Metadata = {
  title: "Lesya Svet",
  description: "Lesya Svet",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <Providers>
          <DateProvider>
            <DatePicker />
            <Navigation />
            {children}
          </DateProvider>
        </Providers>
      </body>
    </html>
  );
}
