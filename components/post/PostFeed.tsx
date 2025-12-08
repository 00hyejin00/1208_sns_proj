"use client";

/**
 * @file components/post/PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 렌더링하고 무한 스크롤을 처리합니다.
 * Intersection Observer를 사용하여 하단 도달 시 자동으로 다음 페이지를 로드합니다.
 *
 * @see docs/PRD.md - 홈 피드 페이지 섹션
 */

import { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import type { PostWithDetails, ApiResponse } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";

interface PostFeedProps {
  userId?: string; // 특정 사용자의 게시물만 표시 (프로필 페이지용)
  initialPosts?: PostWithDetails[]; // Server Component에서 초기 데이터 전달
}

const POSTS_PER_PAGE = 10;

export default function PostFeed({ userId, initialPosts }: PostFeedProps) {
  const { userId: currentUserId } = useAuth();
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialPosts?.length || 0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 게시물 가져오기 함수
  const fetchPosts = useCallback(
    async (currentOffset: number) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: POSTS_PER_PAGE.toString(),
          offset: currentOffset.toString(),
        });

        if (userId) {
          params.append("userId", userId);
        }

        const response = await fetch(`/api/posts?${params.toString()}`);
        const data: ApiResponse<PostWithDetails[]> = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch posts");
        }

        if (data.data) {
          if (data.data.length === 0) {
            setHasMore(false);
          } else {
            setPosts((prev) => [...prev, ...data.data!]);
            setOffset(currentOffset + data.data.length);
            // 다음 페이지가 더 있는지 확인
            if (data.data.length < POSTS_PER_PAGE) {
              setHasMore(false);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    },
    [loading, userId]
  );

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts(offset);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, offset, fetchPosts]);

  // 초기 로드 (initialPosts가 없을 때만)
  useEffect(() => {
    if (!initialPosts || initialPosts.length === 0) {
      fetchPosts(0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full">
      {/* 게시물 목록 */}
      {posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId || undefined} />
          ))}
        </>
      ) : (
        !loading && (
          <div className="bg-white rounded-lg border border-[#dbdbdb] p-8 text-center">
            <p className="text-[#8e8e8e]">게시물이 없습니다.</p>
          </div>
        )
      )}

      {/* 로딩 스켈레톤 */}
      {loading && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-white rounded-lg border border-[#dbdbdb] p-4 text-center">
          <p className="text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => fetchPosts(offset)}
            className="mt-2 text-[#0095f6] hover:opacity-70 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 무한 스크롤 감지 요소 */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-4" aria-hidden="true" />
      )}

      {/* 더 이상 게시물이 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-[#8e8e8e] text-sm">
          모든 게시물을 불러왔습니다.
        </div>
      )}
    </div>
  );
}

