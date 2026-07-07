"use client";

import { useEffect, useState } from "react";
import CategorySelector from "@/components/CategorySelector";
import SlackWebhookHelpModal from "@/components/SlackWebhookHelpModal";
import SubscribeSuccessModal from "@/components/SubscribeSuccessModal";
import { extractSlackTeamId } from "@/lib/slack";
import { DEFAULT_MESSAGE_TEMPLATE } from "@/lib/constants";

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
  checkingSubscription: boolean;
  isSubscribed: boolean;
  onSubscribed: () => void;
  onUnsubscribed: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

const TEMPLATE_PREVIEW = DEFAULT_MESSAGE_TEMPLATE.replace(
  "{title}",
  "아티클 제목"
).replace("{url}", "아티클 url");

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
  checkingSubscription,
  isSubscribed,
  onSubscribed,
  onUnsubscribed,
}: NotificationSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [origin, setOrigin] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const teamId = extractSlackTeamId(webhookUrl.trim());
  const quickLinkPreview = teamId ? `${origin}/?teamId=${teamId}` : "";

  const handleSave = async () => {
    if (categories.length === 0) {
      setStatus({ type: "error", message: "관심 카테고리를 먼저 선택해주세요." });
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "저장에 실패했습니다.");

      onUserIdChange(data.userId);
      onSubscribed();
      setStatus({
        type: "success",
        message: `매일 ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} 구독 설정됨`,
      });
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

  const handleUnsubscribe = async () => {
    if (!userId) return;

    setUnsubscribing(true);
    setStatus(null);

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("구독 해지에 실패했습니다.");

      onUnsubscribed();
      setStatus({ type: "success", message: "구독을 해지했어요." });
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
    <div className="w-full max-w-[560px] mx-auto rounded-lg border border-hairline bg-canvas p-lg text-left">
      <div className="rounded-md bg-surface-pearl px-md py-sm mb-lg">
        {checkingSubscription ? (
          <p className="text-caption text-ink-muted-80">구독 상태 확인 중...</p>
        ) : isSubscribed ? (
          <p className="text-caption-strong text-primary">✅ 구독중이십니다</p>
        ) : (
          <p className="text-caption-strong text-ink-muted-80">
            미구독 중이십니다. 데일리 인사이트 받아보실래요?
          </p>
        )}
      </div>

      <h3 className="text-tagline text-ink mb-xxs">아티클 구독하기</h3>
      <p className="text-caption text-ink-muted-48 mb-lg">
        관심 카테고리를 고르고 Slack을 연결하면, 설정한 시각에 아직 안 읽은 아티클을
        골라 매일 보내드려요.
      </p>

      <div className="mb-lg">
        <span className="block text-caption-strong text-ink mb-sm">
          관심 카테고리
        </span>
        <CategorySelector selected={categories} onToggle={onToggleCategory} />
      </div>

      <label className="block mb-lg">
        <span className="flex items-center gap-xxs mb-xxs">
          <span className="text-caption-strong text-ink">
            Slack Incoming Webhook URL
          </span>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Webhook URL 발급 방법 보기"
            className="h-4 w-4 rounded-full bg-hairline text-ink-muted-80 text-[10px] leading-4 flex items-center justify-center"
          >
            ?
          </button>
        </span>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => onWebhookUrlChange(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          className="w-full rounded-md border border-hairline px-md py-sm text-caption text-ink placeholder:text-ink-muted-48 focus:border-primary"
        />
      </label>

      <label className="block mb-lg">
        <span className="block text-caption-strong text-ink mb-xxs">
          추가로 포함할 링크 (선택)
        </span>
        <textarea
          value={extraLinks}
          onChange={(e) => onExtraLinksChange(e.target.value)}
          rows={3}
          placeholder="예: https://our-team-wiki.com"
          className="w-full rounded-md border border-hairline px-md py-sm text-caption text-ink placeholder:text-ink-muted-48 focus:border-primary resize-none"
        />
        <span className="block text-fine-print text-ink-muted-48 mt-xxs">
          매일 추천 아티클과 함께 이 내용도 그대로 포함해서 보내드려요.
        </span>
      </label>

      <div className="block mb-lg">
        <span className="block text-caption-strong text-ink mb-xxs">
          최종 발송 미리보기
        </span>
        <div className="w-full rounded-md border border-hairline bg-canvas-parchment px-md py-sm text-caption text-ink-muted-80">
          <p className="whitespace-pre-line">
            {TEMPLATE_PREVIEW}
            {extraLinks.trim() && `\n\n${extraLinks.trim()}`}
          </p>
          <p className="mt-sm">
            {teamId ? (
              <a
                href={quickLinkPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                데일리인사이트 바로가기
              </a>
            ) : (
              <span className="text-ink-muted-48">
                데일리인사이트 바로가기 (Webhook URL을 입력하면 링크가 활성화돼요)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-sm mb-lg">
        <span className="text-caption-strong text-ink">발송 시각</span>
        <select
          value={hour}
          onChange={(e) => onHourChange(Number(e.target.value))}
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
          onChange={(e) => onMinuteChange(Number(e.target.value))}
          className="rounded-md border border-hairline px-sm py-xxs text-caption text-ink"
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
        className="w-full rounded-pill bg-primary text-white py-sm text-body active:scale-95 transition-transform disabled:opacity-50"
      >
        {loading ? "저장 중..." : isSubscribed ? "구독 정보 수정" : "구독하기"}
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

      {isSubscribed && (
        <div className="mt-lg pt-lg border-t border-hairline text-center">
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={unsubscribing}
            className="text-fine-print text-ink-muted-48 underline disabled:opacity-50"
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
      />
    </div>
  );
}
