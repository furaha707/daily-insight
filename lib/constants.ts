export const USER_ID_STORAGE_KEY = "dailyinsight_user_id";

// ISO 요일 번호(1=월 ~ 5=금) — 주말 발송은 지원하지 않는다.
export const WEEKDAYS = [
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
] as const;

export const DEFAULT_SEND_WEEKDAYS = WEEKDAYS.map((d) => d.value);

export function formatWeekdaysLabel(days: number[]) {
  return WEEKDAYS.filter((d) => days.includes(d.value))
    .map((d) => d.label)
    .join(",");
}

// 발송 메시지 문구는 고정이며 사용자가 수정할 수 없다. {title}/{url}은
// Edge Function이 실제 아티클 정보로 치환하는 토큰이다.
export const DEFAULT_MESSAGE_TEMPLATE = `📰 오늘의 인사이트 아티클이에요!

{title}
{url}`;

// 구독 해지 사유 설문 선택지. "기타"는 자유 입력(custom_reason)을 함께 받는다.
export const UNSUBSCRIBE_REASONS = [
  "원하는 아티클이 부족해요",
  "기존 알림이 많아요",
  "다른 학업에 더 집중하고 싶어요",
  "기타",
] as const;
