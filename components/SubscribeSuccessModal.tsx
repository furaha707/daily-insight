"use client";

interface SubscribeSuccessModalProps {
  open: boolean;
  onClose: () => void;
  hour: number;
  minute: number;
}

const CONFETTI_COLORS = ["#0066cc", "#2997ff", "#ffb800", "#ff5f5f", "#34c759"];

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
}: SubscribeSuccessModalProps) {
  if (!open) return null;

  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-lg bg-canvas px-xl py-xxl text-center animate-scale-in"
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
          <div className="relative h-16 w-16 rounded-full bg-primary flex items-center justify-center animate-celebrate-pop">
            <span className="text-white text-[28px] leading-none">✓</span>
          </div>
        </div>

        <h2 className="text-display-md text-ink mb-xxs">구독 완료!</h2>
        <p className="text-body text-ink-muted-80 mb-lg">
          매일 {time}에 Slack으로 보내드릴게요.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-pill bg-primary text-white py-sm text-body active:scale-95 transition-transform"
        >
          확인
        </button>
      </div>
    </div>
  );
}
