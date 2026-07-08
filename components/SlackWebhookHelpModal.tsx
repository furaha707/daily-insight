"use client";

interface SlackWebhookHelpModalProps {
  open: boolean;
  onClose: () => void;
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 130" className="w-full h-auto">
      <rect x="0" y="0" width="320" height="130" rx="8" fill="#ffffff" stroke="#D8D4CC" />
      <rect x="0" y="0" width="320" height="22" rx="8" fill="#F2F0EC" />
      <circle cx="14" cy="11" r="3.5" fill="#D8D4CC" />
      <circle cx="26" cy="11" r="3.5" fill="#D8D4CC" />
      <circle cx="38" cy="11" r="3.5" fill="#D8D4CC" />
      {children}
    </svg>
  );
}

function Step1() {
  return (
    <BrowserFrame>
      <rect x="8" y="30" width="200" height="14" rx="4" fill="#E8E5E0" />
      <text x="14" y="40" fontSize="9" fill="#6B6B63">
        api.slack.com/apps
      </text>
      <rect x="8" y="56" width="110" height="26" rx="13" fill="#C2522D" />
      <text x="63" y="73" fontSize="10" fill="#ffffff" textAnchor="middle">
        Create New App
      </text>
      <rect x="8" y="92" width="130" height="22" rx="6" fill="#FAF9F7" stroke="#A8421F" strokeWidth="2" />
      <text x="73" y="106" fontSize="9.5" fill="#C2522D" textAnchor="middle">
        From scratch
      </text>
    </BrowserFrame>
  );
}

function Step2() {
  return (
    <BrowserFrame>
      <text x="14" y="38" fontSize="9.5" fill="#1A1A18">
        App Name
      </text>
      <rect x="14" y="42" width="292" height="18" rx="4" fill="#FAF9F7" stroke="#D8D4CC" />
      <text x="20" y="55" fontSize="9" fill="#6B6B63">
        dailyInsight
      </text>
      <text x="14" y="76" fontSize="9.5" fill="#1A1A18">
        Pick a workspace
      </text>
      <rect x="14" y="80" width="292" height="18" rx="4" fill="#FAF9F7" stroke="#D8D4CC" />
      <rect x="8" y="106" width="100" height="20" rx="10" fill="#C2522D" />
      <text x="58" y="120" fontSize="9.5" fill="#ffffff" textAnchor="middle">
        Create App
      </text>
    </BrowserFrame>
  );
}

function Step3() {
  return (
    <BrowserFrame>
      <rect x="0" y="22" width="90" height="108" fill="#FAF9F7" />
      <rect x="10" y="34" width="70" height="12" rx="3" fill="#D8D4CC" />
      <rect x="10" y="52" width="70" height="12" rx="3" fill="#C2522D" />
      <text x="16" y="61" fontSize="7" fill="#ffffff">
        Incoming Webhooks
      </text>
      <rect x="10" y="70" width="70" height="12" rx="3" fill="#D8D4CC" />
      <text x="150" y="45" fontSize="9.5" fill="#1A1A18">
        Activate Incoming Webhooks
      </text>
      <rect x="150" y="56" width="36" height="18" rx="9" fill="#C2522D" />
      <circle cx="176" cy="65" r="7" fill="#ffffff" />
      <text x="150" y="90" fontSize="8" fill="#6B6B63">
        토글을 On으로 바꿔주세요
      </text>
    </BrowserFrame>
  );
}

function Step4() {
  return (
    <BrowserFrame>
      <rect x="10" y="32" width="180" height="22" rx="11" fill="#C2522D" />
      <text x="100" y="47" fontSize="8.5" fill="#ffffff" textAnchor="middle">
        Add New Webhook to Workspace
      </text>
      <text x="10" y="72" fontSize="9" fill="#1A1A18">
        채널 선택
      </text>
      <rect x="10" y="76" width="150" height="18" rx="4" fill="#FAF9F7" stroke="#D8D4CC" />
      <text x="18" y="89" fontSize="8.5" fill="#C2522D">
        # daily-insight ▾
      </text>
      <rect x="230" y="76" width="70" height="20" rx="10" fill="#C2522D" />
      <text x="265" y="90" fontSize="9" fill="#ffffff" textAnchor="middle">
        Allow
      </text>
    </BrowserFrame>
  );
}

