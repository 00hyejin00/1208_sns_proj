"use client";

/**
 * @file components/post/PostCard.tsx
 * @description Instagram 스타일 게시물 카드 컴포넌트
 *
 * 게시물의 모든 정보를 표시하는 카드 컴포넌트입니다.
 * 헤더, 이미지, 액션 버튼, 좋아요 수, 캡션, 댓글 미리보기를 포함합니다.
 *
 * @see docs/PRD.md - PostCard 디자인 섹션
 */

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import type { PostWithDetails } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/format";
import { useState, useEffect, useRef } from "react";
import LikeButton from "./LikeButton";
import { useAuth } from "@clerk/nextjs";

interface PostCardProps {
  post: PostWithDetails;
  currentUserId?: string; // 현재 로그인한 사용자 ID (Clerk user ID, 좋아요 상태 확인용)
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const likeButtonRef = useRef<{ triggerDoubleTap: () => void }>(null);
  const { isLoaded } = useAuth();

  // 좋아요 수 동기화
  useEffect(() => {
    setLikesCount(post.likes_count);
  }, [post.likes_count]);

  // 캡션이 2줄을 초과하는지 확인 (대략 100자 기준)
  const captionMaxLength = 100;
  const shouldTruncate = post.caption && post.caption.length > captionMaxLength;
  const displayCaption = showFullCaption
    ? post.caption
    : post.caption && post.caption.length > captionMaxLength
    ? post.caption.slice(0, captionMaxLength) + "..."
    : post.caption;

  return (
    <article className="bg-white rounded-lg border border-[#dbdbdb] mb-4 overflow-hidden max-w-full">
      {/* 헤더 (60px 높이) */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#dbdbdb] h-[60px]">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 (32px 원형) */}
          <Link href={`/profile/${post.user.id}`}>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {/* Clerk UserButton 또는 기본 아바타 사용 가능 */}
              <span className="text-xs font-semibold text-[#262626]">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </Link>
          {/* 사용자명 */}
          <Link
            href={`/profile/${post.user.id}`}
            className="font-semibold text-[#262626] hover:opacity-70 transition-opacity"
          >
            {post.user.name}
          </Link>
        </div>
        {/* ⋯ 메뉴 */}
        <button
          type="button"
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="더보기"
        >
          <MoreHorizontal className="w-5 h-5 text-[#262626]" />
        </button>
      </header>

      {/* 이미지 영역 (1:1 정사각형) - 더블탭 좋아요 지원 */}
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          priority={false}
        />
        {/* 더블탭 감지를 위한 투명 오버레이 */}
        <div
          className="absolute inset-0 z-0 cursor-pointer"
          onDoubleClick={() => {
            // 더블탭 시 좋아요 (LikeButton에서 처리)
            if (likeButtonRef.current && !isLiked) {
              likeButtonRef.current.triggerDoubleTap();
            }
          }}
        />
      </div>

      {/* 액션 버튼 (48px 높이) */}
      <div className="px-4 py-3 flex items-center justify-between h-[48px]">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 */}
          <LikeButton
            ref={likeButtonRef}
            postId={post.id}
            initialLiked={isLiked}
            initialLikesCount={likesCount}
            onLikeChange={(liked, newCount) => {
              setIsLiked(liked);
              setLikesCount(newCount);
            }}
          />
          {/* 댓글 버튼 */}
          <button
            type="button"
            className="hover:opacity-70 transition-opacity"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6 text-[#262626]" />
          </button>
          {/* 공유 버튼 (UI만) */}
          <button
            type="button"
            className="hover:opacity-70 transition-opacity"
            aria-label="공유"
          >
            <Send className="w-6 h-6 text-[#262626]" />
          </button>
        </div>
        {/* 북마크 버튼 (UI만) */}
        <button
          type="button"
          className="hover:opacity-70 transition-opacity"
          aria-label="저장"
        >
          <Bookmark className="w-6 h-6 text-[#262626]" />
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-3 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <div className="font-semibold text-[#262626] text-sm">
            좋아요 {likesCount.toLocaleString()}개
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-[#262626] text-sm">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-semibold hover:opacity-70 transition-opacity mr-1"
            >
              {post.user.name}
            </Link>
            <span>{displayCaption}</span>
            {shouldTruncate && !showFullCaption && (
              <button
                type="button"
                onClick={() => setShowFullCaption(true)}
                className="text-[#8e8e8e] ml-1 hover:opacity-70 transition-opacity"
              >
                더 보기
              </button>
            )}
          </div>
        )}

        {/* 댓글 미리보기 */}
        {post.comments_count > 0 && (
          <div className="space-y-1">
            {post.comments_count > 2 && (
              <button
                type="button"
                className="text-[#8e8e8e] text-sm hover:opacity-70 transition-opacity"
              >
                댓글 {post.comments_count}개 모두 보기
              </button>
            )}
            {post.recent_comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="text-[#262626] text-sm">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-semibold hover:opacity-70 transition-opacity mr-1"
                >
                  {comment.user.name}
                </Link>
                <span>{comment.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* 시간 표시 */}
        <div className="text-[#8e8e8e] text-xs uppercase">
          {formatRelativeTime(post.created_at)}
        </div>
      </div>
    </article>
  );
}

