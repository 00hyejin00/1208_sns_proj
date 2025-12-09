import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { ApiResponse, Follow } from "@/lib/types";

/**
 * @file app/api/follows/route.ts
 * @description 팔로우 기능 API
 *
 * POST /api/follows - 팔로우 추가
 * DELETE /api/follows - 팔로우 제거
 *
 * Request Body:
 * - followingId: 팔로우할 사용자의 Supabase user ID
 *
 * @see docs/PRD.md - 팔로우 기능 섹션
 * @see supabase/migrations/db.sql - follows 테이블 정의
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
 * POST /api/follows - 팔로우 추가
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환
    const followerId = await getSupabaseUserId(clerkUserId);

    if (!followerId) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "User not found in database",
          success: false,
        },
        { status: 404 }
      );
    }

    // Request Body 파싱
    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "followingId is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // 자기 자신 팔로우 방지
    if (followerId === followingId) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "Cannot follow yourself",
          success: false,
        },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = getServiceRoleClient();

    // 이미 팔로우 중인지 확인
    const { data: existingFollows, error: checkError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (checkError) {
      console.error("Error checking existing follow:", checkError);
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "Failed to check follow status",
          success: false,
        },
        { status: 500 }
      );
    }

    if (existingFollows && existingFollows.length > 0) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "Already following this user",
          success: false,
        },
        { status: 400 }
      );
    }

    // 팔로우 추가
    const { data: followData, error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();

    if (followError) {
      console.error("Error creating follow:", followError);
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: `Failed to follow user: ${followError.message || "Unknown error"}`,
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Follow>>({
      data: followData,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/follows:", error);
    return NextResponse.json<ApiResponse<Follow>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/follows - 팔로우 제거
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환
    const followerId = await getSupabaseUserId(clerkUserId);

    if (!followerId) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "User not found in database",
          success: false,
        },
        { status: 404 }
      );
    }

    // Request Body 파싱
    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: "followingId is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = getServiceRoleClient();

    // 팔로우 제거
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (deleteError) {
      console.error("Error deleting follow:", deleteError);
      return NextResponse.json<ApiResponse<Follow>>(
        {
          error: `Failed to unfollow user: ${deleteError.message || "Unknown error"}`,
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/follows:", error);
    return NextResponse.json<ApiResponse<Follow>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

