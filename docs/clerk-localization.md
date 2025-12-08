# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 변경하는 방법을 설명합니다.

> **⚠️ 참고**: Clerk 로컬라이제이션 기능은 현재 실험적(experimental) 단계입니다. 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

## 현재 설정

프로젝트에는 이미 한국어 로컬라이제이션이 적용되어 있습니다:

- ✅ `app/layout.tsx`에서 `koKR` 로컬라이제이션이 `ClerkProvider`에 설정됨
- ✅ HTML 언어 태그가 `lang="ko"`로 설정됨
- ✅ `@clerk/localizations` 패키지 설치됨 (v3.26.3)
- ✅ `lib/clerk/localization.ts`에서 커스텀 로컬라이제이션 관리

## 빠른 시작

프로젝트는 이미 한국어로 설정되어 있습니다. 커스터마이징이 필요한 경우에만 아래 내용을 참고하세요.

## 기본 설정 확인

### 1. 패키지 설치

```bash
pnpm install @clerk/localizations
```

### 2. 기본 한국어 로컬라이제이션 적용

`app/layout.tsx` 파일에서 다음과 같이 설정되어 있습니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@/lib/clerk/localization";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        {/* ... */}
      </html>
    </ClerkProvider>
  );
}
```

> **참고**: 프로젝트에서는 `@/lib/clerk/localization`에서 `koKR`을 import하여 사용합니다. 이렇게 하면 나중에 커스텀 로컬라이제이션으로 쉽게 전환할 수 있습니다.

## 커스텀 로컬라이제이션

브랜드에 맞게 특정 문자열만 커스터마이징할 수 있습니다.

### 기본 구조

`lib/clerk/localization.ts` 파일에서 `customKoKR`을 수정하여 사용하세요:

```tsx
import { koKR } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/types";

export const customKoKR: LocalizationResource = {
  ...koKR,
  // 원하는 문자열만 덮어쓰기
  signIn: {
    ...koKR.signIn,
    start: {
      ...koKR.signIn.start,
      title: "환영합니다",
      subtitle: "{{applicationName}}에 로그인하세요",
    },
  },
};
```

그리고 `app/layout.tsx`에서 사용:

```tsx
import { customKoKR } from "@/lib/clerk/localization";

<ClerkProvider localization={customKoKR}>
  {/* ... */}
</ClerkProvider>
```

### 예제: 에러 메시지 커스터마이징

특정 에러 메시지만 변경하고 싶을 때:

```tsx
// lib/clerk/localization.ts
import { koKR } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/types";

export const customKoKR: LocalizationResource = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access: "접근이 허용되지 않습니다. 관리자에게 문의하세요.",
    form_identifier_not_found: "등록되지 않은 이메일입니다.",
    form_password_incorrect: "비밀번호가 올바르지 않습니다.",
  },
};
```

사용 가능한 에러 키 목록은 [English 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)의 `unstable__errors` 객체를 참고하세요.

### 예제: 로그인 페이지 커스터마이징

```tsx
// lib/clerk/localization.ts
export const customKoKR: LocalizationResource = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    start: {
      ...koKR.signIn.start,
      title: "환영합니다",
      subtitle: "{{applicationName}}에 로그인하세요",
    },
    emailCode: {
      ...koKR.signIn.emailCode,
      subtitle: "{{applicationName}}에 로그인하세요",
    },
  },
};
```

### 예제: 회원가입 페이지 커스터마이징

```tsx
// lib/clerk/localization.ts
export const customKoKR: LocalizationResource = {
  ...koKR,
  signUp: {
    ...koKR.signUp,
    start: {
      ...koKR.signUp.start,
      title: "계정 만들기",
      subtitle: "{{applicationName}}에 가입하세요",
    },
    emailCode: {
      ...koKR.signUp.emailCode,
      subtitle: "{{applicationName}}에 가입하세요",
    },
  },
};
```

## 사용 가능한 로컬라이제이션 키

Clerk는 다음 섹션들을 커스터마이징할 수 있습니다:

- `signIn`: 로그인 페이지
- `signUp`: 회원가입 페이지
- `userButton`: 사용자 버튼
- `userProfile`: 사용자 프로필
- `organizationSwitcher`: 조직 전환
- `unstable__errors`: 에러 메시지

전체 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 프로젝트 구조

커스텀 로컬라이제이션은 `lib/clerk/localization.ts` 파일에서 관리합니다:

```
lib/clerk/
└── localization.ts    # 한국어 로컬라이제이션 설정
```

### 파일 구조

```tsx
// lib/clerk/localization.ts
import { koKR } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/types";

// 기본 한국어 (커스터마이징 없음)
export { koKR } from "@clerk/localizations";

// 커스텀 한국어 (필요시 수정)
export const customKoKR: LocalizationResource = {
  ...koKR,
  // 커스터마이징
};
```

### 사용 방법

**기본 한국어 사용 (현재 설정):**

```tsx
// app/layout.tsx
import { koKR } from "@/lib/clerk/localization";

<ClerkProvider localization={koKR}>
  {/* ... */}
</ClerkProvider>
```

**커스텀 한국어 사용:**

```tsx
// app/layout.tsx
import { customKoKR } from "@/lib/clerk/localization";

<ClerkProvider localization={customKoKR}>
  {/* ... */}
</ClerkProvider>
```

## 중요 사항

### 1. 실험적 기능

로컬라이제이션 기능은 현재 실험적 단계이므로:
- 예상치 못한 동작이 발생할 수 있습니다
- 문제 발생 시 Clerk 지원팀에 문의하세요

### 2. 컴포넌트만 변경됨

로컬라이제이션은 **Clerk 컴포넌트 내부의 텍스트만** 변경합니다:
- ✅ 로그인/회원가입 페이지
- ✅ 사용자 버튼
- ✅ 사용자 프로필
- ❌ Clerk Account Portal (호스팅된 포털은 영어로 유지됨)

### 3. HTML 언어 태그

`html lang="ko"` 설정도 함께 사용하면 SEO와 접근성에 도움이 됩니다.

## 참고 자료

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [지원되는 언어 목록](https://clerk.com/docs/guides/customizing-clerk/localization#languages)
- [English 로컬라이제이션 파일 (참고용)](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)