function Step5() {
  return (
    <BrowserFrame>
      <text x="10" y="36" fontSize="8.5" fill="#1A1A18">
        Webhook URL
      </text>
      <rect x="10" y="40" width="260" height="18" rx="4" fill="#FAF9F7" stroke="#D8D4CC" />
      <text x="16" y="53" fontSize="7.5" fill="#6B6B63">
        https://hooks.slack.com/services/...
      </text>
      <rect x="277" y="40" width="18" height="18" rx="4" fill="#E8E5E0" />
      <text x="286" y="53" fontSize="8" fill="#1A1A18" textAnchor="middle">
        ⧉
      </text>
      <text x="160" y="80" fontSize="16" fill="#C2522D" textAnchor="middle">
        ↓
      </text>
      <rect x="10" y="92" width="300" height="20" rx="10" fill="#ffffff" stroke="#A8421F" strokeWidth="2" />
      <text x="16" y="106" fontSize="8" fill="#6B6B63">
        여기(데일리인사이트 폼)에 붙여넣기
      </text>
    </BrowserFrame>
  );
}

const STEPS: { title: string; detail: React.ReactNode; Illustration: () => React.JSX.Element }[] = [
  {
    title: "Slack API 앱 만들기",
    detail: (
      <>
        <a
          href="https://api.slack.com/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          api.slack.com/apps
        </a>{" "}
        접속 → Create New App → From scratch 선택
      </>
    ),
    Illustration: Step1,
  },
  {
    title: "앱 이름 / 워크스페이스 지정",
    detail: "원하는 앱 이름을 입력하고, 알림을 받을 워크스페이스를 선택한 뒤 Create App",
    Illustration: Step2,
  },
  {
    title: "Incoming Webhooks 켜기",
    detail: "왼쪽 메뉴에서 Incoming Webhooks 선택 → 상단 토글을 On으로 전환",
    Illustration: Step3,
  },
  {
    title: "채널 선택하고 웹훅 추가",
    detail: "Add New Webhook to Workspace 클릭 → 알림 받을 채널 선택 → Allow",
    Illustration: Step4,
  },
  {
    title: "URL 복사해서 붙여넣기",
    detail: "발급된 https://hooks.slack.com/services/... 형태의 URL을 복사해서 이 폼의 입력창에 붙여넣기",
    Illustration: Step5,
  },
];

export default function SlackWebhookHelpModal({
  open,
  onClose,
}: SlackWebhookHelpModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-lg bg-canvas shadow-elevated p-lg text-left animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-title-lg text-ink mb-xxs">
          Slack Webhook URL 발급받는 법
        </h2>
        <p className="text-body-sm text-ink-muted mb-lg">
          5단계면 끝나요. 순서대로 따라해주세요.
        </p>

        <div className="space-y-lg">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-md border border-border p-md">
              <div className="flex items-center gap-sm mb-sm">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-on-primary text-fine-print flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-title-sm text-ink">{step.title}</span>
              </div>
              <div className="mb-sm">
                <step.Illustration />
              </div>
              <p className="text-fine-print text-ink-muted">{step.detail}</p>
            </div>
          ))}
        </div>

        <a
          href="https://api.slack.com/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mt-lg rounded-md border border-border bg-canvas text-ink text-center py-sm text-button"
        >
          api.slack.com/apps 바로가기
        </a>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 mt-sm rounded-md bg-primary text-on-primary text-button active:bg-primary-hover active:scale-[0.98] transition-colors duration-fast ease-brand"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
