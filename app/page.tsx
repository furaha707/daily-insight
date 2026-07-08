"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResultModal from "@/components/ResultModal";
import NotificationSettingsForm from "@/components/NotificationSettingsForm";
import { USER_ID_STORAGE_KEY } from "@/lib/constants";
import type { NotificationSettings, SelectArticleResponse } from "@/types";

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
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

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

        // 미구독 상태면 이전 값(카테고리/웹훅/시각 등)을 보여주지 않고 폼을 비운다.
        // 구독중일 때만 기존 값을 그대로 이어서 보여준다.
        if (s.notificationEnabled) {
          setSelected(s.categories);
          setWebhookUrl(s.slackWebhookUrl);
          setExtraLinks(s.extraLinks);
          setHour(s.sendHour);
          setMinute(s.sendMinute);
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
    <div className="min-h-screen bg-canvas-parchment">
      <section className="mx-auto max-w-[820px] px-lg pt-[64px] pb-xxl text-center">
        <h1 className="text-display-lg sm:text-hero-display text-ink mb-lg">
          새로운 인사이트를 얻을 수 있는
          <br />
          아티클을 선정해드려요
        </h1>
        <p className="text-lead text-ink-muted-80">
          관심가는 카테고리를 선택해주세요
        </p>

        {error && (
          <p className="mt-lg text-caption text-red-500" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="mx-auto max-w-[720px] px-lg pb-section">
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
          checkingSubscription={checkingSubscription}
          isSubscribed={isSubscribed}
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
