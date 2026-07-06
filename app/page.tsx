"use client";

import { useEffect, useState } from "react";
import CategorySelector from "@/components/CategorySelector";
import ResultModal from "@/components/ResultModal";
import type { SelectArticleResponse } from "@/types";

const USER_ID_STORAGE_KEY = "dailyinsight_user_id";

export default function HomePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<SelectArticleResponse | null>(null);

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
      const userId = localStorage.getItem(USER_ID_STORAGE_KEY) ?? undefined;
      const res = await fetch("/api/articles/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selected, userId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "아티클을 선정하지 못했습니다.");
      }

      const data: SelectArticleResponse = await res.json();
      localStorage.setItem(USER_ID_STORAGE_KEY, data.userId);
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
      <section className="mx-auto max-w-[720px] px-lg pt-[64px] pb-section text-center">
        <h1 className="text-display-lg sm:text-hero-display text-ink mb-lg">
          새로운 인사이트를 얻을 수 있는
          <br />
          아티클을 선정해드려요
        </h1>
        <p className="text-lead text-ink-muted-80 mb-xxl">
          관심가는 카테고리를 선택해주세요
        </p>

        <CategorySelector selected={selected} onToggle={toggleCategory} />

        <div className="mt-xxl relative inline-block">
          {selected.length > 0 && !loading && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-pill animate-pulse-ring pointer-events-none"
            />
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selected.length === 0 || loading}
            className={[
              "relative rounded-pill px-xl py-sm text-body transition-transform active:scale-95",
              selected.length === 0 || loading
                ? "bg-ink-muted-48 text-white cursor-not-allowed"
                : "bg-primary text-white",
            ].join(" ")}
          >
            {loading ? "선정 중..." : "신청하기"}
          </button>
        </div>

        {error && (
          <p className="mt-lg text-caption text-red-500" role="alert">
            {error}
          </p>
        )}
      </section>

      <ResultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        result={result}
      />
    </div>
  );
}
