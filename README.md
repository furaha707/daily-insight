# dailyInsight

매일 관심 카테고리에 맞는 아티클을 1개씩, 중복 없이 추천해주는 테스트 서비스입니다.
Next.js 15 (App Router) + Tailwind CSS + Supabase로 구현했습니다.

## 1. Supabase 테이블 생성 (필수, 최초 1회)

이 프로젝트에는 **Publishable(anon) Key만** 설정되어 있어 코드에서 테이블을 직접 만들 수 없습니다.
Supabase 대시보드에서 아래 순서로 SQL을 실행해주세요.

1. [Supabase 대시보드](https://supabase.com/dashboard/project/kemmkpwcpuapdynhzrsg) 접속 → **SQL Editor**
2. [`database/schema.sql`](database/schema.sql) 전체 내용을 복사해 실행 → `users`, `articles`, `sent_log` 테이블 및 RLS 정책 생성
3. [`database/seed.sql`](database/seed.sql) 전체 내용을 복사해 실행 → `database/db_article1.csv`, `db_article2.csv`를 변환한 아티클 103건 삽입

> ⚠️ `seed.sql`을 실수로 여러 번 실행해 `articles`에 중복 데이터가 쌓였다면, [`database/cleanup-duplicates.sql`](database/cleanup-duplicates.sql)을 한 번 실행해 정리하세요. (`url` 유니크 제약을 추가해 이후로는 재실행해도 중복이 쌓이지 않습니다.)

## 2. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속. `.env.local`에 Supabase URL/Publishable Key가 이미 설정되어 있습니다.

## 3. 동작 방식

- 메인 화면에서 카테고리를 다중 선택하고 **신청하기**를 누르면 `/api/articles/select`로 요청합니다.
- 서버는 브라우저에 저장된 익명 사용자 id(`localStorage`)를 기준으로 `users` 테이블에 사용자를 생성/갱신합니다.
- 선택한 카테고리와 겹치면서(`categories && selected`) 해당 사용자에게 **아직 발송되지 않은**(`sent_log` 기준) 아티클 중 1개를 무작위로 골라 반환하고, `sent_log`에 발송 기록을 남깁니다.
- 같은 카테고리를 계속 선택해도 이미 받은 아티클은 다시 추천되지 않습니다. 후보가 없으면 모달에 "모두 읽었어요" 안내가 표시됩니다.
- 결과는 모달로 노출되며, 아티클 제목/카테고리/링크를 확인할 수 있습니다.

## 4. 디렉토리 구조

```
app/
  layout.tsx              전역 레이아웃 (상단 네비게이션)
  page.tsx                메인 화면 (카테고리 선택 + CTA)
  globals.css             Tailwind 전역 스타일
  api/articles/select/    아티클 선정 API Route
components/
  CategorySelector.tsx    카테고리 다중 선택 UI
  ResultModal.tsx         추천 결과 모달
lib/
  supabase.ts             Supabase 클라이언트
  categories.ts           카테고리 목록
types/
  index.ts                DB/응답 타입
database/
  schema.sql              users / articles / sent_log 테이블 + RLS 정책
  seed.sql                CSV → articles 시드 데이터 (103건, url unique + ON CONFLICT DO NOTHING)
  cleanup-duplicates.sql  (1회용) seed.sql 중복 실행으로 쌓인 articles 중복 제거
  db_article1.csv, db_article2.csv   원본 아티클 데이터
```

## 5. 디자인

`docs/design-guide.md`의 Apple 스타일 가이드(Action Blue #0066cc 단일 액센트, Parchment/Ink 팔레트, pill 버튼, 8px 스페이싱 스케일, 카드/버튼 무(無)섀도 원칙 등)를 `tailwind.config.ts` 토큰으로 매핑해 구현했습니다.
