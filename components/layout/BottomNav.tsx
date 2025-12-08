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
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#dbdbdb] z-50 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

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
  );
}

