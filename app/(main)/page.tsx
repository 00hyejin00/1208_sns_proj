/**
 * @file app/(main)/page.tsx
 * @description Instagram 스타일 홈 피드 페이지 (임시)
 *
 * 현재는 임시 페이지입니다.
 * 나중에 PostFeed 컴포넌트로 교체될 예정입니다.
 *
 * @see docs/PRD.md - 홈 피드 페이지 섹션
 */

export default function HomePage() {
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border border-[#dbdbdb] p-8 text-center">
        <h1 className="text-2xl font-bold text-[#262626] mb-4">홈 피드</h1>
        <p className="text-[#8e8e8e]">
          게시물 피드가 여기에 표시됩니다.
          <br />
          (PostFeed 컴포넌트 구현 예정)
        </p>
      </div>
    </div>
  );
}

