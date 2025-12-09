import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * @file app/(main)/profile/page.tsx
 * @description 본인 프로필 페이지 리다이렉트
 *
 * /profile로 접근하면 현재 로그인한 사용자의 프로필 페이지로 리다이렉트합니다.
 *
 * @see docs/PRD.md - 프로필 페이지 섹션
 */

/**
 * Clerk user ID를 Supabase user ID로 변환
 */
async function getSupabaseUserId(clerkUserId: string): Promise<string | null> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (error || !data) {
    console.error("Error fetching user from Supabase:", error);
    return null;
  }

  return data.id;
}

export default async function ProfilePage() {
  const { userId: currentClerkUserId } = await auth();

  // 로그인하지 않은 경우 홈으로 리다이렉트
  if (!currentClerkUserId) {
    redirect("/");
  }

  // 현재 사용자의 Supabase user ID 가져오기
  const currentSupabaseUserId = await getSupabaseUserId(currentClerkUserId);

  // 사용자를 찾을 수 없는 경우 홈으로 리다이렉트
  if (!currentSupabaseUserId) {
    redirect("/");
  }

  // 본인 프로필 페이지로 리다이렉트
  redirect(`/profile/${currentSupabaseUserId}`);
}

