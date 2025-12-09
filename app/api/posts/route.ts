import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { ApiResponse, PostWithDetails, Post } from "@/lib/types";

/**
 * @file app/api/posts/route.ts
 * @description 게시물 목록 조회 및 생성 API
 *
 * GET /api/posts - 게시물 목록 조회
 * Query Parameters:
 * - limit: 페이지당 게시물 수 (기본값: 10)
 * - offset: 건너뛸 게시물 수 (기본값: 0)
 * - userId: 특정 사용자의 게시물만 조회 (선택사항)
 *
 * POST /api/posts - 게시물 생성
 * FormData:
 * - image: 이미지 파일 (최대 5MB)
 * - caption: 캡션 (최대 2,200자, 선택사항)
 *
 * @see docs/PRD.md - 게시물 피드 섹션
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
              user_id: comment.user_id, // 삭제 권한 확인용
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

/**
 * POST /api/posts - 게시물 생성
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse<Post>>(
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
      return NextResponse.json<ApiResponse<Post>>(
        {
          error: "User not found in database",
          success: false,
        },
        { status: 404 }
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const caption = (formData.get("caption") as string) || null;

    // 이미지 파일 검증
    if (!imageFile) {
      return NextResponse.json<ApiResponse<Post>>(
        {
          error: "Image file is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<Post>>(
        {
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
          success: false,
        },
        { status: 400 }
      );
    }

    // 파일 타입 검증 (이미지만 허용)
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json<ApiResponse<Post>>(
        {
          error: "Only image files are allowed",
          success: false,
        },
        { status: 400 }
      );
    }

    // 캡션 길이 검증 (최대 2,200자)
    const MAX_CAPTION_LENGTH = 2200;
    if (caption && caption.length > MAX_CAPTION_LENGTH) {
      return NextResponse.json<ApiResponse<Post>>(
        {
          error: `Caption exceeds ${MAX_CAPTION_LENGTH} characters`,
          success: false,
        },
        { status: 400 }
      );
    }

    // Supabase Service Role 클라이언트 생성 (Storage 업로드용)
    const supabase = getServiceRoleClient();

    // 파일명 생성 (고유한 파일명)
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${clerkUserId}/${fileName}`;

    // Supabase Storage에 이미지 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("posts")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return NextResponse.json<ApiResponse<Post>>(
        {
          error: "Failed to upload image",
          success: false,
        },
        { status: 500 }
      );
    }

    // 업로드된 이미지의 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from("posts").getPublicUrl(filePath);

    // posts 테이블에 게시물 데이터 저장
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: supabaseUserId,
        image_url: publicUrl,
        caption: caption || null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      // 업로드된 이미지 삭제 (롤백)
      await supabase.storage.from("posts").remove([filePath]);

      return NextResponse.json<ApiResponse<Post>>(
        {
          error: "Failed to create post",
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Post>>({
      data: postData,
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/posts:", error);
    return NextResponse.json<ApiResponse<Post>>(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

