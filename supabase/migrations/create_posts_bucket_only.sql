-- ============================================
-- posts 버킷만 생성하는 스크립트
-- ============================================
-- 이 스크립트는 버킷 생성만 수행합니다.
-- 정책(Policy)은 필요시 별도로 설정하세요.
-- ============================================

-- 1. 버킷 존재 여부 확인
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'posts')
    THEN '✅ posts 버킷이 이미 존재합니다.'
    ELSE '❌ posts 버킷이 없습니다. 아래 INSERT 구문을 실행하세요.'
  END as bucket_status;

-- 2. 버킷이 없는 경우에만 아래 구문 실행
-- (위 쿼리 결과가 '없습니다'인 경우만)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- public bucket
  5242880,  -- 5MB 제한 (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- 3. 생성 확인
SELECT 
  '✅ 버킷 생성 완료' as status,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets
WHERE id = 'posts';

