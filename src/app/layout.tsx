import "~/styles/globals.css";
import { type Metadata } from "next";
import { fontVariables, fontClasses } from "./fonts/config";

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
        {children}
      </body>
    </html>
  );
}
