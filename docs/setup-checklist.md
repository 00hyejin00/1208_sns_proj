# 기본 세팅 체크리스트

이 문서는 Instagram 클론 SNS 프로젝트의 기본 세팅을 완료하기 위한 단계별 체크리스트입니다.

> **참고**: 이 체크리스트를 따라 작업하면 TODO.md의 "## 1. 기본 세팅" 항목들을 모두 완료할 수 있습니다.

## 1. Supabase 데이터베이스 마이그레이션

### 단계 1: 마이그레이션 파일 적용

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20251208142112_initial_schema.sql` 파일의 전체 내용을 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
8. ✅ 성공 메시지 확인: `Success. No rows returned`

### 단계 2: 스키마 확인

1. SQL Editor에서 **New query** 클릭
2. `supabase/migrations/check_schema.sql` 파일의 전체 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭
4. 다음 항목들이 모두 "✅ 존재"로 표시되는지 확인:
   - ✅ 테이블: users, posts, likes, comments, follows
   - ✅ 뷰: post_stats, user_stats
   - ✅ 트리거: set_updated_at (posts, comments)
   - ✅ 함수: handle_updated_at
   - ✅ 인덱스: 주요 인덱스들
   - ✅ RLS 상태: 비활성화됨 (개발 단계)

**체크 표시:**
- [ ] 마이그레이션 파일 적용 완료
- [ ] 스키마 확인 완료 (모든 항목 ✅)

## 2. Supabase Storage 버킷 생성

### 방법 1: Supabase Dashboard (권장)

1. Supabase Dashboard → **Storage** 클릭
2. **New bucket** 버튼 클릭
3. 버킷 정보 입력:
   - **Name**: `posts`
   - **Public bucket**: ✅ 체크
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp` (선택사항)
4. **Create bucket** 클릭
5. ✅ 버킷이 생성되었는지 확인

### 방법 2: SQL 스크립트

1. SQL Editor에서 **New query** 클릭
2. `supabase/migrations/create_storage_bucket.sql` 파일의 전체 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭
4. ✅ 버킷이 생성되었는지 확인

**체크 표시:**
- [ ] `posts` 버킷 생성 완료

## 3. Storage 정책 설정

1. SQL Editor에서 **New query** 클릭
2. `supabase/migrations/20251208142113_storage_policies.sql` 파일의 전체 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭
4. ✅ 성공 메시지 확인

**또는 Supabase Dashboard에서:**
1. Storage → `posts` 버킷 선택
2. **Policies** 탭 클릭
3. 다음 정책들이 있는지 확인:
   - ✅ `Allow authenticated users to upload` (INSERT)
   - ✅ `Allow public read access` (SELECT)
   - ✅ `Allow users to delete their own files` (DELETE)
   - ✅ `Allow users to update their own files` (UPDATE)

**체크 표시:**
- [ ] Storage 정책 설정 완료

## 4. 최종 확인

모든 작업이 완료되었는지 확인:

### 데이터베이스 확인
- [ ] 5개 테이블 생성됨 (users, posts, likes, comments, follows)
- [ ] 2개 뷰 생성됨 (post_stats, user_stats)
- [ ] 트리거 및 함수 생성됨

### Storage 확인
- [ ] `posts` 버킷 생성됨
- [ ] 버킷이 Public으로 설정됨
- [ ] Storage 정책 4개 설정됨

## 문제 해결

### 마이그레이션 에러 발생 시

1. 에러 메시지를 확인
2. 이미 테이블이 존재하는 경우: `CREATE TABLE IF NOT EXISTS` 구문으로 인해 에러 없이 진행되어야 함
3. 권한 문제: Service Role 키를 사용하여 실행 (일반적으로 필요 없음)

### Storage 버킷이 보이지 않을 때

1. Storage 메뉴에서 새로고침
2. 버킷 이름이 정확히 `posts`인지 확인
3. SQL로 직접 확인:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'posts';
   ```

### 정책이 적용되지 않을 때

1. 버킷이 먼저 생성되었는지 확인
2. 정책 스크립트를 다시 실행
3. Supabase Dashboard에서 Policies 탭 확인

## 다음 단계

기본 세팅이 완료되면:
1. 애플리케이션에서 데이터베이스 연결 테스트
2. 이미지 업로드 기능 테스트
3. 홈 피드 페이지 개발 시작

