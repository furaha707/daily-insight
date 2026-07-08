# dailyInsight

매일 관심 카테고리에 맞는 아티클을 1개씩, 중복 없이 추천해주는 테스트 서비스입니다.
Next.js 15 (App Router) + Tailwind CSS + Supabase로 구현했고, 설정한 시각에 Slack으로 자동 발송하는 기능도 있습니다.

## 1. Supabase 테이블/보안 설정 (필수, 최초 1회)

Supabase 대시보드 → **SQL Editor**에서 아래 순서로 실행하세요.

1. **신규 설치라면** [`database/schema.sql`](database/schema.sql) 전체 실행 → `users`, `articles`, `sent_log` 테이블 + RLS 생성 (Slack 알림 컬럼 포함, 최신 버전)
2. [`database/seed.sql`](database/seed.sql) 실행 → 아티클 103건 삽입 (재실행해도 중복 안 쌓임)
3. **이미 이전 버전으로 설치되어 있었다면** [`database/migration-notifications.sql`](database/migration-notifications.sql) 실행 → `users`에 Slack 알림 컬럼 추가 + `anon` 직접 접근 차단
4. [`database/migration-unsubscribe.sql`](database/migration-unsubscribe.sql) 실행 → `users.slack_team_id` 컬럼 추가 (구독 해지 링크용, 신규 설치는 `schema.sql`에 이미 포함되어 있어 생략 가능)
5. [`database/migration-extra-links.sql`](database/migration-extra-links.sql) 실행 → `users.extra_links` 컬럼 추가 (신규 설치는 `schema.sql`에 이미 포함되어 있어 생략 가능)
6. [`database/migration-weekdays.sql`](database/migration-weekdays.sql) 실행 → `users.send_weekdays` 컬럼 추가 (발송 요일 선택, 신규 설치는 `schema.sql`에 이미 포함되어 있어 생략 가능)
7. [`database/migration-unsubscribe-feedback.sql`](database/migration-unsubscribe-feedback.sql) 실행 → `unsubscribe_feedback` 테이블 생성 (구독 해지 사유 설문, 신규 설치는 `schema.sql`에 이미 포함되어 있어 생략 가능)

> ⚠️ `seed.sql`을 실수로 여러 번 실행해 `articles`에 중복이 쌓였다면 [`database/cleanup-duplicates.sql`](database/cleanup-duplicates.sql)을 실행해 정리하세요.

### 보안 모델

이 앱은 브라우저가 Supabase에 직접 접근하지 않습니다. 모든 읽기/쓰기는 Next.js 서버(API Route)가 **service_role 키**로 대신 수행하고, `anon`(publishable) 키에는 아무 테이블 접근 권한도 주지 않습니다. Slack Webhook URL처럼 민감한 값을 다루기 때문에, 공개된 publishable key로 REST를 직접 두드려도 데이터가 노출되지 않도록 이렇게 잠가뒀습니다.

- Supabase 대시보드 → **Settings → API** → `service_role` **secret** 값을 복사
- `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY`에 붙여넣기 (절대 `NEXT_PUBLIC_` 접두사를 붙이지 말 것 — 브라우저에 노출되면 DB 전체가 뚫립니다)

## 2. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속.

## 3. 메인 화면 동작 방식 (즉시 추천)

- 메인 화면에서 카테고리를 다중 선택하고 **신청하기**를 누르면 `/api/articles/select`로 요청합니다.
- 서버는 브라우저에 저장된 익명 사용자 id(`localStorage`)를 기준으로 `users` 테이블에 사용자를 생성/갱신합니다.
- 선택한 카테고리와 겹치면서(`categories && selected`) 해당 사용자에게 **아직 발송되지 않은**(`sent_log` 기준) 아티클 중 1개를 무작위로 골라 반환하고, `sent_log`에 발송 기록을 남깁니다.
- 후보가 없으면 모달에 "모두 읽었어요" 안내가 표시됩니다.

