import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Blacksword by Youssef Habchi — 개인 용도 무료 라이선스(상업적 사용 시 별도 라이선스 필요).
// https://www.dafont.com/blacksword.font
const blacksword = localFont({
  src: "./fonts/Blacksword.otf",
  variable: "--font-blacksword",
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
    <html lang="ko" className={blacksword.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="antialiased">
        <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-canvas border-b border-border flex items-center justify-center">
          <span
            className="text-[24px] tracking-wide text-primary"
            style={{ fontFamily: "var(--font-blacksword)" }}
          >
            dailyInsight
          </span>
        </header>
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
