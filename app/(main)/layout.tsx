/**
 * @file app/(main)/layout.tsx
 * @description Instagram 스타일 메인 레이아웃
 *
 * 반응형 레이아웃 구조:
 * - Desktop (1024px+): Sidebar(244px) + Main Content(최대 630px, 중앙 정렬)
 * - Tablet (768px~1023px): Sidebar(72px) + Main Content
 * - Mobile (<768px): Header(60px) + Main Content + BottomNav(50px)
 *
 * @see docs/PRD.md - 레이아웃 구조 섹션
 */

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar - Desktop/Tablet 전용 */}
      <Sidebar />

      {/* Header - Mobile 전용 */}
      <Header />

      {/* Main Content */}
      <main
        className={cn(
          // Mobile: Header와 BottomNav 공간 확보
          "pt-[60px] pb-[50px] lg:pt-0 lg:pb-0",
          // Tablet: Sidebar 공간 확보
          "md:ml-[72px]",
          // Desktop: Sidebar 공간 확보
          "lg:ml-[244px]",
          // 중앙 정렬 및 최대 너비
          "flex justify-center min-h-screen"
        )}
      >
        <div className="w-full max-w-[630px] px-4 py-8">{children}</div>
      </main>

      {/* BottomNav - Mobile 전용 */}
      <BottomNav />
    </div>
  );
}

