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
          <a
            href="https://daily-insight-seven.vercel.app/"
            className="text-[24px] tracking-wide text-primary"
            style={{ fontFamily: "var(--font-blacksword)" }}
          >
            dailyInsight
          </a>
        </header>
        <main className="pt-16">{children}</main>

        <footer className="relative border-t border-border py-lg px-lg opacity-50">
          <div className="mx-auto max-w-[720px] flex items-center justify-center gap-sm text-fine-print text-ink-muted">
            <span>© 2026 yein</span>
            <a
              href="mailto:zxcvyein950823@gmail.com"
              aria-label="이메일 보내기"
              className="hover:text-ink transition-colors duration-fast ease-brand"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m4 6 8 7 8-7" />
              </svg>
            </a>
            <a
              href="https://github.com/furaha707/daily-insight"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 저장소"
              className="hover:text-ink transition-colors duration-fast ease-brand"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
