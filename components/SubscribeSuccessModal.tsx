"use client";

import { formatWeekdaysLabel } from "@/lib/constants";

interface SubscribeSuccessModalProps {
  open: boolean;
  onClose: () => void;
  hour: number;
  minute: number;
  weekdays: number[];
}

const CONFETTI_COLORS = ["#C2522D", "#D4A574", "#4B7A51", "#A8421F", "#8C6E4A"];

const CONFETTI = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const distance = 60 + (i % 3) * 20;
  return {
    tx: Math.round(Math.cos(angle) * distance),
    ty: Math.round(Math.sin(angle) * distance),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (i % 4) * 40,
  };
});

export default function SubscribeSuccessModal({
  open,
  onClose,
  hour,
  minute,
  weekdays,
}: SubscribeSuccessModalProps) {
  if (!open) return null;

  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const weekdaysLabel = formatWeekdaysLabel(weekdays);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-lg bg-canvas shadow-elevated px-xl py-xxl text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-16 w-16 mx-auto mb-lg">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full animate-confetti-burst"
              style={
                {
                  backgroundColor: c.color,
                  animationDelay: `${c.delay}ms`,
                  "--tx": `${c.tx}px`,
                  "--ty": `${c.ty}px`,
                } as React.CSSProperties
              }
            />
          ))}
          <div className="relative h-16 w-16 rounded-full bg-success flex items-center justify-center animate-celebrate-pop">
            <span className="text-on-primary text-[28px] leading-none">✓</span>
          </div>
        </div>

        <h2 className="text-title-lg text-ink mb-xxs">구독 완료!</h2>
        <p className="text-body-sm text-ink-muted mb-lg">
          {weekdaysLabel} {time}에 Slack으로 보내드릴게요.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-md bg-primary text-on-primary text-button active:bg-primary-hover active:scale-[0.98] transition-colors duration-fast ease-brand"
        >
          확인
        </button>
      </div>
    </div>
  );
}
