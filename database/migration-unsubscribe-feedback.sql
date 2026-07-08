-- ============================================================
-- [dailyInsight] 구독 해지 사유 설문 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행하세요.
--
-- 구독 해지 버튼을 누를 때 받는 사유 설문 응답을 쌓아둘 테이블을 만든다.
-- 구독을 다시 하거나 해지해도 이 기록은 삭제하지 않는다(통계용).
-- ============================================================

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

alter table public.unsubscribe_feedback enable row level security;
