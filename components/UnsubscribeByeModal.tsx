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
        className="w-full max-w-[360px] rounded-lg bg-canvas px-xl py-xxl text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[40px] leading-none mb-lg">👋</p>
        <h2 className="text-display-md text-ink mb-xxs">구독을 해지했어요</h2>
        <p className="text-body text-ink-muted-80 mb-lg">
          다음에 또 만나요! 언제든 다시 구독하실 수 있어요.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-pill bg-primary text-white py-sm text-body active:scale-95 transition-transform"
        >
          확인
        </button>
      </div>
    </div>
  );
}
