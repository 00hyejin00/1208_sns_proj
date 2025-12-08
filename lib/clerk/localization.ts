import { koKR } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/types";

/**
 * @file lib/clerk/localization.ts
 * @description Clerk 한국어 로컬라이제이션 설정
 *
 * 이 파일은 Clerk 컴포넌트를 한국어로 표시하기 위한 로컬라이제이션을 제공합니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */

/**
 * 기본 한국어 로컬라이제이션
 *
 * Clerk에서 제공하는 기본 한국어 번역을 그대로 사용합니다.
 * 커스터마이징이 필요 없는 경우 이 값을 사용하세요.
 *
 * @example
 * ```tsx
 * import { koKR } from '@/lib/clerk/localization';
 *
 * <ClerkProvider localization={koKR}>
 *   {children}
 * </ClerkProvider>
 * ```
 */
export { koKR } from "@clerk/localizations";

/**
 * 커스텀 한국어 로컬라이제이션
 *
 * 기본 koKR 로컬라이제이션을 확장하여 브랜드에 맞게 커스터마이징할 수 있습니다.
 * 필요한 부분만 덮어쓰면 됩니다.
 *
 * @example
 * ```tsx
 * import { customKoKR } from '@/lib/clerk/localization';
 *
 * <ClerkProvider localization={customKoKR}>
 *   {children}
 * </ClerkProvider>
 * ```
 *
 * @example 커스터마이징 예제
 * ```tsx
 * // 특정 문자열만 변경
 * export const customKoKR: LocalizationResource = {
 *   ...koKR,
 *   signIn: {
 *     ...koKR.signIn,
 *     start: {
 *       ...koKR.signIn.start,
 *       title: "환영합니다",
 *       subtitle: "{{applicationName}}에 로그인하세요",
 *     },
 *   },
 * };
 * ```
 */
export const customKoKR: LocalizationResource = {
  ...koKR,

  // 필요한 경우 여기에 커스터마이징을 추가하세요
  // 예시: signIn, signUp, userButton 등의 키를 통해 특정 문자열만 변경 가능

  // 커스텀 에러 메시지 (선택사항)
  unstable__errors: {
    ...koKR.unstable__errors,
    // 특정 에러 메시지만 커스터마이징
    // 예시:
    // not_allowed_access: "접근이 허용되지 않습니다. 관리자에게 문의하세요.",
    // form_identifier_not_found: "등록되지 않은 이메일입니다.",
  },

  // 로그인 페이지 커스터마이징 예제 (주석 처리됨)
  // signIn: {
  //   ...koKR.signIn,
  //   start: {
  //     ...koKR.signIn.start,
  //     title: "환영합니다",
  //     subtitle: "{{applicationName}}에 로그인하세요",
  //   },
  // },

  // 회원가입 페이지 커스터마이징 예제 (주석 처리됨)
  // signUp: {
  //   ...koKR.signUp,
  //   start: {
  //     ...koKR.signUp.start,
  //     title: "계정 만들기",
  //     subtitle: "{{applicationName}}에 가입하세요",
  //   },
  // },
};

