"use client";

/**
 * @file components/profile/FollowButton.tsx
 * @description 팔로우 버튼 컴포넌트
 *
 * Instagram 스타일의 팔로우/팔로잉 버튼입니다.
 *
 * 주요 기능:
 * - "팔로우" 버튼 (파란색, 미팔로우 상태)
 * - "팔로잉" 버튼 (회색, 팔로우 중 상태)
 * - Hover 시 "언팔로우" (빨간 테두리)
 * - 클릭 시 즉시 API 호출 및 UI 업데이트
 *
 * @see docs/PRD.md - 팔로우 기능 섹션
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { handleApiResponse, getErrorMessage } from "@/lib/utils/error-handler";

interface FollowButtonProps {
  userId: string; // 팔로우할 사용자의 Supabase user ID
  initialFollowing: boolean; // 초기 팔로우 상태
  onFollowChange?: (isFollowing: boolean) => void; // 팔로우 상태 변경 콜백
  isOwnProfile?: boolean; // 본인 프로필 여부
}

export default function FollowButton({
  userId,
  initialFollowing,
  onFollowChange,
  isOwnProfile = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { userId: currentClerkUserId } = useAuth();
  const [currentSupabaseUserId, setCurrentSupabaseUserId] = useState<string | null>(null);

  // 현재 사용자의 Supabase user ID 가져오기
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (!currentClerkUserId) {
        setCurrentSupabaseUserId(null);
        return;
      }

      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCurrentSupabaseUserId(data.data.id);
          }
        }
      } catch (err) {
        console.error("Error fetching current user ID:", err);
      }
    };

    fetchCurrentUserId();
  }, [currentClerkUserId]);

  // 본인 프로필이거나 로그인하지 않은 경우 버튼 비활성화
  const isDisabled = isOwnProfile || !currentClerkUserId || currentSupabaseUserId === userId;

  // 본인 프로필이거나 로그인하지 않은 경우 버튼 숨김 (이미 ProfileHeader에서 처리되지만 안전장치)
  if (isDisabled) {
    return null;
  }

  // 팔로우/언팔로우 핸들러
  const handleFollow = async () => {
    if (isLoading || isDisabled) return;

    // 추가 안전장치: 본인 프로필 체크
    if (currentSupabaseUserId === userId) {
      console.warn("Cannot follow yourself");
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // 언팔로우
        const response = await fetch("/api/follows", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ followingId: userId }),
        });

        const result = await handleApiResponse<unknown>(response);

        if (!result.success) {
          const errorMessage = "error" in result ? result.error : "언팔로우에 실패했습니다.";
          throw new Error(errorMessage);
        }

        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        // 팔로우
        const response = await fetch("/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ followingId: userId }),
        });

        const result = await handleApiResponse<unknown>(response);

        if (!result.success) {
          const errorMessage = "error" in result ? result.error : "팔로우에 실패했습니다.";
          throw new Error(errorMessage);
        }

        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading || isDisabled}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`text-sm font-semibold px-6 py-1.5 transition-colors ${
        isFollowing
          ? isHovering
            ? "bg-white hover:bg-red-50 text-red-600 border border-red-600"
            : "bg-gray-200 hover:bg-gray-300 text-[#262626]"
          : "bg-[#0095f6] hover:bg-[#1877f2] text-white"
      }`}
    >
      {isLoading
        ? "처리 중..."
        : isFollowing
        ? isHovering
          ? "언팔로우"
          : "팔로잉"
        : "팔로우"}
    </Button>
  );
}

