"use client";

/**
 * @file components/post/CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 작성 모달입니다.
 * 이미지 업로드 및 캡션 입력 기능을 제공합니다.
 *
 * 주요 기능:
 * - 이미지 미리보기
 * - 텍스트 입력 (최대 2,200자)
 * - 파일 선택 버튼
 * - 업로드 버튼
 *
 * @see docs/PRD.md - 게시물 작성 섹션
 */

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CAPTION_LENGTH = 2200;

export default function CreatePostModal({
  open,
  onOpenChange,
}: CreatePostModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  // 파일 선택 핸들러
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      setError(`파일 크기는 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB입니다.`);
      return;
    }

    // 이미지 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 파일 선택 버튼 클릭
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 게시물 업로드
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    if (!isLoaded || !userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption);

      // API 호출
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "게시물 업로드에 실패했습니다.");
      }

      // 성공 시 모달 닫기 및 상태 초기화
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      onOpenChange(false);

      // PostFeed에 게시물 작성 완료 이벤트 전달
      window.dispatchEvent(new CustomEvent("postCreated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시물 업로드에 실패했습니다.");
      console.error("Error uploading post:", err);
    } finally {
      setUploading(false);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 py-4 border-b border-[#dbdbdb]">
          <DialogTitle className="text-center text-lg font-semibold text-[#262626]">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* 이미지 선택 영역 */}
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#dbdbdb] rounded-lg">
              <ImageIcon className="w-16 h-16 text-[#8e8e8e] mb-4" />
              <p className="text-[#262626] font-semibold mb-2">
                사진을 여기에 끌어다 놓으세요
              </p>
              <p className="text-[#8e8e8e] text-sm mb-4">
                최대 {MAX_FILE_SIZE / 1024 / 1024}MB, JPG, PNG, WEBP
              </p>
              <Button
                type="button"
                onClick={handleSelectFile}
                className="bg-[#0095f6] hover:bg-[#1877f2] text-white"
              >
                컴퓨터에서 선택
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* 이미지 미리보기 */}
              <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="미리보기"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="이미지 제거"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* 캡션 입력 */}
              <div className="space-y-2">
                <label
                  htmlFor="caption"
                  className="text-sm font-semibold text-[#262626]"
                >
                  캡션
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="캡션을 입력하세요..."
                  maxLength={MAX_CAPTION_LENGTH}
                  rows={4}
                  className="w-full px-3 py-2 border border-[#dbdbdb] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0095f6] focus:border-transparent text-[#262626]"
                />
                <div className="text-right text-xs text-[#8e8e8e]">
                  {caption.length} / {MAX_CAPTION_LENGTH}
                </div>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 업로드 버튼 */}
          {previewUrl && (
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="bg-[#0095f6] hover:bg-[#1877f2] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "업로드 중..." : "공유하기"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

