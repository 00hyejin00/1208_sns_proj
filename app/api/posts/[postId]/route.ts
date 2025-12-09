import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { ApiResponse, PostWithDetails } from "@/lib/types";

/**
 * @file app/api/posts/[postId]/route.ts
 * @description 게시물 상세 조회 API
 *
 * GET /api/posts/[postId] - 게시물 상세 정보 조회
 * - 게시물 정보
 * - 사용자 정보
 * - 전체 댓글 목록 (최신순)
 *
 * @see docs/PRD.md - 게시물 상세 모달 섹션
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json<ApiResponse<PostWithDetails>>(
        {
          error: "postId is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Clerk 인증 확인 (선택사항 - 로그인하지 않은 사용자도 게시물을 볼 수 있음)
    const { userId: clerkUserId } = await auth();
    let currentSupabaseUserId: string | null = null;

    // 로그인한 사용자의 경우 Supabase user ID 가져오기
    if (clerkUserId) {
      const supabaseService = getServiceRoleClient();
      const { data: userData } = await supabaseService
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (userData) {
        currentSupabaseUserId = userData.id;
      }
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 게시물 통계 정보 가져오기
    const { data: postStats, error: postStatsError } = await supabase
      .from("post_stats")
      .select(
        `
        post_id,
        user_id,
        image_url,
        caption,
        created_at,
        likes_count,
        comments_count
      `
      )
      .eq("post_id", postId)
      .single();

    if (postStatsError || !postStats) {
      return NextResponse.json<ApiResponse<PostWithDetails>>(
        {
          error: "Post not found",
          success: false,
        },
        { status: 404 }
      );
    }

    // 사용자 정보 가져오기
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name")
      .eq("id", postStats.user_id)
      .single();

    if (userError) {
      console.error(`Error fetching user ${postStats.user_id}:`, userError);
    }

    // 전체 댓글 가져오기 (최신순)
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(
        `
        id,
        content,
        created_at,
        user_id
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error(
        `Error fetching comments for post ${postId}:`,
        commentsError
      );
    }

    // 댓글의 사용자 정보 가져오기
    const commentsWithUsers = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: commentUser } = await supabase
          .from("users")
          .select("id, name")
          .eq("id", comment.user_id)
          .single();

        return {
          id: comment.id,
          content: comment.content,
          user: {
            id: commentUser?.id || comment.user_id,
            name: commentUser?.name || "Unknown",
          },
          created_at: comment.created_at,
          user_id: comment.user_id, // 삭제 권한 확인용
        };
      })
    );

    // 현재 사용자가 이 게시물에 좋아요를 눌렀는지 확인
    let isLiked = false;
    if (currentSupabaseUserId) {
      const { data: likeData } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", currentSupabaseUserId)
        .single();

      isLiked = !!likeData;
    }

    const postWithDetails: PostWithDetails = {
      id: postStats.post_id,
      user_id: postStats.user_id,
      image_url: postStats.image_url,
      caption: postStats.caption,
      created_at: postStats.created_at,
      updated_at: postStats.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
      likes_count: postStats.likes_count || 0,
      comments_count: postStats.comments_count || 0,
      is_liked: isLiked, // 현재 사용자의 좋아요 상태
      user: {
        id: user?.id || postStats.user_id,
        name: user?.name || "Unknown",
      },
      recent_comments: commentsWithUsers,
    };

    return NextResponse.json<ApiResponse<PostWithDetails>>({
      data: postWithDetails,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/posts/[postId]:", error);
    return NextResponse.json<ApiResponse<PostWithDetails>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

