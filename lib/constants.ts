export const USER_ID_STORAGE_KEY = "dailyinsight_user_id";

// 발송 메시지 문구는 고정이며 사용자가 수정할 수 없다. {title}/{url}은
// Edge Function이 실제 아티클 정보로 치환하는 토큰이다.
export const DEFAULT_MESSAGE_TEMPLATE = `📰 오늘의 인사이트 아티클이에요!

{title}
{url}`;
