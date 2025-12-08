"use client";

/**
 * @file components/layout/Header.tsx
 * @description Instagram 스타일 모바일 헤더 컴포넌트
 *
 * Mobile 전용 (<768px):
 * - 높이: 60px 고정
 * - 상단 고정
 * - 로고 + 알림/DM/프로필 아이콘
 *
 * @see docs/PRD.md - 레이아웃 구조 섹션
 */

import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#dbdbdb] z-50 flex items-center justify-between px-4">
      {/* 로고 */}
      <Link href="/" className="text-xl font-bold text-[#262626]">
        Instagram
      </Link>

      {/* 우측 아이콘들 */}
      <div className="flex items-center gap-4">
        {/* 알림 (1차 MVP에서 기능 제외, UI만) */}
        <button
          type="button"
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="알림"
        >
          <Bell className="w-6 h-6 text-[#262626]" />
        </button>

        {/* DM (1차 MVP에서 기능 제외, UI만) */}
        <button
          type="button"
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="메시지"
        >
          <MessageSquare className="w-6 h-6 text-[#262626]" />
        </button>

        {/* 프로필 (Clerk UserButton) */}
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}

