"use client";

/**
 * @file components/layout/Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * 반응형 사이드바:
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px~1023px): 72px 너비, 아이콘만
 * - Mobile (<768px): 숨김
 *
 * @see docs/PRD.md - 레이아웃 구조 섹션
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/search", label: "검색", icon: Search },
  { href: "/create", label: "만들기", icon: Plus },
  { href: "/profile", label: "프로필", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen bg-white border-r border-[#dbdbdb] z-40 hidden md:block">
      {/* Desktop: 244px 너비, 아이콘 + 텍스트 */}
      <div className="hidden lg:flex flex-col w-[244px] h-full pt-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#262626]">Instagram</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors",
                  "hover:bg-gray-50",
                  isActive && "font-semibold"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 flex-shrink-0",
                    isActive ? "text-[#262626]" : "text-[#262626]"
                  )}
                />
                <span
                  className={cn(
                    "text-base",
                    isActive
                      ? "text-[#262626] font-semibold"
                      : "text-[#262626] font-normal"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tablet: 72px 너비, 아이콘만 */}
      <div className="flex lg:hidden flex-col w-[72px] h-full pt-8 items-center">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#262626]">IG</h1>
        </div>
        <nav className="flex flex-col gap-1 w-full items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                  "hover:bg-gray-50",
                  isActive && "font-semibold"
                )}
                title={item.label}
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
      </div>
    </aside>
  );
}

