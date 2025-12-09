import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { ApiResponse } from "@/lib/types";

/**
 * @file app/api/likes/route.ts
 * @description 좋아요 추가/제거 API
 *
 * POST /api/likes - 좋아요 추가
 * DELETE /api/likes - 좋아요 제거
 *
 * Request Body:
 * - postId: 게시물 ID (UUID)
 *
 * @see docs/PRD.md - 좋아요 기능 섹션
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
 * POST /api/likes - 좋아요 추가
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "postId is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환
    const supabaseUserId = await getSupabaseUserId(clerkUserId);

    if (!supabaseUserId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "User not found in database",
          success: false,
        },
        { status: 404 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = getServiceRoleClient();

    // 좋아요 추가 (중복 방지를 위해 upsert 사용)
    const { data, error } = await supabase
      .from("likes")
      .upsert(
        {
          post_id: postId,
          user_id: supabaseUserId,
        },
        {
          onConflict: "post_id,user_id",
        }
      )
      .select()
      .single();

    if (error) {
      // 중복 좋아요인 경우 (이미 좋아요한 경우)
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          {
            error: "Already liked",
            success: false,
          },
          { status: 409 }
        );
      }

      console.error("Error adding like:", error);
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "Failed to add like",
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<typeof data>>({
      data,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/likes:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/likes - 좋아요 제거
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "postId is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환
    const supabaseUserId = await getSupabaseUserId(clerkUserId);

    if (!supabaseUserId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "User not found in database",
          success: false,
        },
        { status: 404 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = getServiceRoleClient();

    // 좋아요 제거
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", supabaseUserId);

    if (error) {
      console.error("Error removing like:", error);
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "Failed to remove like",
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/likes:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

