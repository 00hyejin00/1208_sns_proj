/**
 * @file lib/clerk/localization.ts
 * @description Clerk 한국어 로컬라이제이션 설정
 *
 * 이 파일은 Clerk 컴포넌트를 한국어로 표시하기 위한 로컬라이제이션을 제공합니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */

import { koKR } from "@clerk/localizations";

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
export { koKR };
