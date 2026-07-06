import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "dailyInsight — 매일 하나의 인사이트",
  description:
    "관심 카테고리를 선택하면 중복 없이 매일 새로운 아티클을 추천해드려요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="antialiased">
        <header className="fixed top-0 left-0 right-0 z-40 h-11 bg-surface-black flex items-center justify-center">
          <span className="text-body-on-dark text-[13px] font-semibold tracking-tight">
            dailyInsight
          </span>
        </header>
        <main className="pt-11">{children}</main>
      </body>
    </html>
  );
}
