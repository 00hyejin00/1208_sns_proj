/**
 * @file components/post/PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 스켈레톤 UI
 *
 * PostCard와 동일한 레이아웃 구조를 가진 Skeleton UI입니다.
 * Shimmer 애니메이션 효과를 포함합니다.
 *
 * @see docs/PRD.md - 로딩 상태 섹션
 */

export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#dbdbdb] mb-4 overflow-hidden">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#dbdbdb]">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 스켈레톤 */}
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-shimmer" />
          {/* 사용자명 스켈레톤 */}
          <div className="h-4 w-24 bg-gray-200 rounded animate-shimmer" />
        </div>
        {/* 메뉴 아이콘 스켈레톤 */}
        <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
      </div>

      {/* 이미지 스켈레톤 */}
      <div className="aspect-square w-full bg-gray-200 animate-shimmer" />

      {/* 액션 버튼 스켈레톤 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
      </div>

      {/* 컨텐츠 스켈레톤 */}
      <div className="px-4 pb-3 space-y-2">
        {/* 좋아요 수 스켈레톤 */}
        <div className="h-4 w-32 bg-gray-200 rounded animate-shimmer" />
        {/* 캡션 스켈레톤 */}
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 rounded animate-shimmer" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-shimmer" />
        </div>
        {/* 댓글 미리보기 스켈레톤 */}
        <div className="space-y-1 pt-1">
          <div className="h-3 w-24 bg-gray-200 rounded animate-shimmer" />
          <div className="h-3 w-full bg-gray-200 rounded animate-shimmer" />
          <div className="h-3 w-5/6 bg-gray-200 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

