-- ============================================================
-- [dailyInsight] Slack 알림 기능 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행하세요.
--
-- 이 스크립트는 두 가지를 함께 처리합니다.
--   A. 보안 강화: anon 롤의 직접 REST 접근을 차단 (서버는 service_role로 전환)
--   B. users 테이블에 Slack 알림 설정 컬럼 추가
-- ============================================================

-- ------------------------------------------------------------
-- A. anon 직접 접근 차단
--    지금부터 모든 DB 접근은 Next.js 서버(service_role 키)를 통해서만 이루어진다.
--    service_role은 RLS를 우회하므로 아래에서 정책을 지워도 서버 기능은 그대로 동작한다.
-- ------------------------------------------------------------
drop policy if exists "anon_select_users" on public.users;
drop policy if exists "anon_update_users" on public.users;
drop policy if exists "anon_insert_users" on public.users;

drop policy if exists "anon_select_sent_log" on public.sent_log;
drop policy if exists "anon_insert_sent_log" on public.sent_log;

drop policy if exists "anon_select_articles" on public.articles;

-- ------------------------------------------------------------
-- B. users 테이블에 Slack 알림 설정 컬럼 추가
-- ------------------------------------------------------------
alter table public.users
  add column if not exists slack_webhook_url   text,
  add column if not exists message_template    text default '📰 오늘의 인사이트 아티클이에요!

{title}
{url}',
  add column if not exists send_hour           smallint check (send_hour between 0 and 23),
  add column if not exists send_minute         smallint check (send_minute between 0 and 59),
  add column if not exists notification_enabled boolean not null default false,
  add column if not exists last_notified_date  date;

comment on column public.users.slack_webhook_url is 'Slack Incoming Webhook URL (사용자별 개인 워크스페이스)';
comment on column public.users.message_template is '{title}, {url}, {category} 플레이스홀더를 지원하는 발송 문구 템플릿';
comment on column public.users.send_hour is '희망 발송 시(0-23), Asia/Seoul 기준';
comment on column public.users.send_minute is '희망 발송 분(0-59), Asia/Seoul 기준';
comment on column public.users.notification_enabled is '자동 발송 on/off';
comment on column public.users.last_notified_date is '마지막으로 발송된 날짜(Asia/Seoul) - 하루 중복 발송 방지용';
