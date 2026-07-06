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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface TargetUser {
  id: string;
  categories: string[] | null;
  slack_webhook_url: string | null;
  message_template: string | null;
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
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(title|url|category)\}/g, (_match, key: string) => vars[key] ?? "");
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
  const { date, hour, minute } = nowInSeoul();
  const bucketMinute = Math.floor(minute / 10) * 10;

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select(
      "id, categories, slack_webhook_url, message_template, last_notified_date"
    )
    .eq("notification_enabled", true)
    .eq("send_hour", hour)
    .eq("send_minute", bucketMinute)
    .not("slack_webhook_url", "is", null);

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const targets = ((users ?? []) as TargetUser[]).filter(
    (u) => u.last_notified_date !== date
  );

  const results: Array<Record<string, unknown>> = [];

  for (const user of targets) {
    try {
      const picked = await pickArticleFor(user);

      if (!picked) {
        results.push({ userId: user.id, status: "skipped_no_candidates" });
        continue;
      }

      const message = fillTemplate(
        user.message_template ?? "{title}\n{url}",
        {
          title: picked.title,
          url: picked.url,
          category: picked.categories.join(", "),
        }
      );

      const slackRes = await fetch(user.slack_webhook_url as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
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
