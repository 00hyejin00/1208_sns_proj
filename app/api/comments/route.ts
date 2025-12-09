import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { ApiResponse, Comment } from "@/lib/types";

/**
 * @file app/api/comments/route.ts
 * @description 댓글 작성/삭제 API
 *
 * POST /api/comments - 댓글 작성
 * DELETE /api/comments - 댓글 삭제
 *
 * Request Body:
 * - postId: 게시물 ID (UUID)
 * - content: 댓글 내용 (POST만)
 * - commentId: 댓글 ID (DELETE만)
 *
 * @see docs/PRD.md - 댓글 기능 섹션
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
 * POST /api/comments - 댓글 작성
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse<Comment>>(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { postId, content } = body;

    if (!postId || !content) {
      return NextResponse.json<ApiResponse<Comment>>(
        {
          error: "postId and content are required",
          success: false,
        },
        { status: 400 }
      );
    }

    // 댓글 내용 검증
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json<ApiResponse<Comment>>(
        {
          error: "Comment content cannot be empty",
          success: false,
        },
        { status: 400 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환
    const supabaseUserId = await getSupabaseUserId(clerkUserId);

    if (!supabaseUserId) {
      return NextResponse.json<ApiResponse<Comment>>(
        {
          error: "User not found in database",
          success: false,
        },
        { status: 404 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = getServiceRoleClient();

    // 댓글 작성
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: supabaseUserId,
        content: trimmedContent,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json<ApiResponse<Comment>>(
        {
          error: "Failed to create comment",
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Comment>>({
      data,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/comments:", error);
    return NextResponse.json<ApiResponse<Comment>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments - 댓글 삭제
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
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "commentId is required",
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

    // 댓글 소유자 확인
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "Comment not found",
          success: false,
        },
        { status: 404 }
      );
    }

    // 본인 댓글만 삭제 가능
    if (comment.user_id !== supabaseUserId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "You can only delete your own comments",
          success: false,
        },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json<ApiResponse<null>>(
        {
          error: "Failed to delete comment",
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/comments:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

