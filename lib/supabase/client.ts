import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * @file lib/supabase/client.ts
 * @description 공개 데이터용 Supabase 클라이언트 (인증 불필요)
 *
 * 인증이 필요 없는 공개 데이터에 접근할 때 사용합니다.
 * RLS 정책이 'anon' 사용자를 허용하는 경우에만 사용 가능합니다.
 *
 * @example
 * ```tsx
 * import { supabase } from '@/lib/supabase/client';
 *
 * // RLS 정책이 'anon' 사용자를 허용하는 경우
 * const { data } = await supabase.from('public_data').select();
 * ```
 */

/**
 * 환경 변수 검증
 */
function validateEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Please check your environment variables."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your environment variables."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

const { supabaseUrl, supabaseAnonKey } = validateEnv();

/**
 * 공개 데이터용 Supabase 클라이언트
 *
 * 인증 토큰 없이 사용하는 클라이언트입니다.
 * RLS 정책이 'anon' 역할을 허용하는 경우에만 사용 가능합니다.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
