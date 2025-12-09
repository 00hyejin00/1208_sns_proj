import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { ApiResponse, UserStats } from "@/lib/types";

/**
 * @file app/api/users/me/route.ts
 * @description 현재 로그인한 사용자 정보 조회 API
 *
 * GET /api/users/me - 현재 로그인한 사용자의 정보 조회
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

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse<UserStats>>(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환
    const supabaseUserId = await getSupabaseUserId(clerkUserId);

    if (!supabaseUserId) {
      return NextResponse.json<ApiResponse<UserStats>>(
        {
          error: "User not found in database",
          success: false,
        },
        { status: 404 }
      );
    }

    // 사용자 정보 조회 (user_stats 뷰 사용)
    const supabase = getServiceRoleClient();
    const { data: userStats, error: userStatsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", supabaseUserId)
      .single();

    if (userStatsError || !userStats) {
      return NextResponse.json<ApiResponse<UserStats>>(
        {
          error: "User not found",
          success: false,
        },
        { status: 404 }
      );
    }

    // UserStats 타입에 맞게 데이터 변환
    const userStatsData: UserStats = {
      id: userStats.user_id,
      clerk_id: userStats.clerk_id,
      name: userStats.name,
      created_at: "",
      posts_count: Number(userStats.posts_count) || 0,
      followers_count: Number(userStats.followers_count) || 0,
      following_count: Number(userStats.following_count) || 0,
    };

    // users 테이블에서 created_at 가져오기
    const { data: userData } = await supabase
      .from("users")
      .select("created_at")
      .eq("id", supabaseUserId)
      .single();

    if (userData) {
      userStatsData.created_at = userData.created_at;
    }

    return NextResponse.json<ApiResponse<UserStats>>({
      data: userStatsData,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/users/me:", error);
    return NextResponse.json<ApiResponse<UserStats>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

