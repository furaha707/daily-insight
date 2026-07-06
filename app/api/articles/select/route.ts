import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { SelectArticleResponse } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const categories: string[] | undefined = body?.categories;
  const incomingUserId: string | undefined = body?.userId;

  if (!categories || categories.length === 0) {
    return NextResponse.json(
      { error: "카테고리를 하나 이상 선택해주세요." },
      { status: 400 }
    );
  }

  // 1. 사용자 확보 (기존 사용자면 카테고리 갱신, 없으면 신규 생성)
  let userId = incomingUserId ?? null;

  if (userId) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("users")
        .update({ categories, updated_at: new Date().toISOString() })
        .eq("id", userId);
    } else {
      userId = null;
    }
  }

  if (!userId) {
    const { data: created, error: createError } = await supabase
      .from("users")
      .insert({ categories })
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

  // 2. 이미 발송된 아티클 목록 조회 (중복 방지)
  const { data: sentRows } = await supabase
    .from("sent_log")
    .select("article_id")
    .eq("user_id", userId);

  const excludeIds = (sentRows ?? []).map((row) => row.article_id);

  // 3. 선택 카테고리와 겹치면서 아직 발송되지 않은 아티클 후보 조회
  let query = supabase
    .from("articles")
    .select("id, title, url, categories")
    .overlaps("categories", categories);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data: candidates, error: candidateError } = await query;

  if (candidateError) {
    return NextResponse.json(
      { error: "아티클을 조회하지 못했습니다." },
      { status: 500 }
    );
  }

  if (!candidates || candidates.length === 0) {
    const response: SelectArticleResponse = {
      article: null,
      userId,
      exhausted: true,
    };
    return NextResponse.json(response);
  }

  // 4. 후보 중 무작위로 1건 선정
  const picked = candidates[Math.floor(Math.random() * candidates.length)];

  // 5. 발송 기록 저장
  await supabase.from("sent_log").insert({
    user_id: userId,
    article_id: picked.id,
    is_sent: true,
  });

  const response: SelectArticleResponse = {
    article: picked,
    userId,
  };
  return NextResponse.json(response);
}
