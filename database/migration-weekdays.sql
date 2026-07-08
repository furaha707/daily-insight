-- ============================================================
-- [dailyInsight] 발송 요일 선택 기능 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행하세요.
--
-- users 테이블에 희망 발송 요일 컬럼을 추가한다.
-- 기존 사용자는 전부 평일(월~금) 발송으로 간주해 기본값을 채운다.
-- ============================================================

alter table public.users
  add column if not exists send_weekdays smallint[] not null default '{1,2,3,4,5}';

comment on column public.users.send_weekdays is '희망 발송 요일. ISO 요일 번호(1=월 ~ 5=금), Asia/Seoul 기준';
