"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * @file lib/supabase/clerk-client.ts
 * @description Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요
 * - Clerk 네이티브 통합으로 세션 토큰 자동 사용
 * - useSession().getToken()으로 현재 세션 토큰 사용
 * - React Hook으로 제공되어 Client Component에서 사용
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
 * Clerk 세션 토큰을 사용하여 Supabase 클라이언트 생성 (함수 버전)
 *
 * 공식 문서 예제와 일치하는 함수 버전입니다.
 * Client Component에서 직접 호출하거나, useEffect 내부에서 사용할 수 있습니다.
 *
 * @param session - Clerk 세션 객체 (useSession() hook에서 가져옴)
 * @returns Supabase 클라이언트 인스턴스
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useSession } from '@clerk/nextjs';
 * import { createClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const { session } = useSession();
 *
 *   async function fetchData() {
 *     const supabase = createClerkSupabaseClient(session);
 *     const { data } = await supabase.from('tasks').select('*');
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function createClerkSupabaseClient(
  session: ReturnType<typeof useSession>["session"]
): SupabaseClient {
  const { supabaseUrl, supabaseKey } = validateEnv();

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await session?.getToken()) ?? null;
    },
  });
}

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 Hook
 *
 * React Hook으로 제공되어 Client Component에서 편리하게 사용할 수 있습니다.
 * 세션이 변경될 때마다 자동으로 클라이언트를 재생성합니다.
 *
 * @returns Supabase 클라이언트 인스턴스
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useUser } from '@clerk/nextjs';
 * import { useEffect, useState } from 'react';
 *
 * export default function MyComponent() {
 *   const { user } = useUser();
 *   const supabase = useClerkSupabaseClient();
 *   const [tasks, setTasks] = useState([]);
 *
 *   useEffect(() => {
 *     if (!user) return;
 *
 *     async function loadTasks() {
 *       const { data } = await supabase.from('tasks').select();
 *       if (data) setTasks(data);
 *     }
 *
 *     loadTasks();
 *   }, [user, supabase]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient(): SupabaseClient {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClerkSupabaseClient(session);
  }, [session]);

  return supabase;
}
