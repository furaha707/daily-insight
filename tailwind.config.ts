import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0066cc",
        "primary-focus": "#0071e3",
        "primary-on-dark": "#2997ff",
        canvas: "#ffffff",
        "canvas-parchment": "#f5f5f7",
        "surface-pearl": "#fafafc",
        "surface-tile-1": "#272729",
        "surface-tile-2": "#2a2a2c",
        "surface-tile-3": "#252527",
        "surface-black": "#000000",
        "surface-chip": "rgba(210, 210, 215, 0.64)",
        ink: "#1d1d1f",
        "ink-muted-80": "#333333",
        "ink-muted-48": "#7a7a7a",
        "body-on-dark": "#ffffff",
        "body-muted": "#cccccc",
        "divider-soft": "#f0f0f0",
        hairline: "#e0e0e0",
      },
      fontFamily: {
        display: [
          "SF Pro Display",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        text: [
          "SF Pro Text",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        "hero-display": [
          "56px",
          { lineHeight: "1.07", letterSpacing: "-0.28px", fontWeight: "600" },
        ],
        "display-lg": [
          "40px",
          { lineHeight: "1.10", letterSpacing: "0", fontWeight: "600" },
        ],
        "display-md": [
          "34px",
          { lineHeight: "1.47", letterSpacing: "-0.374px", fontWeight: "600" },
        ],
        lead: [
          "28px",
          { lineHeight: "1.14", letterSpacing: "0.196px", fontWeight: "400" },
        ],
        "lead-airy": [
          "24px",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "300" },
        ],
        tagline: [
          "21px",
          { lineHeight: "1.19", letterSpacing: "0.231px", fontWeight: "600" },
        ],
        "body-strong": [
          "17px",
          { lineHeight: "1.24", letterSpacing: "-0.374px", fontWeight: "600" },
        ],
        body: [
          "17px",
          { lineHeight: "1.47", letterSpacing: "-0.374px", fontWeight: "400" },
        ],
        caption: [
          "14px",
          { lineHeight: "1.43", letterSpacing: "-0.224px", fontWeight: "400" },
        ],
        "caption-strong": [
          "14px",
          { lineHeight: "1.29", letterSpacing: "-0.224px", fontWeight: "600" },
        ],
        "button-large": [
          "18px",
          { lineHeight: "1.0", letterSpacing: "0", fontWeight: "300" },
        ],
        "button-utility": [
          "14px",
          { lineHeight: "1.29", letterSpacing: "-0.224px", fontWeight: "400" },
        ],
        "fine-print": [
          "12px",
          { lineHeight: "1.0", letterSpacing: "-0.12px", fontWeight: "400" },
        ],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "17px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "80px",
      },
      borderRadius: {
        none: "0px",
        xs: "5px",
        sm: "8px",
        md: "11px",
        lg: "18px",
        pill: "9999px",
      },
      boxShadow: {
        product: "3px 5px 30px 0 rgba(0, 0, 0, 0.22)",
        none: "none",
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
          "0%": { boxShadow: "0 0 0 0 rgba(0, 102, 204, 0.35)" },
          "100%": { boxShadow: "0 0 0 14px rgba(0, 102, 204, 0)" },
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
