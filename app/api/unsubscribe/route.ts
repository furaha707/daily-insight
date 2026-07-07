import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// 폼 하단의 "구독 해지하기" 버튼에서만 호출한다. userId로 정확히 그 한 구독만 끈다.
// 행을 삭제하지 않는다 — 지우면 sent_log가 함께 사라져 재구독 시 중복 발송 방지가 깨진다.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId: string | undefined = body?.userId;

  if (!userId) {
    return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ notification_enabled: false, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return NextResponse.json(
      { error: "구독 해지에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
