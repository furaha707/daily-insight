-- ============================================================
-- [dailyInsight] articles 스키마 축소 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행하세요.
--
-- articles를 "제목/글쓴이/발행일/카테고리/원문링크" 5개 컬럼 구조로 정리한다.
-- skill_type, recommend_reason 컬럼은 더 이상 쓰지 않으므로 삭제한다.
--
-- ⚠️ 이 마이그레이션 다음에는 반드시 database/seed.sql을 새로 실행해서
--    기존 articles 데이터를 완전히 새 CSV 데이터로 교체해야 한다.
--    articles를 비우면 sent_log도 (on delete cascade로) 함께 비워지므로,
--    기존 구독자의 "발송됨" 누적 횟수도 함께 초기화된다.
-- ============================================================

truncate table public.articles cascade;

alter table public.articles
  drop column if exists skill_type,
  drop column if exists recommend_reason;

comment on table public.articles is '추천 대상 아티클 목록 (제목/글쓴이/발행일/카테고리/원문링크)';
comment on column public.articles.author is '글쓴이';
comment on column public.articles.published_at is '발행일';
comment on column public.articles.categories is '카테고리 (기획/IT/개발/협업/디자인/AI/커뮤니케이션/비즈니스/데이터/UIUX 중 다중 선택)';
comment on column public.articles.url is '원문링크';
