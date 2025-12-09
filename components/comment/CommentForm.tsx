"use client";

/**
 * @file components/comment/CommentForm.tsx
 * @description 댓글 작성 폼 컴포넌트
 *
 * Instagram 스타일의 댓글 입력 폼입니다.
 * Enter 키 또는 "게시" 버튼으로 댓글을 제출할 수 있습니다.
 *
 * 주요 기능:
 * - 댓글 입력 필드 ("댓글 달기...")
 * - Enter 키 또는 "게시" 버튼으로 제출
 * - 로딩 상태 표시
 *
 * @see docs/PRD.md - 댓글 기능 섹션
 */

import { useState, FormEvent, KeyboardEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
  placeholder?: string;
  className?: string;
}

export default function CommentForm({
  postId,
  onCommentAdded,
  placeholder = "댓글 달기...",
  className,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, userId } = useAuth();

  // 댓글 제출
  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    if (!isLoaded || !userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: trimmedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "댓글 작성에 실패했습니다.");
      }

      // 성공 시 입력 필드 초기화
      setContent("");

      // 부모 컴포넌트에 알림
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enter 키 처리 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex items-center gap-2 border-t border-[#dbdbdb] px-4 py-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting || !isLoaded || !userId}
          rows={1}
          className="flex-1 resize-none border-none outline-none text-sm text-[#262626] placeholder:text-[#8e8e8e] disabled:opacity-50"
          style={{
            minHeight: "18px",
            maxHeight: "80px",
          }}
        />
        <Button
          type="submit"
          disabled={isSubmitting || content.trim().length === 0 || !isLoaded || !userId}
          className="text-[#0095f6] hover:text-[#1877f2] font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed px-0 py-0 h-auto"
        >
          {isSubmitting ? "게시 중..." : "게시"}
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
    </form>
  );
}

