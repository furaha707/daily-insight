import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase 환경변수가 설정되지 않았습니다. .env.local을 확인하세요."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
