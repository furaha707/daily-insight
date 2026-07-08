-- ============================================================
-- [dailyInsight] Supabase 초기화 SQL
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행
--
-- 구성: users(익명 사용자 + 관심 카테고리 + Slack 알림 설정)
--       / articles(추천 아티클 원본) / sent_log(사용자별 발송 기록, 중복 발송 방지용)
--
-- 접근 모델: 클라이언트(브라우저)는 DB에 직접 접근하지 않는다.
--   모든 읽기/쓰기는 Next.js 서버(API Route, service_role 키)를 경유한다.
--   RLS는 활성화하되 anon 정책은 두지 않아 REST 직접 접근을 차단한다.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. users : 익명 사용자(브라우저 단위) + 관심 카테고리 + Slack 알림 설정
-- ------------------------------------------------------------
create table if not exists public.users (
  id                    uuid        default gen_random_uuid() primary key,
  categories            text[]      not null default '{}',
  slack_webhook_url     text,
  slack_team_id         text,
  message_template      text        default '📰 오늘의 인사이트 아티클이에요!

{title}
{url}',
  send_hour             smallint    check (send_hour between 0 and 23),
  send_minute           smallint    check (send_minute between 0 and 59),
  send_weekdays         smallint[]  not null default '{1,2,3,4,5}',
  notification_enabled  boolean     not null default false,
  last_notified_date    date,
  extra_links           text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

comment on table public.users is '서비스를 이용하는 (로그인 없는) 익명 사용자, 관심 카테고리, Slack 알림 설정';
comment on column public.users.slack_webhook_url is 'Slack Incoming Webhook URL (사용자별 개인 워크스페이스)';
comment on column public.users.slack_team_id is 'Webhook URL에서 서버가 자동 추출한 워크스페이스(Team) ID. 사용자 입력 아님. 구독 해지 링크 식별자로 사용.';
comment on column public.users.message_template is '{title}, {url}, {category} 플레이스홀더를 지원하는 발송 문구 템플릿';
comment on column public.users.send_hour is '희망 발송 시(0-23), Asia/Seoul 기준';
comment on column public.users.send_minute is '희망 발송 분(0-59), Asia/Seoul 기준';
comment on column public.users.send_weekdays is '희망 발송 요일. ISO 요일 번호(1=월 ~ 5=금), Asia/Seoul 기준';
comment on column public.users.notification_enabled is '자동 발송 on/off';
comment on column public.users.last_notified_date is '마지막으로 발송된 날짜(Asia/Seoul) - 하루 중복 발송 방지용';
comment on column public.users.extra_links is '아티클 외에 사용자가 매일 메시지에 함께 포함하고 싶은 추가 링크/메모 (자유 입력)';

create index if not exists users_slack_team_id_idx on public.users (slack_team_id);

-- ------------------------------------------------------------
-- 2. articles : 추천 아티클 원본 데이터 (CSV 시드)
-- ------------------------------------------------------------
create table if not exists public.articles (
  id                uuid        default gen_random_uuid() primary key,
  title             text        not null,
  url               text        not null unique,
  categories        text[]      not null default '{}',
  skill_type        text,                 -- 소프트스킬 / 하드스킬
  author            text,
  recommend_reason  text,
  published_at      date,
  created_at        timestamptz default now()
);

comment on table public.articles is '추천 대상 아티클 목록 (제목/링크/카테고리 등)';

create index if not exists articles_categories_idx on public.articles using gin (categories);

-- ------------------------------------------------------------
-- 3. sent_log : 사용자에게 발송(추천)된 아티클 기록 - 중복 추천 방지
-- ------------------------------------------------------------
create table if not exists public.sent_log (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        not null references public.users(id) on delete cascade,
  article_id  uuid        not null references public.articles(id) on delete cascade,
  sent_at     timestamptz default now(),
  is_sent     boolean     not null default true,
  unique (user_id, article_id)
);

comment on table public.sent_log is '사용자별 아티클 발송 기록. (user_id, article_id) 유니크로 중복 추천을 방지';

create index if not exists sent_log_user_idx on public.sent_log (user_id);

-- ------------------------------------------------------------
-- 4. unsubscribe_feedback : 구독 해지 사유 설문 응답 기록
-- ------------------------------------------------------------
create table if not exists public.unsubscribe_feedback (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null references public.users(id) on delete cascade,
  reason        text        not null,
  custom_reason text,
  created_at    timestamptz default now()
);

comment on table public.unsubscribe_feedback is '구독 해지 시 받은 사유 설문 응답. 해지해도 삭제하지 않고 계속 쌓는다.';
comment on column public.unsubscribe_feedback.reason is '선택한 사유 문구 ("기타" 포함)';
comment on column public.unsubscribe_feedback.custom_reason is '사유로 "기타"를 선택했을 때의 자유 입력 텍스트';

create index if not exists unsubscribe_feedback_user_idx on public.unsubscribe_feedback (user_id);

-- ------------------------------------------------------------
-- 5. Row Level Security
--    anon 정책은 의도적으로 만들지 않는다 (서버는 service_role로 접근하며,
--    service_role은 RLS를 우회하므로 별도 정책이 필요 없다).
--    이렇게 하면 공개된 publishable key로 REST를 직접 두드려도 아무 데이터도 노출되지 않는다.
-- ------------------------------------------------------------
alter table public.users                 enable row level security;
alter table public.articles              enable row level security;
alter table public.sent_log              enable row level security;
alter table public.unsubscribe_feedback  enable row level security;
