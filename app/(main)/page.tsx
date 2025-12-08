/**
 * @file app/(main)/page.tsx
 * @description Instagram 스타일 홈 피드 페이지
 *
 * PostFeed 컴포넌트를 통합하여 게시물 목록을 표시합니다.
 *
 * @see docs/PRD.md - 홈 피드 페이지 섹션
 */

import { Suspense } from "react";
import PostFeed from "@/components/post/PostFeed";
import PostCardSkeleton from "@/components/post/PostCardSkeleton";

export default function HomePage() {
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        }
      >
        <PostFeed />
      </Suspense>
    </div>
  );
}

