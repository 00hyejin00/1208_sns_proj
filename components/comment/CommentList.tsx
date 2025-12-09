"use client";

/**
 * @file components/comment/CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * Instagram 스타일의 댓글 목록을 표시합니다.
 * PostCard에서는 최신 2개만 미리보기로 표시하고,
 * 상세 모달에서는 전체 댓글을 스크롤 가능하게 표시합니다.
 *
 * 주요 기능:
 * - 댓글 목록 렌더링
 * - 최신 댓글 우선 정렬
 * - 삭제 버튼 (본인만 표시)
 * - 사용자 프로필 링크
 *
 * @see docs/PRD.md - 댓글 기능 섹션
 */

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { handleApiResponse, getErrorMessage } from "@/lib/utils/error-handler";

interface CommentUser {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  user: CommentUser;
  created_at: string;
  user_id: string; // 댓글 작성자 ID (삭제 권한 확인용)
}

interface CommentListProps {
  postId: string;
  initialComments?: Comment[];
  maxDisplay?: number; // 최대 표시 개수 (undefined면 전체 표시)
  showDeleteButton?: boolean; // 삭제 버튼 표시 여부
  className?: string;
  onCommentDeleted?: () => void; // 댓글 삭제 후 콜백
}

const CommentList = memo(function CommentList({
  postId,
  initialComments = [],
  maxDisplay,
  showDeleteButton = true,
  className,
  onCommentDeleted,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { userId: currentClerkUserId, isLoaded } = useAuth();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [currentSupabaseUserId, setCurrentSupabaseUserId] = useState<string | null>(null);

  // Clerk user ID를 Supabase user ID로 변환
  useEffect(() => {
    if (!isLoaded || !currentClerkUserId || !user) {
      setCurrentSupabaseUserId(null);
      return;
    }

    const fetchSupabaseUserId = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", currentClerkUserId)
          .single();

        if (error) {
          console.error("Error fetching Supabase user ID:", error);
          return;
        }

        if (data) {
          setCurrentSupabaseUserId(data.id);
        }
      } catch (error) {
        console.error("Error fetching Supabase user ID:", error);
      }
    };

    fetchSupabaseUserId();
  }, [isLoaded, currentClerkUserId, user, supabase]);

  // 초기 댓글 설정
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // 댓글 삭제
  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    setDeletingId(commentId);

    try {
      const response = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      const result = await handleApiResponse<unknown>(response);

      if (!result.success) {
        const errorMessage = "error" in result ? result.error : "댓글 삭제에 실패했습니다.";
        throw new Error(errorMessage);
      }

      // 댓글 목록에서 제거
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      // 부모 컴포넌트에 알림
      if (onCommentDeleted) {
        onCommentDeleted();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // 표시할 댓글 목록 (최신순 정렬) - useMemo로 최적화
  const displayComments = useMemo(() => {
    const sorted = [...comments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return maxDisplay ? sorted.slice(0, maxDisplay) : sorted;
  }, [comments, maxDisplay]);

  if (displayComments.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      {displayComments.map((comment) => {
        // 현재 사용자가 댓글 작성자인지 확인
        const canDelete = showDeleteButton && currentSupabaseUserId && comment.user_id === currentSupabaseUserId;

        return (
          <div key={comment.id} className="flex items-start gap-2 group">
            <div className="flex-1 min-w-0">
              <div className="text-[#262626] text-sm">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-semibold hover:opacity-70 transition-opacity mr-1"
                >
                  {comment.user.name}
                </Link>
                <span>{comment.content}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#8e8e8e] text-xs">
                  {formatRelativeTime(comment.created_at)}
                </span>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="text-[#8e8e8e] text-xs hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {deletingId === comment.id ? "삭제 중..." : "삭제"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default CommentList;

