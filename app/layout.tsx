import type React from "react";
import { Inter } from "next/font/google";
import { AppProviders } from "./providers";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import "@rainbow-me/rainbowkit/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Layaway",
  description: "BTC Layaway Protocol",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <AppProviders>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
