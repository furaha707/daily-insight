# dailyInsight

매일 관심 카테고리에 맞는 아티클을 1개씩, 중복 없이 추천해주는 테스트 서비스입니다.
Next.js 15 (App Router) + Tailwind CSS + Supabase로 구현했고, 설정한 시각에 Slack으로 자동 발송하는 기능도 있습니다.

## 1. Supabase 테이블/보안 설정 (필수, 최초 1회)

Supabase 대시보드 → **SQL Editor**에서 아래 순서로 실행하세요.

1. **신규 설치라면** [`database/schema.sql`](database/schema.sql) 전체 실행 → `users`, `articles`, `sent_log` 테이블 + RLS 생성 (Slack 알림 컬럼 포함, 최신 버전)
2. [`database/seed.sql`](database/seed.sql) 실행 → 아티클 103건 삽입 (재실행해도 중복 안 쌓임)
3. **이미 이전 버전으로 설치되어 있었다면** [`database/migration-notifications.sql`](database/migration-notifications.sql) 실행 → `users`에 Slack 알림 컬럼 추가 + `anon` 직접 접근 차단

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

## 4. Slack 자동 발송 설정 (신규)

메인 화면 하단의 **"Slack 자동 발송 설정"** 폼에서 Webhook URL / 메시지 템플릿 / 발송 시각을 입력하고 저장하면, 매일 그 시각에 서버가 알아서 카테고리에 맞는 미발송 아티클 1건을 Slack으로 보내줍니다.

### 4-1. Slack Incoming Webhook 발급

1. [https://api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**
2. 앱 이름 입력, 알림을 받을 워크스페이스 선택
3. 왼쪽 메뉴 **Incoming Webhooks** → 토글 On
4. 하단 **Add New Webhook to Workspace** → 알림 받을 채널 선택 → Allow
5. 발급된 `https://hooks.slack.com/services/...` URL을 복사해서 웹 폼의 "Slack Incoming Webhook URL"에 입력

### 4-2. 메시지 템플릿

기본값:

```
📰 오늘의 인사이트 아티클이에요!

{title}
{url}
```

`{title}`, `{url}`, `{category}`를 아티클 정보로 치환해서 발송합니다. 자유롭게 문구를 바꿔도 됩니다.

### 4-3. Edge Function 배포

실제 매칭/발송 로직은 [`supabase/functions/send-daily-articles/index.ts`](supabase/functions/send-daily-articles/index.ts)에 있습니다. Supabase CLI로 배포해야 합니다.

```bash
npm install -g supabase
supabase login
supabase link --project-ref kemmkpwcpuapdynhzrsg
supabase functions deploy send-daily-articles
```

(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 런타임에 자동으로 주입되므로 별도 secret 설정이 필요 없습니다.)

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

## 5. 디렉토리 구조

```
app/
  layout.tsx                    전역 레이아웃 (상단 네비게이션)
  page.tsx                      메인 화면 (카테고리 선택 + CTA + Slack 설정 폼)
  globals.css                   Tailwind 전역 스타일
  api/articles/select/          즉시 추천 API Route
  api/notifications/            Slack 알림 설정 조회/저장 API Route
components/
  CategorySelector.tsx          카테고리 다중 선택 UI
  ResultModal.tsx                추천 결과 모달
  NotificationSettingsForm.tsx  Slack 알림 설정 폼
lib/
  supabaseAdmin.ts               서버 전용 Supabase 클라이언트 (service_role)
  categories.ts                  카테고리 목록
types/
  index.ts                       DB/응답 타입
database/
  schema.sql                     최신 스키마 (users/articles/sent_log + Slack 컬럼, anon 정책 없음)
  seed.sql                       CSV → articles 시드 데이터 (103건)
  cleanup-duplicates.sql         (1회용) seed.sql 중복 실행으로 쌓인 articles 중복 제거
  migration-notifications.sql    (기존 설치용) Slack 컬럼 추가 + anon 접근 차단 마이그레이션
  cron-setup.sql                 pg_cron으로 Edge Function 10분 주기 호출 설정
  db_article1.csv, db_article2.csv   원본 아티클 데이터
supabase/
  functions/send-daily-articles/index.ts   Slack 발송 Edge Function (Deno)
```

## 6. 디자인

`docs/design-guide.md`의 Apple 스타일 가이드(Action Blue #0066cc 단일 액센트, Parchment/Ink 팔레트, pill 버튼, 8px 스페이싱 스케일, 카드/버튼 무(無)섀도 원칙 등)를 `tailwind.config.ts` 토큰으로 매핑해 구현했습니다.
