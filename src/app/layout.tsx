import "~/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { Permanent_Marker } from "next/font/google";

const founders = localFont({
  src: [
    {
      path: "./fonts/FoundersGroteskXCond_Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/FoundersGroteskXCond_SmBd.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-founders",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-permanent-marker",
});

export const metadata: Metadata = {
  title: "Lesya Svet",
  description: "Lesya Svet",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${founders.variable}`}
    >
      <body className="font-founders">{children}</body>
    </html>
  );
}
