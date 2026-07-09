import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { UNSUBSCRIBE_REASONS } from "@/lib/constants";

// 폼 하단의 "구독 해지하기" 버튼에서만 호출한다. userId로 정확히 그 한 구독만 끈다.
// 행을 삭제하지 않는다 — 지우면 sent_log가 함께 사라져 재구독 시 중복 발송 방지가 깨진다.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId: string | undefined = body?.userId;
  const reason: string | undefined = body?.reason;
  const customReason: string = (body?.customReason ?? "").trim();

  if (!userId) {
    return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
  }
  if (!reason || !UNSUBSCRIBE_REASONS.includes(reason as (typeof UNSUBSCRIBE_REASONS)[number])) {
    return NextResponse.json({ error: "해지 사유를 선택해주세요." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      notification_enabled: false,
      // 해지 시점에도 "오늘 발송 완료" 플래그를 초기화해서, 같은 날 재구독하면
      // last_notified_date가 오늘로 남아있어 발송이 막히는 일이 없게 한다.
      last_notified_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json(
      { error: "구독 해지에 실패했습니다." },
      { status: 500 }
    );
  }

  // 설문 기록은 해지 자체보다 우선순위가 낮으므로, 실패해도 해지 응답에는 영향을 주지 않는다.
  await supabaseAdmin.from("unsubscribe_feedback").insert({
    user_id: userId,
    reason,
    custom_reason: reason === "기타" && customReason ? customReason : null,
  });

  return NextResponse.json({ ok: true });
}
