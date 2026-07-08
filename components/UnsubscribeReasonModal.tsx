"use client";

import { useState } from "react";
import { UNSUBSCRIBE_REASONS } from "@/lib/constants";

interface UnsubscribeReasonModalProps {
  open: boolean;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (reason: string, customReason: string) => void;
}

export default function UnsubscribeReasonModal({
  open,
  submitting,
  onCancel,
  onSubmit,
}: UnsubscribeReasonModalProps) {
  const [reason, setReason] = useState<string>(UNSUBSCRIBE_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  if (!open) return null;

  const isCustom = reason === "기타";
  const canSubmit = !isCustom || customReason.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[400px] rounded-lg bg-canvas shadow-elevated p-xl text-left animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-title-lg text-ink mb-lg">
          어떤 부분이 불편하셨나요?
        </h2>

        <div className="space-y-sm mb-lg">
          {UNSUBSCRIBE_REASONS.map((option) => (
            <label
              key={option}
              className={[
                "flex items-center gap-sm rounded-md border px-md py-sm cursor-pointer transition-colors duration-fast ease-brand",
                reason === option
                  ? "border-primary bg-surface-2"
                  : "border-border",
              ].join(" ")}
            >
              <input
                type="radio"
                name="unsubscribe-reason"
                value={option}
                checked={reason === option}
                onChange={() => setReason(option)}
                className="accent-[#E0693C]"
              />
              <span className="text-body-sm text-ink">{option}</span>
            </label>
          ))}
        </div>

        {isCustom && (
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="사유를 직접 입력해주세요"
            className="w-full rounded-md border border-border bg-canvas px-md py-sm text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-lg"
          />
        )}

        <div className="flex gap-sm">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-md border border-border text-ink text-button"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={() => onSubmit(reason, customReason.trim())}
            className="flex-1 h-11 rounded-md bg-primary text-on-primary text-button active:bg-primary-hover active:scale-[0.98] transition-colors duration-fast ease-brand disabled:opacity-50"
          >
            {submitting ? "제출 중..." : "구독 해지하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
