"use client";

import { useState } from "react";
import CategorySelector from "@/components/CategorySelector";
import SlackWebhookHelpModal from "@/components/SlackWebhookHelpModal";
import SubscribeSuccessModal from "@/components/SubscribeSuccessModal";
import UnsubscribeReasonModal from "@/components/UnsubscribeReasonModal";
import UnsubscribeByeModal from "@/components/UnsubscribeByeModal";
import { WEEKDAYS, formatWeekdaysLabel } from "@/lib/constants";

interface NotificationSettingsFormProps {
  userId: string | null;
  categories: string[];
  onToggleCategory: (category: string) => void;
  onUserIdChange: (id: string) => void;
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
  extraLinks: string;
  onExtraLinksChange: (value: string) => void;
  hour: number;
  onHourChange: (hour: number) => void;
  minute: number;
  onMinuteChange: (minute: number) => void;
  weekdays: number[];
  onToggleWeekday: (day: number) => void;
  checkingSubscription: boolean;
  isSubscribed: boolean;
  sentCount: number;
  onSubscribed: () => void;
  onUnsubscribed: () => void;
  onResetIdentity: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

const PREVIEW_INTRO = "📰 오늘의 인사이트 아티클이에요!";
const EXAMPLE_TITLE = `AI 주도 개발 시대, "기획"에 주목해야 하는 이유`;

function formatTimeLabel(hour: number, minute: number) {
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${String(minute).padStart(2, "0")}`;
}

export default function NotificationSettingsForm({
  userId,
  categories,
  onToggleCategory,
  onUserIdChange,
  webhookUrl,
  onWebhookUrlChange,
  extraLinks,
  onExtraLinksChange,
  hour,
  onHourChange,
  minute,
  onMinuteChange,
  weekdays,
  onToggleWeekday,
  checkingSubscription,
  isSubscribed,
  sentCount,
  onSubscribed,
  onUnsubscribed,
  onResetIdentity,
}: NotificationSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [byeOpen, setByeOpen] = useState(false);

  const handleSave = async () => {
    if (categories.length === 0) {
      setStatus({ type: "error", message: "관심 카테고리를 먼저 선택해주세요." });
      return;
    }
    if (weekdays.length === 0) {
      setStatus({ type: "error", message: "발송 요일을 하나 이상 선택해주세요." });
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
          extraLinks,
          sendHour: hour,
          sendMinute: minute,
          sendWeekdays: weekdays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "저장에 실패했습니다.");

      onUserIdChange(data.userId);
      onSubscribed();
      setStatus({
        type: "success",
        message: `${formatWeekdaysLabel(weekdays)} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} 구독 설정됨`,
      });
      setByeOpen(false);
      setSuccessOpen(true);
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (reason: string, customReason: string) => {
    if (!userId) return;

    setUnsubscribing(true);
    setStatus(null);

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reason, customReason }),
      });

      if (!res.ok) throw new Error("구독 해지에 실패했습니다.");

      onUnsubscribed();
      setReasonOpen(false);
      setSuccessOpen(false);
      setByeOpen(true);
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setUnsubscribing(false);
    }
  };

  return (
    <div className="w-full max-w-[560px] mx-auto rounded-lg border border-border border-t-2 border-t-primary bg-surface-1 shadow-card p-xl text-left">
      <div
        className={[
          "rounded-md px-md py-md mb-lg shadow-elevated",
          checkingSubscription
            ? "bg-surface-2"
            : isSubscribed
              ? "bg-success"
              : "bg-primary",
        ].join(" ")}
      >
        {checkingSubscription ? (
          <p className="text-body-sm text-ink-muted">구독 상태 확인 중...</p>
        ) : isSubscribed ? (
          <p className="text-[18px] leading-[1.3] tracking-[-0.015em] text-on-primary font-semibold">
            ✅ 구독중 ({sentCount}회 발송됨)
          </p>
        ) : (
          <p className="text-[18px] leading-[1.3] tracking-[-0.015em] text-on-primary font-semibold">
            미구독중입니다. 바로 신청해보세요!
          </p>
        )}
      </div>

      <div className="mb-lg">
        <span className="block text-title-sm text-ink mb-sm">받고 싶은 아티클 주제</span>
        <CategorySelector selected={categories} onToggle={onToggleCategory} />
      </div>

      <label className="block mb-lg">
        <span className="flex items-center gap-xxs mb-xxs">
          <span className="text-title-sm text-ink">Slack Incoming Webhook URL</span>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Webhook URL 발급 방법 보기"
            className="h-4 w-4 rounded-full bg-primary text-on-primary text-[10px] leading-4 flex items-center justify-center"
          >
            ?
          </button>
        </span>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => onWebhookUrlChange(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          className="w-full rounded-md border border-border bg-canvas px-md py-sm text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </label>

      <label className="block mb-lg">
        <span className="block text-title-sm text-ink mb-xxs">
          아티클과 함께 받고 싶은 메세지 (선택)
        </span>
        <textarea
          value={extraLinks}
          onChange={(e) => onExtraLinksChange(e.target.value)}
          rows={3}
          placeholder="자유롭게 입력하세요"
          className="w-full rounded-md border border-border bg-canvas px-md py-sm text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
        />
        <span className="block text-fine-print text-ink-muted mt-xxs">
          추천 아티클과 함께 이 내용도 그대로 포함해서 보내드려요.
        </span>
      </label>

      <div className="block mb-lg">
        <span className="block text-title-sm text-ink mb-xxs">Preview</span>
        <div className="w-full rounded-md bg-[#1a1d21] border border-border px-md py-sm">
          <div className="flex items-start gap-sm">
            <div className="h-9 w-9 shrink-0 rounded-md bg-primary flex items-center justify-center text-on-primary text-title-sm font-semibold">
              d
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-xxs flex-wrap">
                <span className="text-body-sm text-ink font-semibold">dailyInsight</span>
                <span className="text-fine-print text-ink-muted bg-surface-2 rounded-sm4 px-xxs">
                  APP
                </span>
                <span className="text-fine-print text-ink-muted">
                  {formatTimeLabel(hour, minute)}
                </span>
              </div>
              <p className="mt-xxs text-body-sm text-ink">{PREVIEW_INTRO}</p>
              <p className="mt-xxs text-body-sm text-primary underline underline-offset-2">
                {EXAMPLE_TITLE}
              </p>
              {extraLinks.trim() && (
                <p className="mt-xxs whitespace-pre-line text-body-sm text-ink-muted">
                  {extraLinks.trim()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-lg">
        <span className="block text-title-sm text-ink mb-sm">발송 요일</span>
        <div className="flex flex-wrap justify-start gap-xxs">
          {WEEKDAYS.map((day) => {
            const isSelected = weekdays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleWeekday(day.value)}
                className={[
                  "h-9 w-9 rounded-pill text-body-sm transition-all duration-fast ease-brand active:scale-95 border flex items-center justify-center",
                  isSelected
                    ? "bg-primary text-on-primary border-transparent"
                    : "bg-canvas text-ink-muted border-border hover:border-primary",
                ].join(" ")}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-sm mb-lg">
        <span className="text-title-sm text-ink">발송 시각</span>
        <select
          value={hour}
          onChange={(e) => onHourChange(Number(e.target.value))}
          className="rounded-md border border-border bg-canvas px-sm py-xxs text-body-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}시
            </option>
          ))}
        </select>
        <select
          value={minute}
          onChange={(e) => onMinuteChange(Number(e.target.value))}
          className="rounded-md border border-border bg-canvas px-sm py-xxs text-body-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}분
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full h-11 rounded-md bg-primary text-on-primary text-button active:bg-primary-hover active:scale-[0.98] transition-colors duration-fast ease-brand disabled:opacity-50"
      >
        {loading ? "저장 중..." : isSubscribed ? "구독 정보 수정" : "구독하기"}
      </button>

      {status && (
        <p
          className={[
            "mt-sm text-body-sm",
            status.type === "success" ? "text-success" : "text-error",
          ].join(" ")}
          role="status"
        >
          {status.message}
        </p>
      )}

      {isSubscribed && (
        <div className="mt-lg pt-lg border-t border-border text-center">
          <button
            type="button"
            onClick={() => setReasonOpen(true)}
            disabled={unsubscribing}
            className="text-fine-print text-ink-muted underline disabled:opacity-50"
          >
            {unsubscribing ? "해지 중..." : "구독 해지하기"}
          </button>
        </div>
      )}

      <SlackWebhookHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SubscribeSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        hour={hour}
        minute={minute}
        weekdays={weekdays}
      />
      <UnsubscribeReasonModal
        open={reasonOpen}
        submitting={unsubscribing}
        onCancel={() => setReasonOpen(false)}
        onSubmit={handleUnsubscribe}
      />
      <UnsubscribeByeModal
        open={byeOpen}
        onConfirm={() => {
          setByeOpen(false);
          onResetIdentity();
        }}
      />
    </div>
  );
}
