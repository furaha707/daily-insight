import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { extractSlackTeamId } from "@/lib/slack";
import { DEFAULT_MESSAGE_TEMPLATE, DEFAULT_SEND_WEEKDAYS } from "@/lib/constants";
import type {
  NotificationSettings,
  NotificationSettingsResponse,
} from "@/types";

// 구독 해지 여부와 무관하게 sent_log는 지우지 않으므로, 누적 발송 횟수는 항상 그대로 유지된다.
async function getSentCount(userId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from("sent_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const teamId = req.nextUrl.searchParams.get("teamId");

  if (!userId && !teamId) {
    return NextResponse.json(
      { error: "userId 또는 teamId가 필요합니다." },
      { status: 400 }
    );
  }

  // teamId(Slack 워크스페이스)가 진짜 identity이므로 우선 조회하고,
  // 없으면 브라우저에 저장된 userId로 보조 조회한다.
  let query = supabaseAdmin
    .from("users")
    .select(
      "id, categories, slack_webhook_url, message_template, extra_links, send_hour, send_minute, send_weekdays, notification_enabled"
    );

  query = teamId
    ? query.eq("slack_team_id", teamId).order("created_at", { ascending: true })
    : query.eq("id", userId as string);

  const { data, error } = await query.limit(1);

  if (error) {
    return NextResponse.json(
      { error: "알림 설정을 조회하지 못했습니다." },
      { status: 500 }
    );
  }

  const row = data?.[0];

  if (!row) {
    return NextResponse.json({ error: "구독 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const settings: NotificationSettings = {
    categories: row.categories ?? [],
    slackWebhookUrl: row.slack_webhook_url ?? "",
    messageTemplate: row.message_template ?? DEFAULT_MESSAGE_TEMPLATE,
    extraLinks: row.extra_links ?? "",
    sendHour: row.send_hour ?? 9,
    sendMinute: row.send_minute ?? 0,
    sendWeekdays:
      row.send_weekdays && row.send_weekdays.length > 0
        ? row.send_weekdays
        : DEFAULT_SEND_WEEKDAYS,
    notificationEnabled: row.notification_enabled ?? false,
    sentCount: await getSentCount(row.id),
  };

  const response: NotificationSettingsResponse = { userId: row.id, settings };
  return NextResponse.json(response);
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const incomingUserId: string | undefined = body?.userId;
  const categories: string[] | undefined = body?.categories;
  const slackWebhookUrl: string = (body?.slackWebhookUrl ?? "").trim();
  const extraLinks: string = (body?.extraLinks ?? "").trim();
  const sendHour: number | undefined = body?.sendHour;
  const sendMinute: number | undefined = body?.sendMinute;
  const sendWeekdays: number[] | undefined = body?.sendWeekdays;

  if (!categories || categories.length === 0) {
    return NextResponse.json(
      { error: "카테고리를 하나 이상 선택해주세요." },
      { status: 400 }
    );
  }

  const slackTeamId = slackWebhookUrl ? extractSlackTeamId(slackWebhookUrl) : null;

  // 이 엔드포인트를 통한 저장은 항상 "구독하기"를 의미한다 (on/off 토글 없음).
  // 구독을 끄는 것은 오직 Slack 메시지의 구독 해지 링크(/api/unsubscribe)로만 가능하다.
  if (!slackTeamId) {
    return NextResponse.json(
      { error: "올바른 Slack Incoming Webhook URL을 입력해주세요." },
      { status: 400 }
    );
  }
  if (
    typeof sendHour !== "number" ||
    sendHour < 0 ||
    sendHour > 23 ||
    typeof sendMinute !== "number" ||
    sendMinute < 0 ||
    sendMinute > 59
  ) {
    return NextResponse.json(
      { error: "발송 시각을 올바르게 입력해주세요." },
      { status: 400 }
    );
  }
  if (
    !Array.isArray(sendWeekdays) ||
    sendWeekdays.length === 0 ||
    !sendWeekdays.every((d) => Number.isInteger(d) && d >= 1 && d <= 5)
  ) {
    return NextResponse.json(
      { error: "발송 요일을 하나 이상 선택해주세요." },
      { status: 400 }
    );
  }

  const payload = {
    categories,
    slack_webhook_url: slackWebhookUrl || null,
    slack_team_id: slackTeamId,
    // 발송 문구는 고정이며 클라이언트 입력값을 받지 않는다.
    message_template: DEFAULT_MESSAGE_TEMPLATE,
    extra_links: extraLinks || null,
    send_hour: sendHour,
    send_minute: sendMinute,
    send_weekdays: sendWeekdays,
    notification_enabled: true,
    // 구독 설정을 저장할 때마다 "오늘 발송 완료" 플래그를 초기화한다.
    // 이미 오늘 발송을 받았더라도 설정을 바꾸면 그 시각 기준으로 다시 받을 수 있게 하기 위함.
    last_notified_date: null,
    updated_at: new Date().toISOString(),
  };

  let userId: string | null = null;

  // 진짜 identity는 Slack 워크스페이스다 (브라우저는 그냥 로컬 캐시일 뿐).
  // 워크스페이스 ID가 있으면 브라우저가 뭘 들고 있든 무조건 그 구독을 찾아서 쓴다.
  if (slackTeamId) {
    const { data: existingByTeam } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("slack_team_id", slackTeamId)
      .order("created_at", { ascending: true })
      .limit(1);

    if (existingByTeam && existingByTeam.length > 0) {
      userId = existingByTeam[0].id;
    }
  }

  // 아직 Slack 웹훅을 등록하지 않은 상태(예: 카테고리만 고르고 즉시추천만 쓰던 경우)라면
  // 브라우저에 저장된 userId를 이어서 쓴다.
  if (!userId && incomingUserId) {
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", incomingUserId)
      .maybeSingle();

    if (existing) {
      userId = incomingUserId;
    }
  }

  if (userId) {
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update(payload)
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "알림 설정을 저장하지 못했습니다." },
        { status: 500 }
      );
    }
  } else {
    const { data: created, error: createError } = await supabaseAdmin
      .from("users")
      .insert(payload)
      .select("id")
      .single();

    if (createError || !created) {
      return NextResponse.json(
        { error: "사용자 정보를 생성하지 못했습니다." },
        { status: 500 }
      );
    }
    userId = created.id;
  }

  if (!userId) {
    return NextResponse.json(
      { error: "사용자 정보를 확인하지 못했습니다." },
      { status: 500 }
    );
  }

  const response: NotificationSettingsResponse = {
    userId,
    settings: {
      categories,
      slackWebhookUrl,
      messageTemplate: payload.message_template,
      extraLinks,
      sendHour,
      sendMinute,
      sendWeekdays,
      notificationEnabled: true,
      sentCount: await getSentCount(userId),
    },
  };
  return NextResponse.json(response);
}
