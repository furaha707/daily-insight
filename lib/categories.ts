export const CATEGORIES = [
  "기획",
  "IT",
  "개발",
  "협업",
  "디자인",
  "AI",
  "커뮤니케이션",
  "비즈니스",
  "데이터",
  "UIUX",
] as const;

export type Category = (typeof CATEGORIES)[number];
