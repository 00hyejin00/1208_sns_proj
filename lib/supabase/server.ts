import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * @file lib/supabase/server.ts
 * @description Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 *
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 */

/**
 * 환경 변수 검증
 */
function validateEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Please check your environment variables."
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your environment variables."
    );
  }

  return { supabaseUrl, supabaseKey };
}

/**
 * Supabase 클라이언트 생성 (공식 문서 패턴과 호환)
 *
 * Supabase 공식 문서의 예제와 호환되는 함수입니다.
 * 내부적으로는 Clerk 통합을 사용하여 인증을 처리합니다.
 *
 * @returns Supabase 클라이언트 인스턴스
 *
 * @example
 * ```tsx
 * // Server Component (Supabase 공식 문서 패턴)
 * import { createClient } from '@/lib/supabase/server';
 * import { Suspense } from 'react';
 *
 * async function InstrumentsData() {
 *   const supabase = await createClient();
 *   const { data: instruments } = await supabase.from('instruments').select();
 *   return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
 * }
 *
 * export default function Instruments() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <InstrumentsData />
 *     </Suspense>
 *   );
 * }
 * ```
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
export async function createClient(): Promise<SupabaseClient> {
  const { supabaseUrl, supabaseKey } = validateEnv();

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 생성 (Server Component/Server Action용)
 *
 * Server Component나 Server Action에서 사용합니다.
 * auth().getToken()을 통해 현재 요청의 Clerk 세션 토큰을 자동으로 가져옵니다.
 *
 * @returns Supabase 클라이언트 인스턴스
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = createClerkSupabaseClient();
 *   const { data, error } = await supabase.from('tasks').select('*');
 *
 *   if (error) {
 *     throw error;
 *   }
 *
 *   return (
 *     <div>
 *       {data?.map((task) => (
 *         <p key={task.id}>{task.name}</p>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server';
 *
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export async function addTask(name: string) {
 *   const supabase = createClerkSupabaseClient();
 *
 *   try {
 *     const { data, error } = await supabase.from('tasks').insert({ name });
 *
 *     if (error) {
 *       console.error('Error adding task:', error.message);
 *       throw new Error('Failed to add task');
 *     }
 *
 *     return { success: true, data };
 *   } catch (error: any) {
 *     console.error('Error adding task:', error.message);
 *     throw new Error('Failed to add task');
 *   }
 * }
 * ```
 */
export function createClerkSupabaseClient(): SupabaseClient {
  const { supabaseUrl, supabaseKey } = validateEnv();

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}
