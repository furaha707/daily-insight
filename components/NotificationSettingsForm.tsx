"use client";

import { useEffect, useState } from "react";
import type { NotificationSettings } from "@/types";

interface NotificationSettingsFormProps {
  userId: string | null;
  categories: string[];
  onUserIdChange: (id: string) => void;
  onCategoriesLoaded?: (categories: string[]) => void;
}

const DEFAULT_TEMPLATE = `📰 오늘의 인사이트 아티클이에요!

{title}
{url}`;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

export default function NotificationSettingsForm({
  userId,
  categories,
  onUserIdChange,
  onCategoriesLoaded,
}: NotificationSettingsFormProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/notifications?userId=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.settings) return;
        const s: NotificationSettings = data.settings;
        setWebhookUrl(s.slackWebhookUrl);
        setTemplate(s.messageTemplate);
        setHour(s.sendHour);
        setMinute(s.sendMinute);
        setEnabled(s.notificationEnabled);
        if (s.categories.length > 0) {
          onCategoriesLoaded?.(s.categories);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSave = async () => {
    if (categories.length === 0) {
      setStatus({ type: "error", message: "위에서 관심 카테고리를 먼저 선택해주세요." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          categories,
          slackWebhookUrl: webhookUrl,
          messageTemplate: template,
          sendHour: hour,
          sendMinute: minute,
          notificationEnabled: enabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "저장에 실패했습니다.");

      onUserIdChange(data.userId);
      setStatus({
        type: "success",
        message: enabled
          ? `저장했어요. 매일 ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}쯔음 Slack으로 보내드릴게요.`
          : "저장했어요. (자동 발송은 꺼진 상태예요)",
      });
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[560px] mx-auto rounded-lg border border-hairline bg-canvas p-lg text-left">
      <h3 className="text-tagline text-ink mb-xxs">Slack 자동 발송 설정</h3>
      <p className="text-caption text-ink-muted-48 mb-lg">
        설정한 시각이 되면 선택한 카테고리 중 아직 안 읽은 아티클을 골라 Slack으로 보내드려요.
      </p>

      <label className="block mb-lg">
        <span className="block text-caption-strong text-ink mb-xxs">
          Slack Incoming Webhook URL
        </span>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          className="w-full rounded-md border border-hairline px-md py-sm text-caption text-ink placeholder:text-ink-muted-48 focus:border-primary"
        />
      </label>

      <label className="block mb-lg">
        <span className="block text-caption-strong text-ink mb-xxs">발송 메시지 템플릿</span>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-hairline px-md py-sm text-caption text-ink focus:border-primary resize-none"
        />
        <span className="block text-fine-print text-ink-muted-48 mt-xxs">
          {"{title}"}, {"{url}"}, {"{category}"} 를 아티클 정보로 치환해서 보내드려요.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-sm mb-lg">
        <span className="text-caption-strong text-ink">발송 시각</span>
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="rounded-md border border-hairline px-sm py-xxs text-caption text-ink"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}시
            </option>
          ))}
        </select>
        <select
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
          className="rounded-md border border-hairline px-sm py-xxs text-caption text-ink"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}분
            </option>
          ))}
        </select>
        <span className="text-fine-print text-ink-muted-48">(Asia/Seoul, 10분 단위)</span>
      </div>

      <div className="flex items-center justify-between mb-lg">
        <span className="text-caption-strong text-ink">자동 발송 켜기</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={[
            "relative h-6 w-11 rounded-pill transition-colors",
            enabled ? "bg-primary" : "bg-hairline",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-canvas transition-transform",
              enabled ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-pill bg-primary text-white py-sm text-body active:scale-95 transition-transform disabled:opacity-50"
      >
        {loading ? "저장 중..." : "설정 저장"}
      </button>

      {status && (
        <p
          className={[
            "mt-sm text-caption",
            status.type === "success" ? "text-primary" : "text-red-500",
          ].join(" ")}
          role="status"
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
