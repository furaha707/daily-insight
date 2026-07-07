const WEBHOOK_URL_PATTERN =
  /^https:\/\/hooks\.slack\.com\/services\/([^/]+)\/([^/]+)\/([^/]+)$/;

/**
 * Slack Incoming Webhook URL(https://hooks.slack.com/services/{teamId}/{botId}/{secret})에서
 * 워크스페이스(Team) ID를 추출한다. 형식이 다르면 null을 반환한다.
 */
export function extractSlackTeamId(webhookUrl: string): string | null {
  const match = webhookUrl.match(WEBHOOK_URL_PATTERN);
  return match ? match[1] : null;
}
