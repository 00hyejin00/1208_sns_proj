"use client";

/**
 * @file components/layout/BottomNav.tsx
 * @description Instagram 스타일 모바일 하단 네비게이션 컴포넌트
 *
 * Mobile 전용 (<768px):
 * - 높이: 50px 고정
 * - 하단 고정
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 *
 * @see docs/PRD.md - 레이아웃 구조 섹션
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import CreatePostModal from "@/components/post/CreatePostModal";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isProfile?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/search", label: "검색", icon: Search },
  { href: "/create", label: "만들기", icon: Plus },
  { href: "/activity", label: "좋아요", icon: Heart },
  { href: "/profile", label: "프로필", icon: User, isProfile: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#dbdbdb] z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isCreateButton = item.href === "/create";

          // 프로필은 Clerk UserButton 사용
          if (item.isProfile) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-opacity",
                  "hover:opacity-70",
                  isActive && "opacity-100"
                )}
                aria-label={item.label}
              >
                <UserButton />
              </Link>
            );
          }

          // "만들기" 버튼은 모달 열기
          if (isCreateButton) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                  "hover:opacity-70"
                )}
                aria-label={item.label}
              >
                <Icon className="w-6 h-6 text-[#262626]" />
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                "hover:opacity-70",
                isActive && "opacity-100"
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  isActive ? "text-[#262626]" : "text-[#262626]"
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}

