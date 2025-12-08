import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, PostWithDetails } from "@/lib/types";

/**
 * @file app/api/posts/route.ts
 * @description 게시물 목록 조회 API
 *
 * GET /api/posts
 * Query Parameters:
 * - limit: 페이지당 게시물 수 (기본값: 10)
 * - offset: 건너뛸 게시물 수 (기본값: 0)
 * - userId: 특정 사용자의 게시물만 조회 (선택사항)
 *
 * @see docs/PRD.md - 게시물 피드 섹션
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userId = searchParams.get("userId");

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 기본 쿼리: post_stats 뷰에서 데이터 가져오기
    let query = supabase
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // userId가 제공된 경우 필터링
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: postsStats, error: postsError } = await query;

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return NextResponse.json<ApiResponse<PostWithDetails[]>>(
        {
          error: "Failed to fetch posts",
          success: false,
        },
        { status: 500 }
      );
    }

    if (!postsStats || postsStats.length === 0) {
      return NextResponse.json<ApiResponse<PostWithDetails[]>>({
        data: [],
        success: true,
      });
    }

    // 각 게시물에 대한 사용자 정보 및 최신 댓글 가져오기
    const postsWithDetails: PostWithDetails[] = await Promise.all(
      postsStats.map(async (post) => {
        // 사용자 정보 가져오기
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, name")
          .eq("id", post.user_id)
          .single();

        if (userError) {
          console.error(`Error fetching user ${post.user_id}:`, userError);
        }

        // 최신 댓글 2개 가져오기
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
          .eq("post_id", post.post_id)
          .order("created_at", { ascending: false })
          .limit(2);

        if (commentsError) {
          console.error(
            `Error fetching comments for post ${post.post_id}:`,
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
            };
          })
        );

        return {
          id: post.post_id,
          user_id: post.user_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          updated_at: post.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          user: {
            id: user?.id || post.user_id,
            name: user?.name || "Unknown",
          },
          recent_comments: commentsWithUsers,
        };
      })
    );

    return NextResponse.json<ApiResponse<PostWithDetails[]>>({
      data: postsWithDetails,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/posts:", error);
    return NextResponse.json<ApiResponse<PostWithDetails[]>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

