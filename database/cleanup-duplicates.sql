-- ============================================================
-- [dailyInsight] articles 중복 데이터 정리 (1회 실행용)
-- seed.sql이 여러 번 실행되어 url당 여러 건이 쌓인 경우 사용합니다.
-- uuid 타입에는 min()/max() 집계가 없으므로 row_number()로 대체합니다.
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행하세요.
-- ============================================================

-- 1. sent_log가 참조 중인 중복 article row를 "살릴 행"으로 먼저 몰아준다.
--    (참조가 끊어진 채로 삭제되면 sent_log의 발송 기록이 깨질 수 있으므로,
--     url이 같은 그룹에서 남길 id로 sent_log.article_id를 갱신)
with ranked as (
  select id, url,
         row_number() over (partition by url order by created_at, id::text) as rn
  from public.articles
),
keep as (
  select url, id as keep_id
  from ranked
  where rn = 1
)
update public.sent_log sl
set article_id = keep.keep_id
from public.articles a
join keep on keep.url = a.url
where sl.article_id = a.id
  and a.id <> keep.keep_id;

-- 2. url당 대표 1건(rn = 1)만 남기고 나머지 중복 삭제
with ranked as (
  select id,
         row_number() over (partition by url order by created_at, id::text) as rn
  from public.articles
)
delete from public.articles a
using ranked
where a.id = ranked.id
  and ranked.rn > 1;

-- 3. sent_log에 (user_id, article_id) 중복이 생겼을 수 있으니 정리
--    (같은 url을 가리키던 여러 article_id가 하나로 합쳐지면서 중복 발생 가능)
with ranked as (
  select id,
         row_number() over (partition by user_id, article_id order by sent_at, id::text) as rn
  from public.sent_log
)
delete from public.sent_log sl
using ranked
where sl.id = ranked.id
  and ranked.rn > 1;

-- 4. 재발 방지: url 유니크 제약 추가
alter table public.articles
  add constraint articles_url_key unique (url);

-- 5. 결과 확인 (총 103건이어야 정상)
select count(*) as total_articles from public.articles;
