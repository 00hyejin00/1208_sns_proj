# Supabase 데이터베이스 마이그레이션 가이드

이 문서는 Instagram 클론 SNS 프로젝트의 데이터베이스 스키마를 Supabase에 적용하는 방법을 설명합니다.

## 마이그레이션 파일

프로젝트의 마이그레이션 파일은 `supabase/migrations/` 디렉토리에 있습니다:

- `20251208142112_initial_schema.sql`: 초기 스키마 (users, posts, likes, comments, follows 테이블, 뷰, 트리거)

## 적용 방법

### 방법 1: Supabase Dashboard SQL Editor (권장)

가장 간단하고 직관적인 방법입니다.

#### 단계

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20251208142112_initial_schema.sql` 파일의 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
7. 성공 메시지 확인 (`Success. No rows returned`)

#### 주의사항

- 마이그레이션 파일 전체를 한 번에 실행해야 합니다
- 이미 테이블이 존재하는 경우 `CREATE TABLE IF NOT EXISTS` 구문으로 인해 에러 없이 진행됩니다
- 에러가 발생하면 메시지를 확인하고 수정 후 다시 실행하세요

### 방법 2: Supabase CLI (선택사항)

로컬 개발 환경에서 Supabase CLI를 사용하는 경우:

#### 사전 준비

1. Supabase CLI 설치:
   ```bash
   npm install -g supabase
   ```

2. Supabase 프로젝트 연결:
   ```bash
   supabase link --project-ref your-project-ref
   ```

#### 마이그레이션 적용

```bash
supabase db push
```

또는 특정 마이그레이션 파일만 적용:

```bash
supabase migration up
```

## 확인 체크리스트

마이그레이션이 성공적으로 적용되었는지 확인하세요:

### 1. 테이블 확인

Supabase Dashboard → **Table Editor**에서 다음 테이블들이 생성되었는지 확인:

- [ ] `users` - 사용자 정보
- [ ] `posts` - 게시물
- [ ] `likes` - 좋아요
- [ ] `comments` - 댓글
- [ ] `follows` - 팔로우

### 2. 뷰 확인

Supabase Dashboard → **SQL Editor**에서 다음 쿼리를 실행하여 뷰가 생성되었는지 확인:

```sql
-- 뷰 목록 확인
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('post_stats', 'user_stats');
```

예상 결과:
- `post_stats`
- `user_stats`

### 3. 트리거 확인

다음 쿼리를 실행하여 트리거가 생성되었는지 확인:

```sql
-- 트리거 목록 확인
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('posts', 'comments');
```

예상 결과:
- `set_updated_at` on `posts`
- `set_updated_at` on `comments`

### 4. 인덱스 확인

다음 쿼리를 실행하여 인덱스가 생성되었는지 확인:

```sql
-- 인덱스 목록 확인
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'posts', 'likes', 'comments', 'follows')
ORDER BY tablename, indexname;
```

예상 결과 (주요 인덱스):
- `posts`: `idx_posts_user_id`, `idx_posts_created_at`
- `likes`: `idx_likes_post_id`, `idx_likes_user_id`
- `comments`: `idx_comments_post_id`, `idx_comments_user_id`, `idx_comments_created_at`
- `follows`: `idx_follows_follower_id`, `idx_follows_following_id`

### 5. 함수 확인

다음 쿼리를 실행하여 트리거 함수가 생성되었는지 확인:

```sql
-- 함수 목록 확인
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_updated_at';
```

예상 결과:
- `handle_updated_at` (FUNCTION)

## 문제 해결

### 에러: "relation already exists"

테이블이 이미 존재하는 경우 발생할 수 있습니다. 이는 정상적인 동작이며, `CREATE TABLE IF NOT EXISTS` 구문으로 인해 에러 없이 진행됩니다.

### 에러: "permission denied"

권한 문제가 발생한 경우:
1. Supabase Dashboard에서 올바른 프로젝트를 선택했는지 확인
2. Service Role 키를 사용하여 실행 (일반적으로 필요 없음)

### 에러: "syntax error"

SQL 구문 오류가 발생한 경우:
1. 마이그레이션 파일의 내용을 다시 확인
2. Supabase Dashboard의 SQL Editor에서 구문 강조를 확인
3. 작은 단위로 나누어 실행하여 문제 지점 파악

## 다음 단계

마이그레이션이 성공적으로 적용되었다면:

1. [Supabase Storage 설정 가이드](./supabase-storage-guide.md)를 참고하여 Storage 버킷을 생성하세요
2. 애플리케이션에서 데이터베이스 연결을 테스트하세요

## 참고 자료

- [Supabase SQL Editor 문서](https://supabase.com/docs/guides/database/tables)
- [Supabase CLI 문서](https://supabase.com/docs/guides/cli)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

