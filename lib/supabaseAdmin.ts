import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. .env.local(서버 전용, NEXT_PUBLIC_ 접두사 없이)을 확인하세요."
  );
}

/**
 * 서버(Route Handler)에서만 사용하는 Supabase 클라이언트. RLS를 우회하므로
 * 절대 클라이언트(브라우저) 코드에서 import하면 안 된다.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
