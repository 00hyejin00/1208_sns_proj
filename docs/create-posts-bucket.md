# posts 버킷 생성 가이드

게시물 이미지 업로드를 위해 `posts` Storage 버킷을 생성해야 합니다.

## 방법 1: Supabase Dashboard (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭
4. **New bucket** 버튼 클릭
5. 버킷 정보 입력:
   - **Name**: `posts` (정확히 이 이름으로 입력)
   - **Public bucket**: ✅ 체크 (공개 읽기 허용)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp` (선택사항)
6. **Create bucket** 클릭
7. ✅ 버킷이 생성되었는지 확인

## 방법 2: SQL 스크립트

### 단계 1: 버킷 존재 여부 확인

먼저 버킷이 이미 존재하는지 확인하세요:

1. Supabase Dashboard → **SQL Editor** 클릭
2. **New query** 클릭
3. 아래 쿼리를 실행:

```sql
-- posts 버킷 확인
SELECT * FROM storage.buckets WHERE id = 'posts';
```

**결과:**
- 결과가 나오면: 버킷이 이미 존재합니다. ✅ 완료
- 결과가 없으면: 다음 단계로 진행

### 단계 2: 버킷 생성 (버킷이 없는 경우만)

버킷이 없는 경우에만 아래 SQL을 실행하세요:

1. SQL Editor에서 **New query** 클릭
2. 아래 SQL 스크립트를 복사하여 붙여넣기:

```sql
-- posts 버킷 생성 (이미 존재하면 무시됨)
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
```

3. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
4. ✅ 성공 메시지 확인: `Success. No rows returned` 또는 `INSERT 0 1`

## 버킷 생성 확인

SQL Editor에서 다음 쿼리를 실행하여 버킷이 생성되었는지 확인:

```sql
SELECT * FROM storage.buckets WHERE id = 'posts';
```

결과가 나오면 버킷이 정상적으로 생성된 것입니다.

## 참고

- 버킷 이름은 정확히 `posts`여야 합니다 (대소문자 구분)
- 버킷은 Public으로 설정되어 있어 모든 사용자가 이미지를 볼 수 있습니다
- File size limit은 5MB로 제한됩니다 (PRD.md 기준)
- 이미지 파일만 허용됩니다 (jpeg, png, webp)

