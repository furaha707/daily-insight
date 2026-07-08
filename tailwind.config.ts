import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 다크모드 요청에 따라 원 가이드(라이트, 파치먼트 캔버스)를 다크 warm-neutral 팔레트로 반전.
        // 메인 컬러(terracotta)는 더 적극적으로 쓰기 위해 다크 배경에서도 선명하도록 살짝 밝게 조정.
        primary: "#E0693C",
        "on-primary": "#ffffff",
        "primary-hover": "#F0794C",
        ink: "#F5EFE7",
        "ink-muted": "#C9BDB0",
        canvas: "#1B1613",
        "surface-1": "#241D19",
        "surface-2": "#2E2620",
        border: "#463B33",
        "accent-warm": "#D9A468",
        "code-bg": "#221B17",
        success: "#7CB37F",
        error: "#E2685C",
      },
      fontFamily: {
        // Styrene A/B는 라이선스 폰트라 웹에 없음 — 요청에 따라 Pretendard(CDN)를 전역 서체로 사용.
        display: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
        text: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        display: [
          "52px",
          { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        "title-lg": [
          "28px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        "title-md": [
          "20px",
          { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "500" },
        ],
        "title-sm": [
          "16px",
          { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "500" },
        ],
        body: [
          "17px",
          { lineHeight: "1.65", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        "body-sm": [
          "14px",
          { lineHeight: "1.6", letterSpacing: "-0.005em", fontWeight: "400" },
        ],
        caption: [
          "13px",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" },
        ],
        "fine-print": [
          "12px",
          { lineHeight: "1.4", letterSpacing: "0", fontWeight: "400" },
        ],
        button: [
          "15px",
          { lineHeight: "1.0", letterSpacing: "0", fontWeight: "500" },
        ],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26, 26, 24, 0.06)",
        elevated: "0 4px 24px rgba(26, 26, 24, 0.08)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "240ms",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(224, 105, 60, 0.35)" },
          "100%": { boxShadow: "0 0 0 14px rgba(224, 105, 60, 0)" },
        },
        "celebrate-pop": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "60%": { opacity: "1", transform: "scale(1.15)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "confetti-burst": {
          "0%": {
            transform: "translate(0, 0) scale(1) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform:
              "translate(var(--tx, 40px), var(--ty, -40px)) scale(0.4) rotate(180deg)",
            opacity: "0",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "celebrate-pop": "celebrate-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "confetti-burst": "confetti-burst 0.9s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
