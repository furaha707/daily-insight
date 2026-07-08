"use client";

interface UnsubscribeByeModalProps {
  open: boolean;
  onConfirm: () => void;
}

export default function UnsubscribeByeModal({
  open,
  onConfirm,
}: UnsubscribeByeModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-md"
      onClick={onConfirm}
    >
      <div
        className="w-full max-w-[360px] rounded-lg bg-canvas shadow-elevated px-xl py-xxl text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[40px] leading-none mb-lg">👋</p>
        <h2 className="text-title-lg text-ink mb-xxs">구독을 해지했어요</h2>
        <p className="text-body-sm text-ink-muted mb-lg">
          다음에 또 만나요! 언제든 다시 구독하실 수 있어요.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full h-11 rounded-md bg-primary text-on-primary text-button active:bg-primary-hover active:scale-[0.98] transition-colors duration-fast ease-brand"
        >
          확인
        </button>
      </div>
    </div>
  );
}
