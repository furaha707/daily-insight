-- ============================================================
-- [dailyInsight] Supabase 초기화 SQL
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행
--
-- 구성: users(선택 카테고리를 저장하는 익명 사용자) / articles(추천 아티클 원본)
--       / sent_log(사용자별 발송 기록, 중복 발송 방지용)
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. users : 익명 사용자(브라우저 단위) + 관심 카테고리
-- ------------------------------------------------------------
create table if not exists public.users (
  id            uuid        default gen_random_uuid() primary key,
  categories    text[]      not null default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

comment on table public.users is '서비스를 이용하는 (로그인 없는) 익명 사용자와 선택 카테고리';

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
-- 4. Row Level Security
--    로그인이 없는 서비스이므로 anon 롤에게 필요한 최소 권한만 부여한다.
-- ------------------------------------------------------------
alter table public.users     enable row level security;
alter table public.articles  enable row level security;
alter table public.sent_log  enable row level security;

-- users: 익명 사용자 본인 레코드 생성/조회/수정(카테고리 변경) 허용
create policy "anon_insert_users" on public.users
  for insert to anon with check (true);

create policy "anon_select_users" on public.users
  for select to anon using (true);

create policy "anon_update_users" on public.users
  for update to anon using (true) with check (true);

-- articles: 읽기 전용 (시드는 SQL Editor / 서비스 롤에서만 수행)
create policy "anon_select_articles" on public.articles
  for select to anon using (true);

-- sent_log: 추천 결과 기록 및 중복 체크용 조회 허용
create policy "anon_insert_sent_log" on public.sent_log
  for insert to anon with check (true);

create policy "anon_select_sent_log" on public.sent_log
  for select to anon using (true);
