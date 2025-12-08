-- ============================================
-- Supabase Storage 정책 설정
-- ============================================
-- posts 버킷에 대한 RLS 정책 설정
-- ============================================
-- Note: 이 스크립트는 posts 버킷이 이미 생성되어 있어야 합니다
-- ============================================

-- ============================================
-- 1. INSERT 정책 (업로드)
-- ============================================
-- 인증된 사용자만 자신의 폴더에 업로드 가능
-- 경로 구조: posts/{clerk_user_id}/{filename}

CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts'::text
  AND auth.role() = 'authenticated'::text
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text)
);

-- ============================================
-- 2. SELECT 정책 (읽기)
-- ============================================
-- Public bucket으로 설정한 경우 자동으로 모든 사용자가 읽을 수 있음
-- 추가 정책이 필요하지 않지만, 명시적으로 설정할 수도 있음

CREATE POLICY IF NOT EXISTS "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'posts'::text
);

-- ============================================
-- 3. DELETE 정책 (삭제)
-- ============================================
-- 인증된 사용자만 자신의 폴더에 있는 파일 삭제 가능

CREATE POLICY IF NOT EXISTS "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts'::text
  AND auth.role() = 'authenticated'::text
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text)
);

-- ============================================
-- 4. UPDATE 정책 (업데이트)
-- ============================================
-- 인증된 사용자만 자신의 폴더에 있는 파일 업데이트 가능

CREATE POLICY IF NOT EXISTS "Allow users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts'::text
  AND auth.role() = 'authenticated'::text
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text)
)
WITH CHECK (
  bucket_id = 'posts'::text
  AND auth.role() = 'authenticated'::text
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text)
);

-- ============================================
-- 참고사항
-- ============================================
-- 1. 이 정책들은 Clerk 인증을 사용하는 경우를 가정합니다
-- 2. auth.jwt() ->> 'sub'는 Clerk user ID를 반환합니다
-- 3. 파일 경로는 posts/{clerk_user_id}/{filename} 형식이어야 합니다
-- 4. Public bucket으로 설정한 경우 SELECT 정책은 선택사항입니다
-- ============================================

