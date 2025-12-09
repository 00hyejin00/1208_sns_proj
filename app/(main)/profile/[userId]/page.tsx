"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostGrid from "@/components/profile/PostGrid";
import type { UserStats, ApiResponse, PostWithDetails } from "@/lib/types";

/**
 * @file app/(main)/profile/[userId]/page.tsx
 * @description 프로필 페이지
 *
 * 사용자 프로필을 표시하는 페이지입니다.
 * ProfileHeader와 PostGrid를 통합하여 사용자 정보 및 게시물을 표시합니다.
 *
 * @see docs/PRD.md - 프로필 페이지 섹션
 */

export default function ProfilePage() {
  const params = useParams();
  const supabaseUserId = params.userId as string;
  const { userId: currentClerkUserId } = useAuth();
  const [user, setUser] = useState<(UserStats & { is_following?: boolean }) | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 및 게시물 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 사용자 정보 조회
        const userResponse = await fetch(`/api/users/${supabaseUserId}`);
        if (userResponse.ok) {
          const userData: ApiResponse<UserStats & { is_following?: boolean }> =
            await userResponse.json();
          if (userData.success && userData.data) {
            setUser(userData.data);
          }
        } else {
          setError("사용자를 찾을 수 없습니다.");
        }

        // 게시물 목록 조회
        const postsResponse = await fetch(
          `/api/posts?userId=${supabaseUserId}&limit=100`
        );
        if (postsResponse.ok) {
          const postsData: ApiResponse<PostWithDetails[]> =
            await postsResponse.json();
          if (postsData.success && postsData.data) {
            setPosts(postsData.data);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (supabaseUserId) {
      fetchData();
    }
  }, [supabaseUserId]);

  // 현재 사용자의 Supabase user ID 가져오기 (본인 프로필 확인용)
  const [currentSupabaseUserId, setCurrentSupabaseUserId] = useState<string | null>(null);

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

  // 본인 프로필 여부 확인
  const isOwnProfile = currentSupabaseUserId === supabaseUserId;

  // 팔로우 상태 변경 핸들러
  const handleFollowChange = (isFollowing: boolean) => {
    if (!user) return;

    setUser({
      ...user,
      is_following: isFollowing,
      followers_count: isFollowing
        ? user.followers_count + 1
        : Math.max(0, user.followers_count - 1),
    });
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#8e8e8e]">로딩 중...</p>
      </div>
    );
  }

  // 에러 또는 사용자를 찾을 수 없는 경우
  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold text-[#262626] mb-2">
            {error || "사용자를 찾을 수 없습니다"}
          </p>
          <p className="text-[#8e8e8e]">존재하지 않는 사용자입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[935px] mx-auto px-4 py-6 md:py-12">
      {/* 프로필 헤더 */}
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        onFollowChange={handleFollowChange}
      />

      {/* 탭 (게시물, 릴스, 태그됨) - 1차 MVP에서는 게시물만 */}
      <div className="border-t border-[#dbdbdb] mt-6">
        <div className="flex justify-center gap-16">
          <button
            type="button"
            className="py-4 border-t border-[#262626] -mt-px text-sm font-semibold text-[#262626] flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
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
            게시물
          </button>
          {/* 릴스, 태그됨은 1차 MVP에서 제외 */}
        </div>
      </div>

      {/* 게시물 그리드 */}
      <div className="mt-6">
        <PostGrid posts={posts} userId={supabaseUserId} />
      </div>
    </div>
  );
}

