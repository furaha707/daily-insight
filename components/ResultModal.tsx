"use client";

import { useEffect } from "react";
import type { SelectArticleResponse } from "@/types";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  result: SelectArticleResponse | null;
}

export default function ResultModal({ open, onClose, result }: ResultModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const article = result?.article ?? null;
  const exhausted = result?.exhausted ?? false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-lg bg-canvas shadow-elevated px-xl py-xxl text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {article ? (
          <>
            <p className="text-caption text-success mb-xs">신청 완료 ✅</p>
            <h2 className="text-title-lg text-ink mb-lg">
              이 아티클을 추천드려요
            </h2>

            <div className="rounded-md bg-surface-2 p-lg text-left mb-lg">
              <p className="text-title-sm text-ink mb-sm">{article.title}</p>
              <div className="flex flex-wrap gap-xxs mb-sm">
                {article.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-pill bg-surface-1 px-sm py-xxs text-fine-print text-ink-muted"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink text-body-sm underline break-all"
              >
                {article.url}
              </a>
            </div>
          </>
        ) : exhausted ? (
          <>
            <p className="text-caption text-success mb-xs">신청 완료 ✅</p>
            <h2 className="text-title-lg text-ink mb-lg">
              선택한 카테고리를 모두 읽으셨어요
            </h2>
            <p className="text-body-sm text-ink-muted mb-lg">
              해당 카테고리의 아티클을 이미 다 받아보셨어요.
              <br />
              다른 카테고리를 선택해 다시 시도해보세요 🎉
            </p>
          </>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border bg-canvas text-ink px-lg py-sm text-button active:scale-95 transition-transform duration-fast ease-brand"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
