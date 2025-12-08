-- ============================================
-- 스키마 확인 스크립트
-- ============================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하여
-- 마이그레이션이 올바르게 적용되었는지 확인하세요
-- ============================================

-- 1. 테이블 확인
SELECT 
  '✅ 테이블 확인' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('users', 'posts', 'likes', 'comments', 'follows') 
    THEN '✅ 존재'
    ELSE '❌ 없음'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows')
ORDER BY table_name;

-- 2. 뷰 확인
SELECT 
  '✅ 뷰 확인' as check_type,
  table_name as view_name,
  CASE 
    WHEN table_name IN ('post_stats', 'user_stats') 
    THEN '✅ 존재'
    ELSE '❌ 없음'
  END as status
FROM information_schema.views
WHERE table_schema = 'public' 
  AND table_name IN ('post_stats', 'user_stats')
ORDER BY table_name;

-- 3. 트리거 확인
SELECT 
  '✅ 트리거 확인' as check_type,
  trigger_name,
  event_object_table,
  CASE 
    WHEN event_object_table IN ('posts', 'comments') 
    THEN '✅ 존재'
    ELSE '❌ 없음'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('posts', 'comments')
ORDER BY event_object_table, trigger_name;

-- 4. 함수 확인
SELECT 
  '✅ 함수 확인' as check_type,
  routine_name as function_name,
  CASE 
    WHEN routine_name = 'handle_updated_at' 
    THEN '✅ 존재'
    ELSE '❌ 없음'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_updated_at';

-- 5. 인덱스 확인 (주요 인덱스만)
SELECT 
  '✅ 인덱스 확인' as check_type,
  tablename,
  indexname,
  '✅ 존재' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'posts', 'likes', 'comments', 'follows')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. RLS 상태 확인 (개발 단계에서는 비활성화되어 있어야 함)
SELECT 
  '✅ RLS 상태 확인' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = false 
    THEN '✅ 비활성화됨 (개발 단계)'
    ELSE '⚠️ 활성화됨'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'posts', 'likes', 'comments', 'follows')
ORDER BY tablename;

