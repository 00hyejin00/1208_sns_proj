"use client";

/**
 * @file components/post/LikeButton.tsx
 * @description Instagram 스타일 좋아요 버튼 컴포넌트
 *
 * 좋아요 상태를 관리하고 클릭/더블탭 애니메이션을 제공합니다.
 *
 * 주요 기능:
 * - 빈 하트 ↔ 빨간 하트 상태 관리
 * - 클릭 애니메이션 (scale 1.3 → 1, 0.15초)
 * - 더블탭 좋아요 (모바일, 큰 하트 fade in/out, 1초)
 *
 * @see docs/PRD.md - 좋아요 기능 섹션
 */

import { Heart } from "lucide-react";
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDoubleTap?: boolean; // 이미지 영역에서 더블탭 감지 시 사용
}

export interface LikeButtonHandle {
  triggerDoubleTap: () => void;
}

const LikeButton = forwardRef<LikeButtonHandle, LikeButtonProps>(function LikeButton(
  {
    postId,
    initialLiked,
    initialLikesCount,
    onLikeChange,
    className,
    size = "md",
    showDoubleTap = false,
  },
  ref
) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const isProcessingRef = useRef(false);

  // 초기값이 변경되면 상태 업데이트 (부모 컴포넌트에서 데이터 새로고침 시)
  useEffect(() => {
    setIsLiked(initialLiked);
    setLikesCount(initialLikesCount);
  }, [initialLiked, initialLikesCount]);

  // 더블탭 하트 애니메이션
  useEffect(() => {
    if (showDoubleTapHeart) {
      const timer = setTimeout(() => {
        setShowDoubleTapHeart(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showDoubleTapHeart]);

  /**
   * 좋아요 토글 API 호출
   */
  const toggleLike = async () => {
    // 중복 요청 방지
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;

    // 낙관적 업데이트 (Optimistic Update)
    setIsLiked(newLiked);
    setLikesCount(newCount);
    setIsAnimating(true);

    try {
      const response = await fetch("/api/likes", {
        method: newLiked ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        // 실패 시 롤백
        setIsLiked(!newLiked);
        setLikesCount(likesCount);

        const data = await response.json();
        if (data.error === "Already liked" || data.error === "Unauthorized") {
          // 이미 좋아요한 경우 또는 인증 실패는 조용히 처리
          return;
        }

        console.error("Failed to toggle like:", data.error);
        return;
      }

      // 성공 시 부모 컴포넌트에 알림
      if (onLikeChange) {
        onLikeChange(newLiked, newCount);
      }
    } catch (error) {
      // 네트워크 에러 등 발생 시 롤백
      setIsLiked(!newLiked);
      setLikesCount(likesCount);
      console.error("Error toggling like:", error);
    } finally {
      isProcessingRef.current = false;
      // 애니메이션 종료
      setTimeout(() => {
        setIsAnimating(false);
      }, 150);
    }
  };

  /**
   * 더블탭 감지 및 처리
   */
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (timeDiff < 300 && timeDiff > 0) {
      // 더블탭 감지
      if (!isLiked) {
        // 좋아요가 아닌 경우에만 좋아요 추가
        setShowDoubleTapHeart(true);
        toggleLike();
      }
    }

    lastTapRef.current = now;
  };

  /**
   * 외부에서 더블탭 트리거 (이미지 영역 더블탭 시 사용)
   */
  const triggerDoubleTap = () => {
    if (!isLiked) {
      setShowDoubleTapHeart(true);
      toggleLike();
    }
  };

  // ref를 통해 외부에서 메서드 호출 가능하도록 설정
  useImperativeHandle(ref, () => ({
    triggerDoubleTap,
  }));

  /**
   * 클릭 핸들러
   */
  const handleClick = () => {
    setIsAnimating(true);
    toggleLike();
  };

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="relative">
      {/* 더블탭 큰 하트 (모바일) */}
      {showDoubleTapHeart && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none z-10",
            "animate-fade-in-out"
          )}
        >
          <Heart
            className={cn(
              "text-[#ed4956] fill-current",
              size === "sm" ? "w-12 h-12" : size === "md" ? "w-16 h-16" : "w-20 h-20"
            )}
            strokeWidth={0}
          />
        </div>
      )}

      {/* 좋아요 버튼 */}
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={handleDoubleTap}
        className={cn(
          "transition-transform duration-150 ease-out",
          isAnimating ? "scale-[1.3]" : "scale-100",
          className
        )}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          className={cn(
            sizeClasses[size],
            "transition-colors duration-150",
            isLiked ? "text-[#ed4956] fill-current" : "text-[#262626]"
          )}
          strokeWidth={isLiked ? 0 : 1.5}
        />
      </button>
    </div>
  );
});

LikeButton.displayName = "LikeButton";

export default LikeButton;

