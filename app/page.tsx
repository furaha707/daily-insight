"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResultModal from "@/components/ResultModal";
import NotificationSettingsForm from "@/components/NotificationSettingsForm";
import { USER_ID_STORAGE_KEY } from "@/lib/constants";
import type { NotificationSettings, SelectArticleResponse } from "@/types";

// 실제 수료일. 매일 자정(Asia/Seoul) 기준으로 D-day를 다시 계산한다.
const COMPLETION_DATE = "2026-10-13";

function getDdayLabel() {
  const target = new Date(`${COMPLETION_DATE}T00:00:00+09:00`).getTime();
  const nowSeoulDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const nowSeoul = new Date(`${nowSeoulDateStr}T00:00:00+09:00`).getTime();
  const diffDays = Math.round((target - nowSeoul) / 86400000);

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return "D-DAY";
  return null; // 수료일이 지났으면 D-day 표기를 생략한다.
}

function HomePageContent() {
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<SelectArticleResponse | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState("");
  const [extraLinks, setExtraLinks] = useState("");
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [ddayLabel, setDdayLabel] = useState<string | null>(null);

  useEffect(() => {
    setDdayLabel(getDdayLabel());
  }, []);

  useEffect(() => {
    // 페이지에 들어올 때마다 신원을 판별한다: teamId(URL, 예: 구독해지 후 리다이렉트) 우선,
    // 없으면 브라우저에 저장된 userId로 보조 판별한다.
    const teamIdFromUrl = searchParams.get("teamId");
    const localUserId = localStorage.getItem(USER_ID_STORAGE_KEY);

    const query = teamIdFromUrl
      ? `teamId=${encodeURIComponent(teamIdFromUrl)}`
      : localUserId
        ? `userId=${encodeURIComponent(localUserId)}`
        : null;

    if (!query) {
      setUserId(localUserId);
      setCheckingSubscription(false);
      return;
    }

    fetch(`/api/notifications?${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.settings) return;
        const s: NotificationSettings = data.settings;
        setIsSubscribed(s.notificationEnabled);
        setSentCount(s.sentCount);

        // 미구독 상태면 이전 값(카테고리/웹훅/시각 등)을 보여주지 않고 폼을 비운다.
        // 구독중일 때만 기존 값을 그대로 이어서 보여준다.
        if (s.notificationEnabled) {
          setSelected(s.categories);
          setWebhookUrl(s.slackWebhookUrl);
          setExtraLinks(s.extraLinks);
          setHour(s.sendHour);
          setMinute(s.sendMinute);
          setWeekdays(s.sendWeekdays);
        }

        if (data.userId) {
          localStorage.setItem(USER_ID_STORAGE_KEY, data.userId);
          setUserId(data.userId);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSubscription(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistUserId = (id: string) => {
    localStorage.setItem(USER_ID_STORAGE_KEY, id);
    setUserId(id);
  };

  const resetIdentity = () => {
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    setUserId(null);

    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url.toString());
  };

  const toggleCategory = (category: string) => {
    setSelected((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const scrollToForm = () => {
    const el = document.getElementById("subscribe-section");
    if (!el) return;
    // 상단 고정 헤더(h-16 = 64px)에 폼 카드의 맨 위 테두리가 가리지 않도록 오프셋을 둔다.
    const headerOffset = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/articles/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selected, userId: userId ?? undefined }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "아티클을 선정하지 못했습니다.");
      }

      const data: SelectArticleResponse = await res.json();
      persistUserId(data.userId);
      setResult(data);
      setModalOpen(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-canvas overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary opacity-20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary opacity-10 blur-[120px]"
      />

      <section className="relative min-h-screen flex flex-col justify-center mx-auto max-w-[1280px] px-lg md:px-xl text-left">
        <h1 className="relative break-keep text-[40px] leading-[1.15] tracking-[-0.02em] md:text-[88px] md:leading-[1.05] md:tracking-[-0.03em] font-medium text-ink mb-md max-w-[1100px]">
          기획력은 <br />
          인사이트의 총량입니다.
        </h1>
        <p className="relative text-body-sm md:text-body text-ink-muted">
          아티클 카타, 7/27 종료
        </p>
        <p className="relative text-title-md md:text-title-lg text-primary font-medium mt-xxs">
          {ddayLabel
            ? `${ddayLabel} 수료까지 최신 인사이트를 받아보세요!`
            : "수료까지 최신 인사이트를 받아보세요!"}
        </p>
        <button
          type="button"
          onClick={scrollToForm}
          className="relative mt-lg inline-flex w-fit items-center gap-xxs rounded-pill bg-primary text-on-primary text-button px-lg py-sm active:bg-primary-hover active:scale-[0.98] transition-colors duration-fast ease-brand"
        >
          지금 신청하기
          <span aria-hidden>→</span>
        </button>

        {error && (
          <p className="relative mt-lg text-body-sm text-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section id="subscribe-section" className="relative mx-auto max-w-[720px] px-lg pb-section">
        <NotificationSettingsForm
          userId={userId}
          categories={selected}
          onToggleCategory={toggleCategory}
          onUserIdChange={persistUserId}
          webhookUrl={webhookUrl}
          onWebhookUrlChange={setWebhookUrl}
          extraLinks={extraLinks}
          onExtraLinksChange={setExtraLinks}
          hour={hour}
          onHourChange={setHour}
          minute={minute}
          onMinuteChange={setMinute}
          weekdays={weekdays}
          onToggleWeekday={toggleWeekday}
          checkingSubscription={checkingSubscription}
          isSubscribed={isSubscribed}
          sentCount={sentCount}
          onSubscribed={() => setIsSubscribed(true)}
          onUnsubscribed={() => setIsSubscribed(false)}
          onResetIdentity={resetIdentity}
        />
      </section>

      <ResultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        result={result}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
