export interface DbUser {
  id: string;
  categories: string[];
  slack_webhook_url: string | null;
  message_template: string | null;
  send_hour: number | null;
  send_minute: number | null;
  notification_enabled: boolean;
  last_notified_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  categories: string[];
  slackWebhookUrl: string;
  messageTemplate: string;
  sendHour: number;
  sendMinute: number;
  notificationEnabled: boolean;
}

export interface NotificationSettingsResponse {
  userId: string;
  settings: NotificationSettings;
}

export interface DbArticle {
  id: string;
  title: string;
  url: string;
  categories: string[];
  skill_type: string | null;
  author: string | null;
  recommend_reason: string | null;
  published_at: string | null;
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
