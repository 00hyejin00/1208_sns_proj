"use client";

/**
 * @file components/profile/PostGrid.tsx
 * @description 프로필 페이지 게시물 그리드 컴포넌트
 *
 * Instagram 스타일의 3열 그리드 레이아웃으로 게시물을 표시합니다.
 * 각 게시물은 1:1 정사각형 썸네일로 표시되며, Hover 시 좋아요/댓글 수를 표시합니다.
 *
 * 주요 기능:
 * - 3열 그리드 레이아웃 (반응형)
 * - 1:1 정사각형 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 모달 열기
 *
 * @see docs/PRD.md - 프로필 페이지 섹션
 */

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import type { PostWithDetails } from "@/lib/types";
import PostModal from "@/components/post/PostModal";

interface PostGridProps {
  posts: PostWithDetails[];
  userId?: string; // 특정 사용자의 게시물만 표시
}

export default function PostGrid({ posts, userId }: PostGridProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 게시물 클릭 핸들러
  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedPostId(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#262626] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#262626]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-xl font-light text-[#262626]">게시물 없음</p>
      </div>
    );
  }

  return (
    <>
      {/* 3열 그리드 */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 cursor-pointer group"
            onClick={() => handlePostClick(post.id)}
          >
            {/* 썸네일 이미지 */}
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 33vw"
            />

            {/* Hover 오버레이 (좋아요/댓글 수 표시) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
              <div className="flex items-center gap-1 text-white">
                <Heart className="w-6 h-6 fill-white" />
                <span className="font-semibold">{post.likes_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="font-semibold">{post.comments_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 게시물 상세 모달 */}
      <PostModal
        postId={selectedPostId}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        allPosts={posts}
      />
    </>
  );
}

