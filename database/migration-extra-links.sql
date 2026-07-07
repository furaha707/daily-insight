-- ============================================================
-- [dailyInsight] 추가 링크 필드 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행하세요.
-- ============================================================

alter table public.users
  add column if not exists extra_links text;

comment on column public.users.extra_links is
  '아티클 외에 사용자가 매일 메시지에 함께 포함하고 싶은 추가 링크/메모 (자유 입력)';
