// Supabase Edge Function: send-daily-articles
//
// Cron(약 10분 주기)이 이 함수를 호출한다. 함수는 현재 시각(Asia/Seoul)과
// users.send_hour / send_minute(10분 버킷)가 일치하고, 오늘 아직 발송하지 않은
// 사용자를 찾아 카테고리에 맞는 미발송 아티클 1건을 골라 Slack Webhook으로 보낸다.
//
// 배포: supabase functions deploy send-daily-articles
// 로컬 테스트: supabase functions serve send-daily-articles

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// 배포된 Next.js 앱의 주소. 메시지 하단 "바로가기" 링크를 만들 때 사용한다.
// supabase secrets set APP_BASE_URL=https://your-domain.com 로 설정할 것.
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") ?? "";
// 발송 문구는 고정이며 사용자가 수정할 수 없다. users.message_template이 비어있을 때의 안전망.
const DEFAULT_TEMPLATE = "📰 오늘의 인사이트 아티클이에요!\n\n{title}\n{url}";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface TargetUser {
  id: string;
  categories: string[] | null;
  slack_webhook_url: string | null;
  slack_team_id: string | null;
  message_template: string | null;
  extra_links: string | null;
  send_weekdays: number[] | null;
  last_notified_date: string | null;
}

interface Article {
  id: string;
  title: string;
  url: string;
  categories: string[];
}

function nowInSeoul() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  // 위 date는 이미 Asia/Seoul 기준 달력 날짜이므로, UTC 자정으로 파싱해도
  // 실행 환경의 타임존과 무관하게 항상 같은 요일이 나온다.
  const utcDay = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0=일 ~ 6=토
  const isoWeekday = utcDay === 0 ? 7 : utcDay; // 1=월 ~ 7=일

  return {
    date,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    isoWeekday,
  };
}

function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(title|url|category)\}/g, (_match, key: string) => vars[key] ?? "");
}

// 사이트 바로가기 링크는 메시지 템플릿(사용자 입력)과 무관하게 항상 서버가 강제로 붙인다.
// 구독 해지는 여기서 하지 않는다 — 오직 폼 내부의 "구독 해지하기" 버튼으로만 가능하다.
function buildQuickLinkFooter(teamId: string | null): string {
  if (!teamId || !APP_BASE_URL) return "";
  const url = `${APP_BASE_URL}/?teamId=${encodeURIComponent(teamId)}`;
  // Slack mrkdwn 링크 문법: <url|표시할 텍스트> — "데일리인사이트 바로가기" 문구 자체가 링크가 된다.
  return `\n\n<${url}|데일리인사이트 바로가기>`;
}

async function pickArticleFor(user: TargetUser): Promise<Article | null> {
  const { data: sentRows } = await supabase
    .from("sent_log")
    .select("article_id")
    .eq("user_id", user.id);

  const excludeIds = (sentRows ?? []).map((row) => row.article_id as string);

  let query = supabase
    .from("articles")
    .select("id, title, url, categories")
    .overlaps("categories", user.categories ?? []);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data: candidates } = await query;
  if (!candidates || candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)] as Article;
}

Deno.serve(async () => {
  const { date, hour, minute, isoWeekday } = nowInSeoul();
  const bucketMinute = Math.floor(minute / 10) * 10;

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select(
      "id, categories, slack_webhook_url, slack_team_id, message_template, extra_links, send_weekdays, last_notified_date"
    )
    .eq("notification_enabled", true)
    .eq("send_hour", hour)
    .eq("send_minute", bucketMinute)
    .contains("send_weekdays", [isoWeekday])
    .not("slack_webhook_url", "is", null);

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 쿼리에서 이미 요일을 걸렀지만, 오발송을 막기 위해 요일 + 발송 이력을 다시 한번 확인한다.
  const targets = ((users ?? []) as TargetUser[]).filter(
    (u) =>
      (u.send_weekdays ?? [1, 2, 3, 4, 5]).includes(isoWeekday) &&
      u.last_notified_date !== date
  );

  const results: Array<Record<string, unknown>> = [];

  for (const user of targets) {
    try {
      const picked = await pickArticleFor(user);

      if (!picked) {
        results.push({ userId: user.id, status: "skipped_no_candidates" });
        continue;
      }

      const extra = user.extra_links?.trim();
      const message =
        fillTemplate(user.message_template ?? DEFAULT_TEMPLATE, {
          title: picked.title,
          url: picked.url,
          category: picked.categories.join(", "),
        }) +
        (extra ? `\n\n${extra}` : "") +
        buildQuickLinkFooter(user.slack_team_id);

      const slackRes = await fetch(user.slack_webhook_url as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // unfurl_links/unfurl_media: false — Slack이 메시지 내 링크를 미리보기
        // 생성을 위해 자동으로 미리 열어보는 것을 막는다 (불필요한 트래픽 방지).
        body: JSON.stringify({
          text: message,
          unfurl_links: false,
          unfurl_media: false,
        }),
      });

      if (!slackRes.ok) {
        const detail = await slackRes.text();
        results.push({ userId: user.id, status: "slack_error", detail });
        continue;
      }

      await supabase.from("sent_log").insert({
        user_id: user.id,
        article_id: picked.id,
        is_sent: true,
      });

      await supabase
        .from("users")
        .update({ last_notified_date: date })
        .eq("id", user.id);

      results.push({ userId: user.id, status: "sent", articleId: picked.id });
    } catch (e) {
      results.push({ userId: user.id, status: "error", detail: String(e) });
    }
  }

  return new Response(
    JSON.stringify({
      checkedAt: { date, hour, minute, bucketMinute },
      targetCount: targets.length,
      results,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
