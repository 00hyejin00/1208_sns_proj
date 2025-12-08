-- ============================================
-- Supabase Storage 버킷 생성 스크립트
-- ============================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하여
-- posts 버킷을 생성할 수 있습니다
-- ============================================
-- 참고: Supabase Dashboard에서 직접 생성하는 것이 더 간단할 수 있습니다
-- ============================================

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- 공개 버킷
  5242880,  -- 5MB (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO NOTHING;

-- 버킷 생성 확인
SELECT 
  '✅ Storage 버킷 확인' as check_type,
  id as bucket_id,
  name,
  public,
  CASE 
    WHEN id = 'posts' 
    THEN '✅ 생성됨'
    ELSE '❌ 없음'
  END as status
FROM storage.buckets
WHERE id = 'posts';