## 4. Slack 자동 발송 (구독)

메인 화면의 **"아티클 구독하기"** 폼 하나에 카테고리 선택과 Slack 설정이 합쳐져 있습니다. 카테고리를 고르고 Webhook URL / 발송 시각을 입력해 **구독하기**를 누르면 바로 구독이 시작되고, 매일 그 시각에 서버가 카테고리에 맞는 미발송 아티클 1건을 Slack으로 보내줍니다.

on/off 토글은 없습니다 — 폼을 저장하는 순간이 곧 "구독"이고, 끄는 것은 오직 폼 맨 아래의 **구독 해지하기** 버튼으로만 가능합니다(4-6 참고). Slack 메시지에는 해지 링크가 없습니다 — 대신 "데일리인사이트 바로가기" 링크가 붙어서, 그걸 눌러 사이트로 돌아온 뒤 폼에서 직접 해지하는 구조입니다.

### 4-0. 페이지 진입 시 구독 상태 판별

폼 맨 위에 항상 현재 구독 상태("✅ 구독중 (n회 발송됨)" / "미구독중입니다. 바로 신청해보세요!")가 바로 보입니다. 별도 아이콘이나 클릭이 필요 없습니다. `n`회는 `sent_log`에서 해당 사용자의 발송 기록 개수를 그대로 센 값이라, 구독을 해지했다가 다시 구독해도 초기화되지 않고 계속 누적됩니다. 판별 순서는:

1. URL의 `?teamId=` 쿼리 (예: Slack 메시지의 "데일리인사이트 바로가기" 링크를 누르면 `/?teamId=...`로 들어오고, 이 값으로 즉시 확인)
2. 없으면 브라우저 `localStorage`의 `userId`
3. 둘 다 없으면 "미구독"으로 기본 표시

구독중일 때는 하단 버튼도 **"구독 정보 수정"**으로, 미구독일 때는 **"구독하기"**로 바뀝니다.

### 4-1. Slack Incoming Webhook 발급

