-- ============================================================
-- [dailyInsight] Cron 스케줄 설정
-- send-daily-articles Edge Function을 10분마다 호출한다.
--
-- 사전 조건: Edge Function이 이미 배포되어 있어야 한다.
--   supabase functions deploy send-daily-articles
--
-- <SERVICE_ROLE_KEY> 부분을 Supabase 대시보드 > Settings > API의
-- service_role secret 값으로 바꿔서 실행하세요.
-- (Edge Function은 기본적으로 유효한 Supabase JWT를 Authorization 헤더로
--  요구합니다. service_role 키는 유효한 JWT이므로 그대로 사용합니다.)
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-daily-articles-every-10-min',
  '*/10 * * * *',
  $$
  select net.http_post(
    url     := 'https://kemmkpwcpuapdynhzrsg.supabase.co/functions/v1/send-daily-articles',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- 등록된 cron 목록 확인
select jobid, jobname, schedule, active from cron.job;

-- 필요 시 스케줄 해제
-- select cron.unschedule('send-daily-articles-every-10-min');

-- 최근 실행 이력 확인 (실패 여부 디버깅용)
-- select * from cron.job_run_details order by start_time desc limit 20;
