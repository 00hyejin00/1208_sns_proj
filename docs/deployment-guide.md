# 배포 가이드

이 문서는 Mini Instagram SNS 프로젝트를 프로덕션 환경에 배포하는 방법을 안내합니다.

## 1. 환경 변수 설정

### 필수 환경 변수

프로덕션 환경에서 다음 환경 변수들을 설정해야 합니다:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_STORAGE_BUCKET=posts
```

### 환경 변수 확인

배포 전에 모든 환경 변수가 올바르게 설정되었는지 확인하세요:

1. **Clerk Dashboard**에서 프로덕션 키 확인
2. **Supabase Dashboard**에서 프로젝트 URL과 키 확인
3. **Storage 버킷**이 생성되어 있고 공개 읽기 권한이 설정되어 있는지 확인

## 2. Vercel 배포 설정

### 2.1 Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (프로젝트 루트)
   - **Build Command**: `pnpm build` (또는 `npm run build`)
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install` (또는 `npm install`)

### 2.2 환경 변수 추가

Vercel Dashboard에서:

1. 프로젝트 설정 → Environment Variables
2. 위의 모든 환경 변수 추가
3. **Production**, **Preview**, **Development** 환경 모두에 적용

### 2.3 빌드 설정

Vercel은 Next.js를 자동으로 감지하지만, 필요시 `vercel.json` 파일을 생성할 수 있습니다:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

## 3. 프로덕션 빌드 테스트

### 3.1 로컬 빌드 테스트

배포 전에 로컬에서 프로덕션 빌드를 테스트하세요:

```bash
# 의존성 설치
pnpm install

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 3.2 빌드 확인 사항

- [ ] 빌드가 성공적으로 완료되는지 확인
- [ ] 모든 페이지가 정상적으로 렌더링되는지 확인
- [ ] API 라우트가 정상 작동하는지 확인
- [ ] 이미지가 올바르게 로드되는지 확인
- [ ] 인증 플로우가 정상 작동하는지 확인

## 4. Supabase 프로덕션 설정

### 4.1 데이터베이스 마이그레이션

프로덕션 데이터베이스에 스키마를 적용하세요:

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/db.sql` 파일 내용 실행
3. 모든 테이블과 뷰가 생성되었는지 확인

### 4.2 Storage 버킷 설정

1. Supabase Dashboard → Storage
2. `posts` 버킷 생성 (없는 경우)
3. 버킷 설정:
   - **Public bucket**: 활성화
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 4.3 RLS 정책 (선택사항)

프로덕션 환경에서는 RLS를 활성화하는 것을 권장합니다:

```sql
-- 예시: posts 테이블 RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

-- 인증된 사용자만 게시물 작성
CREATE POLICY "Users can insert their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 5. 배포 후 확인 사항

### 5.1 기능 테스트

- [ ] 홈 피드가 정상적으로 로드되는지 확인
- [ ] 게시물 작성이 정상 작동하는지 확인
- [ ] 좋아요 기능이 정상 작동하는지 확인
- [ ] 댓글 작성/삭제가 정상 작동하는지 확인
- [ ] 프로필 페이지가 정상적으로 표시되는지 확인
- [ ] 팔로우 기능이 정상 작동하는지 확인

### 5.2 성능 확인

- [ ] 페이지 로딩 속도 확인
- [ ] 이미지 최적화가 적용되었는지 확인
- [ ] 무한 스크롤이 정상 작동하는지 확인

### 5.3 에러 모니터링

- [ ] Vercel 로그에서 에러 확인
- [ ] Supabase 로그에서 에러 확인
- [ ] 브라우저 콘솔에서 에러 확인

## 6. 도메인 설정 (선택사항)

### 6.1 커스텀 도메인 추가

1. Vercel Dashboard → 프로젝트 설정 → Domains
2. 도메인 추가
3. DNS 설정 안내에 따라 DNS 레코드 추가

### 6.2 Clerk 도메인 설정

1. Clerk Dashboard → Domains
2. 프로덕션 도메인 추가
3. 환경 변수 업데이트 (필요시)

## 7. 트러블슈팅

### 빌드 실패

- 환경 변수가 모두 설정되었는지 확인
- `pnpm install`이 성공적으로 완료되었는지 확인
- TypeScript 타입 에러가 없는지 확인

### 이미지 업로드 실패

- Supabase Storage 버킷이 생성되어 있는지 확인
- 버킷이 공개 읽기로 설정되어 있는지 확인
- 파일 크기 제한을 확인 (5MB)

### 인증 오류

- Clerk 키가 올바른지 확인
- 환경 변수 이름이 정확한지 확인
- 리다이렉트 URL이 올바르게 설정되었는지 확인

## 8. 추가 리소스

- [Next.js 배포 문서](https://nextjs.org/docs/deployment)
- [Vercel 문서](https://vercel.com/docs)
- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Supabase 프로덕션 가이드](https://supabase.com/docs/guides/platform/going-to-prod)

