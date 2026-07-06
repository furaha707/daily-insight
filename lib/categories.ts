export const CATEGORIES = [
  "커뮤니케이션",
  "문제해결역량",
  "Zapier",
  "Jira",
  "비즈니스",
  "마케팅",
  "디자인",
  "기획",
  "AI",
  "Figma",
  "데이터",
  "개발프로세스",
  "협업",
  "취업",
  "AI툴",
  "UI/UX",
] as const;

export type Category = (typeof CATEGORIES)[number];
