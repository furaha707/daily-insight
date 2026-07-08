export interface DbUser {
  id: string;
  categories: string[];
  slack_webhook_url: string | null;
  slack_team_id: string | null;
  message_template: string | null;
  send_hour: number | null;
  send_minute: number | null;
  send_weekdays: number[] | null;
  notification_enabled: boolean;
  last_notified_date: string | null;
  extra_links: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  categories: string[];
  slackWebhookUrl: string;
  messageTemplate: string;
  extraLinks: string;
  sendHour: number;
  sendMinute: number;
  sendWeekdays: number[];
  notificationEnabled: boolean;
  sentCount: number;
}

export interface NotificationSettingsResponse {
  userId: string;
  settings: NotificationSettings;
}

export interface DbArticle {
  id: string;
  title: string;
  author: string | null;
  published_at: string | null;
  categories: string[];
  url: string;
  created_at: string;
}

export interface DbSentLog {
  id: string;
  user_id: string;
  article_id: string;
  sent_at: string;
  is_sent: boolean;
}

export interface SelectArticleResponse {
  article: Pick<DbArticle, "id" | "title" | "url" | "categories"> | null;
  userId: string;
  exhausted?: boolean;
}
