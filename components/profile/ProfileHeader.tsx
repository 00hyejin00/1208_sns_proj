"use client";

/**
 * @file components/profile/ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * Instagram 스타일의 프로필 헤더입니다.
 * 프로필 이미지, 사용자명, 통계(게시물 수, 팔로워 수, 팔로잉 수)를 표시합니다.
 *
 * 주요 기능:
 * - 프로필 이미지 (150px Desktop / 90px Mobile)
 * - 사용자명
 * - 통계 (게시물 수, 팔로워 수, 팔로잉 수)
 * - "팔로우" / "팔로잉" 버튼 (다른 사람 프로필, 1차 MVP에서는 UI만)
 * - "프로필 편집" 버튼 (본인 프로필, 1차 제외)
 *
 * @see docs/PRD.md - 프로필 페이지 섹션
 */

import { useAuth } from "@clerk/nextjs";
import type { UserStats } from "@/lib/types";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import FollowButton from "./FollowButton";

interface ProfileHeaderProps {
  user: UserStats & { is_following?: boolean }; // 팔로우 상태 포함
  isOwnProfile: boolean;
  onFollowChange?: (isFollowing: boolean) => void; // 팔로우 상태 변경 콜백
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  onFollowChange,
}: ProfileHeaderProps) {
  const { userId: currentClerkUserId } = useAuth();
  const isFollowing = user.is_following || false;

  // 프로필 이미지 초기 (이름의 첫 글자)
  const profileInitial = user.name.charAt(0).toUpperCase();

  return (
    <div className="px-4 py-6 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:gap-12">
        {/* 프로필 이미지 */}
        <div className="flex justify-center md:justify-start mb-4 md:mb-0">
          <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-[#dbdbdb]">
            <span className="text-3xl md:text-5xl font-semibold text-[#262626]">
              {profileInitial}
            </span>
          </div>
        </div>

        {/* 프로필 정보 */}
        <div className="flex-1">
          {/* 사용자명 및 버튼 */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-light text-[#262626] mb-4 md:mb-0">
              {user.name}
            </h1>

            {/* 버튼 영역 */}
            {isOwnProfile ? (
              // 본인 프로필: 프로필 편집 버튼 (1차 MVP에서는 제외)
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-sm font-semibold px-4 py-1.5 border-[#dbdbdb] text-[#262626] hover:bg-gray-50"
                  disabled
                >
                  프로필 편집
                </Button>
                <Button
                  variant="outline"
                  className="text-sm font-semibold px-4 py-1.5 border-[#dbdbdb] text-[#262626] hover:bg-gray-50"
                  disabled
                >
                  보관함 보기
                </Button>
              </div>
            ) : (
              // 다른 사람 프로필: 팔로우/팔로잉 버튼
              <div className="flex gap-2">
                <FollowButton
                  userId={user.id}
                  initialFollowing={isFollowing}
                  onFollowChange={onFollowChange}
                  isOwnProfile={isOwnProfile}
                />
                <Button
                  variant="outline"
                  className="text-sm font-semibold px-4 py-1.5 border-[#dbdbdb] text-[#262626] hover:bg-gray-50"
                  disabled
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  메시지
                </Button>
              </div>
            )}
          </div>

          {/* 통계 */}
          <div className="flex gap-6 md:gap-8 mb-4">
            <div className="text-center md:text-left">
              <span className="font-semibold text-[#262626]">
                {user.posts_count.toLocaleString()}
              </span>
              <span className="text-[#8e8e8e] ml-1">게시물</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold text-[#262626]">
                {user.followers_count.toLocaleString()}
              </span>
              <span className="text-[#8e8e8e] ml-1">팔로워</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold text-[#262626]">
                {user.following_count.toLocaleString()}
              </span>
              <span className="text-[#8e8e8e] ml-1">팔로잉</span>
            </div>
          </div>

          {/* 사용자명 (모바일에서만 표시) */}
          <div className="md:hidden">
            <p className="font-semibold text-[#262626]">{user.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