1. [https://api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**
2. 앱 이름 입력, 알림을 받을 워크스페이스 선택
3. 왼쪽 메뉴 **Incoming Webhooks** → 토글 On
4. 하단 **Add New Webhook to Workspace** → 알림 받을 채널 선택 → Allow
5. 발급된 `https://hooks.slack.com/services/...` URL을 복사해서 웹 폼의 "Slack Incoming Webhook URL"에 입력

### 4-2. 메시지 템플릿 (고정, 수정 불가)

```
📰 오늘의 인사이트 아티클이에요!

{title}
{url}
```

이 문구는 고정이며 사용자가 바꿀 수 없습니다. 서버(`PUT /api/notifications`)도 클라이언트가 보낸 커스텀 템플릿 값을 무시하고 항상 이 고정 문구를 저장하므로, API를 직접 호출해도 우회할 수 없습니다. 폼에는 이 템플릿을 별도로 보여주는 영역이 없고, 아래 "최종 발송 미리보기"에서만 확인할 수 있습니다.

이 아래로 폼에 몇 가지가 더 있습니다:

- **아티클과 함께 받고 싶은 메세지 (선택, `users.extra_links`)**: 아티클과 별개로 매일 함께 보내고 싶은 링크/메모를 자유롭게 입력할 수 있습니다. Edge Function이 발송 시 그대로 이어붙입니다.
- **Preview**: 실제 Slack 메시지처럼 앱 아이콘/이름/발송 시각/본문을 그대로 흉내낸 미리보기입니다. 예시 제목(고정 문구)으로 보여주는 화면 전용 표시이며, 실제 발송 템플릿(`DEFAULT_MESSAGE_TEMPLATE`)과는 별개입니다.
- **발송 요일**: 월/화/수/목/금 중 원하는 요일을 체크박스로 선택합니다(`users.send_weekdays`, ISO 요일 번호 1~5). 기본값은 평일 전체입니다. 구독 완료 상태 메시지/모달("OO 13:30 구독 설정됨")의 "OO" 자리에는 "매일"이 아니라 실제로 선택한 요일들이 콤마로 나열됩니다(예: "월,수,금").

### 4-3. Edge Function 배포

실제 매칭/발송 로직은 [`supabase/functions/send-daily-articles/index.ts`](supabase/functions/send-daily-articles/index.ts)에 있습니다. Supabase CLI로 배포해야 합니다.

```bash
npm install -g supabase
supabase login
supabase link --project-ref kemmkpwcpuapdynhzrsg
supabase functions deploy send-daily-articles
```

(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 런타임에 자동으로 주입되므로 별도 secret 설정이 필요 없습니다.)

메시지 하단 "바로가기" 링크를 만들려면 배포된 Next.js 앱의 주소를 secret으로 등록해야 합니다:

```bash
supabase secrets set APP_BASE_URL=https://your-app.vercel.app
```

배포 후 아래처럼 수동으로 호출해서 정상 동작하는지 확인할 수 있습니다 (본인 서비스 롤 키로 교체):

```bash
curl -X POST https://kemmkpwcpuapdynhzrsg.supabase.co/functions/v1/send-daily-articles \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

### 4-4. Cron 스케줄 등록 (10분마다 실행)

**옵션 A. Supabase 대시보드 (더 간단)**
대시보드 → **Integrations → Cron Jobs** → New Cron Job → Type: *Supabase Edge Function* 선택 → `send-daily-articles` 지정 → 주기 `*/10 * * * *`

**옵션 B. SQL Editor**
[`database/cron-setup.sql`](database/cron-setup.sql)의 `<SERVICE_ROLE_KEY>` 부분을 실제 값으로 바꿔서 실행하세요.

### 4-5. 시각/요일 매칭 방식 (알아두면 좋은 것)

- 함수는 10분마다 실행되며, 현재 시각(Asia/Seoul, 10분 단위로 내림)과 `users.send_hour`/`send_minute`가 정확히 일치하는 사용자만 골라 발송합니다. 그래서 웹 폼의 "분" 선택도 10분 단위(00/10/20/.../50)로만 되어 있습니다.
- **발송 요일 이중 체크**: 현재 날짜의 ISO 요일(1=월~7=일)을 계산해, DB 쿼리 단계(`.contains("send_weekdays", [isoWeekday])`)와 애플리케이션 코드 단계(`targets` 필터링) 양쪽에서 사용자가 선택한 `send_weekdays`에 오늘이 포함되는지 다시 한번 확인합니다. 시간만 맞고 요일이 다르면 발송하지 않습니다.
- `last_notified_date`로 하루 1회만 발송되도록 막습니다(같은 날 cron이 여러 번 겹쳐 돌아도 중복 발송 없음).
- 카테고리에 맞는 미발송 아티클이 없으면 그냥 조용히 스킵합니다(Slack에 "없어요" 메시지를 보내지 않음).

### 4-6. 구독 해지

구독 해지는 **오직 폼 맨 아래의 "구독 해지하기" 버튼**으로만 가능합니다(구독중일 때만 작게 노출 — 일부러 찾기 어렵게 만들지 않았습니다, 다크패턴은 지원하지 않습니다). Slack 메시지에는 해지 링크가 없고, 대신 사이트로 돌아오는 "데일리인사이트 바로가기" 링크만 붙습니다.

버튼을 누르면 바로 해지되지 않고, 먼저 "어떤 부분이 불편하셨나요?" 사유 설문 모달([components/UnsubscribeReasonModal.tsx](components/UnsubscribeReasonModal.tsx))이 뜹니다. 4가지 선택지(원하는 아티클이 부족해요 / 기존 알림이 많아요 / 다른 학업에 더 집중하고 싶어요 / 기타 - 직접 입력) 중 하나를 고르고 제출해야 실제 해지가 진행됩니다.

제출하면 `POST /api/unsubscribe`에 `userId`와 선택한 `reason`(+ "기타"인 경우 `customReason`)을 보내 두 가지를 처리합니다: (1) `users.notification_enabled = false`로 끄고 — **행을 삭제하지 않습니다**(삭제하면 `sent_log`도 함께 사라져서 재구독 시 이미 읽은 아티클이 중복으로 다시 갈 수 있기 때문), (2) `unsubscribe_feedback` 테이블에 사유를 별도 행으로 쌓습니다(해지/재구독을 반복해도 삭제되지 않는 통계용 로그). Supabase 대시보드의 Table Editor에서 `unsubscribe_feedback`을 열면 그동안 쌓인 해지 사유를 바로 확인할 수 있습니다.

**Slack unfurl 관련 주의**: Slack은 메시지 속 URL을 미리보기(unfurl)하려고 서버가 그 링크를 자동으로 한 번 가져가 봅니다. Edge Function이 Slack에 보내는 payload에 `unfurl_links: false, unfurl_media: false`를 넣어, 이런 자동 요청이 불필요하게 발생하는 것을 막습니다.
- Webhook URL을 저장할 때 서버가 URL에서 워크스페이스(Team) ID를 자동으로 추출해 `users.slack_team_id`에 저장합니다(사용자 입력 아님). "데일리인사이트 바로가기" 링크와 페이지 진입 시 구독 상태 판별(4-0)에 이 값이 쓰입니다.

## 5. 디렉토리 구조

```
app/
  layout.tsx                    전역 레이아웃 (상단 네비게이션)
  page.tsx                      메인 화면 - 진입 시 teamId(URL)->userId(localStorage) 순으로 구독 상태 판별
  globals.css                   Tailwind 전역 스타일
  api/articles/select/          즉시 추천 API Route
  api/notifications/            구독 설정 조회/저장 API Route (저장 = 항상 구독 on)
  api/unsubscribe/              구독 해지 API Route (POST, userId 기반, 폼의 해지 버튼 전용)
components/
  CategorySelector.tsx          카테고리 다중 선택 UI
  ResultModal.tsx                추천 결과 모달
  NotificationSettingsForm.tsx  구독 상태 표시 + 카테고리 + Slack 설정 통합 폼 (템플릿은 읽기 전용)
  SlackWebhookHelpModal.tsx     Webhook URL 발급 튜토리얼 모달
  SubscribeSuccessModal.tsx     구독 완료 축하 모달
  UnsubscribeReasonModal.tsx    구독 해지 사유 설문 모달 (해지 직전에 노출)
  UnsubscribeByeModal.tsx       구독 해지 완료 인사 모달
lib/
  supabaseAdmin.ts               서버 전용 Supabase 클라이언트 (service_role)
  categories.ts                  카테고리 목록
  slack.ts                       Webhook URL에서 워크스페이스 ID 추출
  constants.ts                   localStorage 키, 발송 요일 목록/포맷터, 해지 사유 목록, 고정 메시지 템플릿
types/
  index.ts                       DB/응답 타입
database/
  schema.sql                     최신 스키마 (users/articles/sent_log/unsubscribe_feedback + Slack 컬럼, anon 정책 없음)
  seed.sql                       CSV → articles 시드 데이터 (103건)
  cleanup-duplicates.sql         (1회용) seed.sql 중복 실행으로 쌓인 articles 중복 제거
  migration-notifications.sql    (기존 설치용) Slack 컬럼 추가 + anon 접근 차단 마이그레이션
  migration-unsubscribe.sql      (기존 설치용) slack_team_id 컬럼 추가
  migration-extra-links.sql      (기존 설치용) extra_links 컬럼 추가
  migration-weekdays.sql         (기존 설치용) send_weekdays 컬럼 추가
  migration-unsubscribe-feedback.sql  (기존 설치용) unsubscribe_feedback 테이블 생성
  cron-setup.sql                 pg_cron으로 Edge Function 10분 주기 호출 설정
  db_article1.csv, db_article2.csv   원본 아티클 데이터
supabase/
  functions/send-daily-articles/index.ts   Slack 발송 Edge Function (Deno)
```

## 6. 디자인

`docs/design-guide.md`의 Anthropic 스타일 가이드(테라코타 프라이머리, 웜톤 뉴트럴, `rounded-md`(8px) 버튼/인풋, `rounded-lg`(16px) 카드, `shadow-card`/`shadow-elevated` 소프트 섀도 등)를 기반으로 하되, 요청에 따라 **다크모드**로 반전하고 **메인 컬러(테라코타)를 더 적극적으로** 사용했습니다 — 원 가이드는 "sparingly(아껴서)" 쓰라고 되어 있지만, 카테고리 선택 칩/카드 상단 라인/도움말 아이콘/링크 등 곳곳에 의도적으로 더 많이 넣었습니다. 색상 토큰은 `tailwind.config.ts`에서 관리합니다.

- **웹폰트**: 전역 서체는 [Pretendard](https://github.com/orioncactus/pretendard)를 CDN(jsDelivr)으로 불러와 사용합니다([app/layout.tsx](app/layout.tsx)의 `<head>` 참고). 원본 가이드의 Styrene A/B는 라이선스 폰트라 웹에 없어서 대체했습니다.
- **상단 워드마크**: 헤더의 "dailyInsight"는 [Blacksword](https://www.dafont.com/blacksword.font) 디스플레이 폰트([app/fonts/Blacksword.otf](app/fonts/Blacksword.otf), `next/font/local`)를 테라코타 색상으로 적용해 강조 처리했습니다. **Blacksword는 개인 용도로만 무료이며, 상업적으로 배포할 경우 별도 라이선스 구매가 필요합니다.**
- **히어로 영역**: [app/page.tsx](app/page.tsx)의 첫 화면(`min-h-screen`)이 뷰포트를 꽉 채우고, 대형 헤드라인 뒤에는 테라코타 톤의 은은한 블러 글로우를 배경으로 깔았습니다. "지금 신청하기 →" 버튼을 누르면 아래 구독 폼(`#subscribe-section`)까지 부드럽게 스크롤됩니다.
- **D-day 배지**: "수료까지 D-30"은 고정 문구가 아니라, 실제 수료일(`2026-10-13`, `app/page.tsx`의 `COMPLETION_DATE`)까지 남은 일수를 매일 다시 계산해서 보여줍니다(Asia/Seoul 기준). 수료일이 바뀌면 이 상수만 고치면 됩니다.
- **구독 상태 배너**: [components/NotificationSettingsForm.tsx](components/NotificationSettingsForm.tsx) 최상단 배너는 미구독 시 `bg-primary`(테라코타), 구독중일 때 `bg-success`(그린)로 꽉 채워 눈에 띄게 표시합니다.
- **발송 미리보기**: "Preview" 섹션은 실제 Slack 메시지처럼 앱 아이콘/이름/시각/본문 레이아웃으로 렌더링되며, 실제 발송 템플릿(`DEFAULT_MESSAGE_TEMPLATE`)이 아닌 예시 제목으로 로컬 표시만 합니다.
- **카테고리/요일 버튼**: "받고 싶은 아티클 주제" 칩은 촘촘한 간격으로 좌측 정렬되고, 칩 안의 텍스트 자체는 그대로 중앙 정렬됩니다.
- 디자인 가이드가 다시 바뀌면 `tailwind.config.ts`와 각 컴포넌트의 className만 다시 매핑하면 되므로, 기능 코드를 건드리지 않고 전체 룩앤필을 교체할 수 있습니다.
