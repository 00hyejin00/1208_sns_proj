"use client";

/**
 * @file components/post/PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 상세 모달입니다.
 * Desktop에서는 모달 형식으로, Mobile에서는 전체 페이지로 표시됩니다.
 *
 * 주요 기능:
 * - Desktop: 모달 형식 (이미지 50% + 댓글 50%)
 * - Mobile: 전체 페이지로 전환
 * - 닫기 버튼 (✕)
 * - 이전/다음 게시물 네비게이션 (Desktop)
 * - 전체 댓글 목록 표시
 * - 댓글 작성 기능
 *
 * @see docs/PRD.md - 게시물 상세 모달 섹션
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import LikeButton from "./LikeButton";
import CommentList from "@/components/comment/CommentList";
import CommentForm from "@/components/comment/CommentForm";
import type { PostWithDetails, ApiResponse } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/format";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface PostModalProps {
  postId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allPosts?: PostWithDetails[]; // 이전/다음 게시물 네비게이션용
}

export default function PostModal({
  postId,
  open,
  onOpenChange,
  allPosts = [],
}: PostModalProps) {
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [comments, setComments] = useState<PostWithDetails["recent_comments"]>([]);
  const { userId: currentUserId } = useAuth();

  // 현재 게시물의 인덱스 찾기
  const currentPostIndex = postId
    ? allPosts.findIndex((p) => p.id === postId)
    : -1;
  const hasPrevious = currentPostIndex > 0;
  const hasNext = currentPostIndex >= 0 && currentPostIndex < allPosts.length - 1;

  // 게시물 상세 정보 로드
  useEffect(() => {
    if (!open || !postId) {
      setPost(null);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/posts/${postId}`);
        const data: ApiResponse<PostWithDetails> = await response.json();

        if (!response.ok || !data.success || !data.data) {
          throw new Error(data.error || "게시물을 불러올 수 없습니다.");
        }

        setPost(data.data);
        setIsLiked(data.data.is_liked || false);
        setLikesCount(data.data.likes_count);
        setCommentsCount(data.data.comments_count);
        setComments(data.data.recent_comments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "게시물을 불러올 수 없습니다.");
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [open, postId]);

  // 이전 게시물로 이동
  const handlePrevious = () => {
    if (hasPrevious && allPosts[currentPostIndex - 1]) {
      const previousPost = allPosts[currentPostIndex - 1];
      // 모달을 닫았다가 다시 열기 (애니메이션 효과)
      onOpenChange(false);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("postModalNavigate", { detail: { postId: previousPost.id } }));
      }, 200);
    }
  };

  // 다음 게시물로 이동
  const handleNext = () => {
    if (hasNext && allPosts[currentPostIndex + 1]) {
      const nextPost = allPosts[currentPostIndex + 1];
      // 모달을 닫았다가 다시 열기 (애니메이션 효과)
      onOpenChange(false);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("postModalNavigate", { detail: { postId: nextPost.id } }));
      }, 200);
    }
  };

  // 댓글 추가 후 콜백
  const handleCommentAdded = () => {
    if (!postId) return;

    // 게시물 정보 다시 로드
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        const data: ApiResponse<PostWithDetails> = await response.json();

        if (response.ok && data.success && data.data) {
          setPost(data.data);
          setCommentsCount(data.data.comments_count);
          setComments(data.data.recent_comments);
        }
      } catch (err) {
        console.error("Error refreshing post:", err);
      }
    };

    fetchPost();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[100vw] md:max-w-[900px] lg:max-w-[1000px] h-[100vh] md:h-auto md:max-h-[90vh] p-0 overflow-hidden md:rounded-lg fixed inset-0 md:inset-auto md:translate-x-[-50%] md:translate-y-[-50%] md:top-[50%] md:left-[50%]">
        {/* 닫기 버튼 (상단 우측) */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors md:bg-white md:hover:bg-gray-100 md:shadow-md"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-white md:text-[#262626]" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-[#8e8e8e]">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : post ? (
          <div className="flex flex-col md:flex-row h-full">
            {/* 이미지 영역 (Desktop: 50%, Mobile: 100%) */}
            <div className="relative w-full md:w-1/2 h-[50vh] md:h-[600px] bg-gray-100 flex-shrink-0">
              <Image
                src={post.image_url}
                alt={post.caption || "게시물 이미지"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* 이전/다음 네비게이션 버튼 (Desktop만) */}
              {hasPrevious && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="이전 게시물"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              )}
              {hasNext && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="다음 게시물"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            {/* 댓글 영역 (Desktop: 50%, Mobile: 100%) */}
            <div className="flex flex-col w-full md:w-1/2 h-[50vh] md:h-[600px] bg-white border-t md:border-t-0 md:border-l border-[#dbdbdb]">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#dbdbdb] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${post.user.id}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <span className="text-xs font-semibold text-[#262626]">
                        {post.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="font-semibold text-[#262626] hover:opacity-70 transition-opacity"
                  >
                    {post.user.name}
                  </Link>
                </div>
                <button
                  type="button"
                  className="p-1 hover:opacity-70 transition-opacity"
                  aria-label="더보기"
                >
                  <MoreHorizontal className="w-5 h-5 text-[#262626]" />
                </button>
              </div>

              {/* 댓글 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
                {/* 캡션 */}
                {post.caption && (
                  <div className="text-[#262626] text-sm">
                    <Link
                      href={`/profile/${post.user.id}`}
                      className="font-semibold hover:opacity-70 transition-opacity mr-1"
                    >
                      {post.user.name}
                    </Link>
                    <span>{post.caption}</span>
                  </div>
                )}

                {/* 댓글 목록 */}
                {comments.length > 0 ? (
                  <CommentList
                    postId={post.id}
                    initialComments={comments.map((comment) => ({
                      id: comment.id,
                      content: comment.content,
                      user: comment.user,
                      created_at: comment.created_at,
                      user_id: comment.user_id || "",
                    }))}
                    showDeleteButton={true}
                    onCommentDeleted={handleCommentAdded}
                    // maxDisplay prop을 전달하지 않음 = 전체 댓글 표시
                  />
                ) : (
                  <div className="text-center text-[#8e8e8e] text-sm py-8">
                    댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </div>
                )}
              </div>

              {/* 액션 버튼 및 좋아요 수 */}
              <div className="border-t border-[#dbdbdb] flex-shrink-0">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <LikeButton
                      postId={post.id}
                      initialLiked={isLiked}
                      initialLikesCount={likesCount}
                      onLikeChange={(liked, newCount) => {
                        setIsLiked(liked);
                        setLikesCount(newCount);
                      }}
                    />
                    <button
                      type="button"
                      className="hover:opacity-70 transition-opacity"
                      aria-label="댓글"
                    >
                      <MessageCircle className="w-6 h-6 text-[#262626]" />
                    </button>
                    <button
                      type="button"
                      className="hover:opacity-70 transition-opacity"
                      aria-label="공유"
                    >
                      <Send className="w-6 h-6 text-[#262626]" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="hover:opacity-70 transition-opacity"
                    aria-label="저장"
                  >
                    <Bookmark className="w-6 h-6 text-[#262626]" />
                  </button>
                </div>

                {/* 좋아요 수 */}
                {likesCount > 0 && (
                  <div className="px-4 pb-2 font-semibold text-[#262626] text-sm">
                    좋아요 {likesCount.toLocaleString()}개
                  </div>
                )}

                {/* 시간 표시 */}
                <div className="px-4 pb-2 text-[#8e8e8e] text-xs uppercase">
                  {formatRelativeTime(post.created_at)}
                </div>

                {/* 댓글 작성 폼 */}
                <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

