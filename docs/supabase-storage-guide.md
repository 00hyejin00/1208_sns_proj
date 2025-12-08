# Supabase Storage 버킷 생성 및 정책 설정 가이드

이 문서는 Instagram 클론 SNS 프로젝트의 이미지 저장을 위한 Supabase Storage 버킷을 생성하고 정책을 설정하는 방법을 설명합니다.

## Storage 버킷 생성

### 단계

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭
4. **New bucket** 버튼 클릭
5. 버킷 정보 입력:
   - **Name**: `posts` (필수)
   - **Public bucket**: ✅ 체크 (공개 읽기 허용)
   - **File size limit**: `5MB` (선택사항, PRD.md에 따르면 최대 5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp` (선택사항)
6. **Create bucket** 클릭

### 버킷 설정 설명

- **Name**: `posts` - 게시물 이미지를 저장하는 버킷
- **Public bucket**: 체크 - 모든 사용자가 이미지를 볼 수 있도록 공개 설정
- **File size limit**: 5MB - PRD.md에 명시된 최대 파일 크기
- **Allowed MIME types**: 이미지 파일만 허용 (보안 강화)

## Storage 정책 설정

버킷을 생성한 후, 업로드 및 삭제 권한을 제어하기 위한 정책을 설정해야 합니다.

### 방법 1: Supabase Dashboard (권장)

#### INSERT 정책 (업로드)

1. Storage → `posts` 버킷 선택
2. **Policies** 탭 클릭
3. **New Policy** 클릭
4. **Policy name**: `Allow authenticated users to upload`
5. **Allowed operation**: `INSERT` 선택
6. **Policy definition**:
   ```sql
   (bucket_id = 'posts'::text) AND (auth.role() = 'authenticated'::text)
   ```
7. **Save** 클릭

#### DELETE 정책 (삭제)

1. **New Policy** 클릭
2. **Policy name**: `Allow users to delete their own files`
3. **Allowed operation**: `DELETE` 선택
4. **Policy definition**:
   ```sql
   (bucket_id = 'posts'::text) AND (auth.role() = 'authenticated'::text) AND ((storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text))
   ```
   - 이 정책은 사용자가 자신의 폴더(`{clerk_user_id}/`)에 있는 파일만 삭제할 수 있도록 합니다
5. **Save** 클릭

#### SELECT 정책 (읽기)

Public bucket으로 설정한 경우 자동으로 모든 사용자가 읽을 수 있습니다. 추가 정책이 필요하지 않습니다.

### 방법 2: SQL 스크립트 (선택사항)

`supabase/migrations/` 디렉토리에 있는 Storage 정책 SQL 스크립트를 실행할 수도 있습니다.

## 파일 경로 구조

게시물 이미지는 다음 경로 구조로 저장됩니다:

```
posts/
  └── {clerk_user_id}/
      └── {filename}
```

예시:
```
posts/
  └── user_2abc123def456/
      └── 20251208_123456.jpg
```

이 구조를 사용하면:
- 사용자별로 파일을 분리하여 관리 가능
- 삭제 정책에서 사용자별 접근 제어 용이
- 파일 충돌 방지

## 정책 확인

### INSERT 정책 확인

Supabase Dashboard → Storage → `posts` → Policies에서 다음 정책이 있는지 확인:

- [ ] `Allow authenticated users to upload` (INSERT)

### DELETE 정책 확인

- [ ] `Allow users to delete their own files` (DELETE)

### SELECT 정책 확인

Public bucket으로 설정한 경우 별도 정책이 필요하지 않습니다.

## 테스트

### 업로드 테스트

애플리케이션에서 이미지 업로드가 정상적으로 작동하는지 확인:

1. 로그인 상태에서 게시물 작성
2. 이미지 선택 및 업로드
3. Supabase Dashboard → Storage → `posts`에서 파일이 생성되었는지 확인

### 읽기 테스트

업로드된 이미지 URL이 정상적으로 접근 가능한지 확인:

1. 업로드된 이미지의 Public URL 복사
2. 브라우저에서 URL 접근
3. 이미지가 정상적으로 표시되는지 확인

### 삭제 테스트

게시물 삭제 시 이미지도 함께 삭제되는지 확인:

1. 게시물 삭제
2. Supabase Dashboard → Storage → `posts`에서 해당 파일이 삭제되었는지 확인

## 문제 해결

### 에러: "new row violates row-level security policy"

Storage 정책이 올바르게 설정되지 않은 경우 발생합니다:

1. Supabase Dashboard → Storage → `posts` → Policies 확인
2. INSERT 정책이 올바르게 설정되었는지 확인
3. 정책 정의에서 `auth.role() = 'authenticated'` 조건 확인

### 에러: "permission denied"

권한 문제가 발생한 경우:

1. 버킷이 Public으로 설정되었는지 확인
2. 사용자가 로그인 상태인지 확인 (Clerk 인증)
3. 정책에서 `auth.role() = 'authenticated'` 조건 확인

### 이미지가 표시되지 않음

Public URL이 올바르게 생성되었는지 확인:

1. Supabase Storage URL 형식: `https://{project-ref}.supabase.co/storage/v1/object/public/posts/{path}`
2. 버킷이 Public으로 설정되었는지 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인

## 다음 단계

Storage 버킷이 성공적으로 생성되고 정책이 설정되었다면:

1. 애플리케이션에서 이미지 업로드 기능 구현
2. 게시물 작성 시 이미지 업로드 테스트
3. 이미지 URL을 데이터베이스에 저장하는 로직 구현

## 참고 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Supabase Storage 정책 문서](https://supabase.com/docs/guides/storage/security/access-control)
- [Clerk + Supabase 통합 가이드](../docs/clerk-supabase-integration.md)

