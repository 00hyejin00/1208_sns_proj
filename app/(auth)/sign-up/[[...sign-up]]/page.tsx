/**
 * @file app/(auth)/sign-up/[[...sign-up]]/page.tsx
 * @description Instagram 스타일 회원가입 페이지
 *
 * Clerk의 SignUp 컴포넌트를 사용하여 회원가입 페이지를 제공합니다.
 * Instagram 스타일의 디자인으로 구성되어 있습니다.
 *
 * @see docs/PRD.md - 인증 섹션
 */

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-12">
      <div className="w-full max-w-[350px]">
        {/* Instagram 로고/제목 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#262626] mb-2">Instagram</h1>
          <p className="text-[#8e8e8e] text-sm">
            친구들의 사진과 동영상을 보려면 가입하세요.
          </p>
        </div>

        {/* Clerk SignUp 컴포넌트 */}
        <div className="bg-white border border-[#dbdbdb] rounded-lg p-8 mb-4">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold",
                formButtonPrimary:
                  "bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold",
                formFieldInput:
                  "border-[#dbdbdb] focus:border-[#8e8e8e] focus:ring-0",
                footerActionLink: "text-[#0095f6] hover:text-[#1877f2]",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignInUrl="/"
            afterSignUpUrl="/"
            fallbackRedirectUrl="/"
          />
        </div>

        {/* 로그인 링크 */}
        <div className="bg-white border border-[#dbdbdb] rounded-lg p-6 text-center">
          <p className="text-sm text-[#262626]">
            계정이 있으신가요?{" "}
            <Link
              href="/sign-in"
              className="text-[#0095f6] font-semibold hover:text-[#1877f2]"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

