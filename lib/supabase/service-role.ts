import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * @file lib/supabase/service-role.ts
 * @description Supabase Service Role 클라이언트 (관리자 권한)
 *
 * RLS(Row Level Security)를 우회하여 모든 데이터에 접근할 수 있는 관리자 클라이언트입니다.
 *
 * ⚠️ 주의사항:
 * - 서버 사이드에서만 사용해야 합니다
 * - 클라이언트에 노출되면 안됩니다
 * - 신중하게 사용하고, 가능하면 RLS 정책을 사용하는 것을 권장합니다
 *
 * @example
 * ```ts
 * import { getServiceRoleClient } from '@/lib/supabase/service-role';
 *
 * export async function POST(req: Request) {
 *   const supabase = getServiceRoleClient();
 *   const { data, error } = await supabase
 *     .from('users')
 *     .insert({ ... });
 * }
 * ```
 */

/**
 * Supabase Service Role 클라이언트 생성
 *
 * RLS를 우회하여 모든 데이터에 접근할 수 있는 관리자 권한 클라이언트를 반환합니다.
 *
 * @returns Supabase 클라이언트 인스턴스 (Service Role 권한)
 * @throws {Error} 환경 변수가 설정되지 않은 경우
 */
export function getServiceRoleClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Please check your environment variables."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Please check your environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
