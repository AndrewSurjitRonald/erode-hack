import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

import { I18nProvider } from "@/lib/i18n";
import { ConfettiCanvas } from "@/components/Confetti";

export const metadata: Metadata = {
  title: "PathLearn",
  description: "Adaptive Class 8 Mathematics practice with a live teacher dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-page-bg font-sans text-ink antialiased">
        <I18nProvider>
          {children}
          <ConfettiCanvas />
        </I18nProvider>
      </body>
    </html>
  );
}
