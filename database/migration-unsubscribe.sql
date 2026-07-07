-- ============================================================
-- [dailyInsight] Slack 워크스페이스 ID 저장 + 구독 해지 기능 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행하세요.
-- ============================================================

alter table public.users
  add column if not exists slack_team_id text;

comment on column public.users.slack_team_id is
  'Slack Incoming Webhook URL에서 서버가 자동으로 추출한 워크스페이스(Team) ID. 사용자가 직접 입력하지 않음. 구독 해지 링크 식별자로 사용.';

create index if not exists users_slack_team_id_idx on public.users (slack_team_id);
