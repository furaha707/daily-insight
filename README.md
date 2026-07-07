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

폼 맨 위에 항상 현재 구독 상태("✅ 구독중이십니다" / "미구독 중이십니다. 데일리 인사이트 받아보실래요?")가 바로 보입니다. 별도 아이콘이나 클릭이 필요 없습니다. 판별 순서는:

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

이 아래로 폼에 두 가지가 더 있습니다:

- **추가로 포함할 링크 (선택, `users.extra_links`)**: 아티클과 별개로 매일 함께 보내고 싶은 링크/메모를 자유롭게 입력할 수 있습니다. Edge Function이 발송 시 그대로 이어붙입니다.
- **최종 발송 미리보기**: 고정 템플릿(`{title}`/`{url}` 대신 "아티클 제목"/"아티클 url"로 표시) + 위 추가 링크 + "데일리인사이트 바로가기" 링크(teamId 포함, Webhook URL을 입력하면 실시간으로 활성화되는 실제 클릭 가능한 링크)까지 합쳐서, 실제로 Slack에 어떤 메시지가 갈지 그대로 보여줍니다.

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

### 4-5. 시각 매칭 방식 (알아두면 좋은 것)

- 함수는 10분마다 실행되며, 현재 시각(Asia/Seoul, 10분 단위로 내림)과 `users.send_hour`/`send_minute`가 정확히 일치하는 사용자만 골라 발송합니다. 그래서 웹 폼의 "분" 선택도 10분 단위(00/10/20/.../50)로만 되어 있습니다.
- `last_notified_date`로 하루 1회만 발송되도록 막습니다(같은 날 cron이 여러 번 겹쳐 돌아도 중복 발송 없음).
- 카테고리에 맞는 미발송 아티클이 없으면 그냥 조용히 스킵합니다(Slack에 "없어요" 메시지를 보내지 않음).

### 4-6. 구독 해지

구독 해지는 **오직 폼 맨 아래의 "구독 해지하기" 버튼**으로만 가능합니다(구독중일 때만 작게 노출 — 일부러 찾기 어렵게 만들지 않았습니다, 다크패턴은 지원하지 않습니다). Slack 메시지에는 해지 링크가 없고, 대신 사이트로 돌아오는 "데일리인사이트 바로가기" 링크만 붙습니다.

버튼을 누르면 `POST /api/unsubscribe`에 현재 브라우저의 `userId`를 보내 `notification_enabled = false`로 끕니다 — **행을 삭제하지 않습니다.** 삭제하면 `sent_log`도 함께 사라져서 재구독 시 이미 읽은 아티클이 중복으로 다시 갈 수 있기 때문입니다.

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
lib/
  supabaseAdmin.ts               서버 전용 Supabase 클라이언트 (service_role)
  categories.ts                  카테고리 목록
  slack.ts                       Webhook URL에서 워크스페이스 ID 추출
  constants.ts                   localStorage 키, 고정 메시지 템플릿
types/
  index.ts                       DB/응답 타입
database/
  schema.sql                     최신 스키마 (users/articles/sent_log + Slack 컬럼, anon 정책 없음)
  seed.sql                       CSV → articles 시드 데이터 (103건)
  cleanup-duplicates.sql         (1회용) seed.sql 중복 실행으로 쌓인 articles 중복 제거
  migration-notifications.sql    (기존 설치용) Slack 컬럼 추가 + anon 접근 차단 마이그레이션
  migration-unsubscribe.sql      (기존 설치용) slack_team_id 컬럼 추가
  migration-extra-links.sql      (기존 설치용) extra_links 컬럼 추가
  cron-setup.sql                 pg_cron으로 Edge Function 10분 주기 호출 설정
  db_article1.csv, db_article2.csv   원본 아티클 데이터
supabase/
  functions/send-daily-articles/index.ts   Slack 발송 Edge Function (Deno)
```

## 6. 디자인

`docs/design-guide.md`의 Apple 스타일 가이드(Action Blue #0066cc 단일 액센트, Parchment/Ink 팔레트, pill 버튼, 8px 스페이싱 스케일, 카드/버튼 무(無)섀도 원칙 등)를 `tailwind.config.ts` 토큰으로 매핑해 구현했습니다.
