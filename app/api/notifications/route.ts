import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type {
  NotificationSettings,
  NotificationSettingsResponse,
} from "@/types";

const DEFAULT_MESSAGE_TEMPLATE = `📰 오늘의 인사이트 아티클이에요!

{title}
{url}`;

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "categories, slack_webhook_url, message_template, send_hour, send_minute, notification_enabled"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "알림 설정을 조회하지 못했습니다." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const settings: NotificationSettings = {
    categories: data.categories ?? [],
    slackWebhookUrl: data.slack_webhook_url ?? "",
    messageTemplate: data.message_template ?? DEFAULT_MESSAGE_TEMPLATE,
    sendHour: data.send_hour ?? 9,
    sendMinute: data.send_minute ?? 0,
    notificationEnabled: data.notification_enabled ?? false,
  };

  const response: NotificationSettingsResponse = { userId, settings };
  return NextResponse.json(response);
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const incomingUserId: string | undefined = body?.userId;
  const categories: string[] | undefined = body?.categories;
  const slackWebhookUrl: string = (body?.slackWebhookUrl ?? "").trim();
  const messageTemplate: string = (body?.messageTemplate ?? "").trim();
  const sendHour: number | undefined = body?.sendHour;
  const sendMinute: number | undefined = body?.sendMinute;
  const notificationEnabled: boolean = Boolean(body?.notificationEnabled);

  if (!categories || categories.length === 0) {
    return NextResponse.json(
      { error: "카테고리를 하나 이상 선택해주세요." },
      { status: 400 }
    );
  }

  if (notificationEnabled) {
    if (!slackWebhookUrl.startsWith("https://hooks.slack.com/")) {
      return NextResponse.json(
        { error: "올바른 Slack Incoming Webhook URL을 입력해주세요." },
        { status: 400 }
      );
    }
    if (!messageTemplate) {
      return NextResponse.json(
        { error: "발송 메시지 템플릿을 입력해주세요." },
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
  }

  const payload = {
    categories,
    slack_webhook_url: slackWebhookUrl || null,
    message_template: messageTemplate || DEFAULT_MESSAGE_TEMPLATE,
    send_hour: sendHour ?? null,
    send_minute: sendMinute ?? null,
    notification_enabled: notificationEnabled,
    updated_at: new Date().toISOString(),
  };

  let userId = incomingUserId ?? null;

  if (userId) {
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      userId = null;
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
      sendHour: sendHour ?? 9,
      sendMinute: sendMinute ?? 0,
      notificationEnabled,
    },
  };
  return NextResponse.json(response);
}
