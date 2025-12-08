/**
 * @file lib/types.ts
 * @description TypeScript 타입 정의
 *
 * Instagram 클론 SNS 프로젝트에서 사용하는 모든 타입을 정의합니다.
 * PRD.md와 db.sql을 기반으로 작성되었습니다.
 */

/**
 * 사용자 타입
 * Clerk 인증과 연동되는 사용자 정보
 */
export interface User {
  id: string; // UUID
  clerk_id: string;
  name: string;
  created_at: string; // ISO timestamp
}

/**
 * 게시물 타입
 */
export interface Post {
  id: string; // UUID
  user_id: string;
  image_url: string; // Supabase Storage URL
  caption: string | null; // 최대 2,200자 (애플리케이션에서 검증)
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * 좋아요 타입
 */
export interface Like {
  id: string; // UUID
  post_id: string;
  user_id: string;
  created_at: string; // ISO timestamp
}

/**
 * 댓글 타입
 */
export interface Comment {
  id: string; // UUID
  post_id: string;
  user_id: string;
  content: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * 팔로우 타입
 */
export interface Follow {
  id: string; // UUID
  follower_id: string; // 팔로우하는 사람
  following_id: string; // 팔로우받는 사람
  created_at: string; // ISO timestamp
}

/**
 * 게시물 통계 뷰 타입
 * post_stats 뷰에서 반환되는 데이터 구조
 */
export interface PostStats extends Post {
  likes_count: number;
  comments_count: number;
}

/**
 * 사용자 통계 뷰 타입
 * user_stats 뷰에서 반환되는 데이터 구조
 */
export interface UserStats extends User {
  posts_count: number;
  followers_count: number;
  following_count: number;
}

/**
 * API 응답 타입
 * API Routes에서 사용하는 공통 응답 구조
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

