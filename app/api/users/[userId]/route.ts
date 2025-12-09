import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { ApiResponse, UserStats } from "@/lib/types";

/**
 * @file app/api/users/[userId]/route.ts
 * @description 사용자 정보 조회 API
 *
 * GET /api/users/[userId] - 사용자 정보 및 통계 조회
 * user_stats 뷰를 활용하여 게시물 수, 팔로워 수, 팔로잉 수를 포함한 사용자 정보를 반환합니다.
 *
 * @see docs/PRD.md - 프로필 페이지 섹션
 * @see supabase/migrations/db.sql - user_stats 뷰 정의
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

/**
 * Supabase user ID를 Clerk user ID로 변환
 */
async function getClerkUserId(supabaseUserId: string): Promise<string | null> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("users")
    .select("clerk_id")
    .eq("id", supabaseUserId)
    .single();

  if (error || !data) {
    console.error("Error fetching clerk_id from Supabase:", error);
    return null;
  }

  return data.clerk_id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: supabaseUserId } = await params;
    const { userId: currentClerkUserId } = await auth();

    // 현재 사용자의 Supabase user ID 가져오기 (팔로우 상태 확인용)
    let currentSupabaseUserId: string | null = null;
    if (currentClerkUserId) {
      currentSupabaseUserId = await getSupabaseUserId(currentClerkUserId);
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // user_stats 뷰에서 사용자 정보 및 통계 조회
    const { data: userStats, error: userStatsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", supabaseUserId)
      .single();

    if (userStatsError) {
      console.error("Error fetching user stats:", userStatsError);
      return NextResponse.json<ApiResponse<UserStats>>(
        {
          error: "User not found",
          success: false,
        },
        { status: 404 }
      );
    }

    if (!userStats) {
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
      created_at: "", // user_stats 뷰에는 created_at이 없으므로 빈 문자열
      posts_count: Number(userStats.posts_count) || 0,
      followers_count: Number(userStats.followers_count) || 0,
      following_count: Number(userStats.following_count) || 0,
    };

    // users 테이블에서 created_at 가져오기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("created_at")
      .eq("id", supabaseUserId)
      .single();

    if (!userError && userData) {
      userStatsData.created_at = userData.created_at;
    }

    // 팔로우 상태 확인 (현재 사용자가 이 사용자를 팔로우하는지)
    let isFollowing = false;
    if (currentSupabaseUserId && currentSupabaseUserId !== supabaseUserId) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentSupabaseUserId)
        .eq("following_id", supabaseUserId)
        .single();

      isFollowing = !!followData;
    }

    // 응답에 팔로우 상태 추가
    return NextResponse.json<ApiResponse<UserStats & { is_following?: boolean }>>({
      data: {
        ...userStatsData,
        is_following: isFollowing,
      },
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/users/[userId]:", error);
    return NextResponse.json<ApiResponse<UserStats>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

