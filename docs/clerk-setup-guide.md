# Clerk 설정 가이드

Clerk Dashboard에서 필요한 API 키를 찾는 방법을 안내합니다.

## 필요한 정보

로그인 기능을 사용하기 위해 다음 3가지 정보가 필요합니다:

1. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** - 공개 키 (프론트엔드에서 사용)
2. **CLERK_SECRET_KEY** - 비밀 키 (서버에서만 사용)
3. **URL 설정** - 로그인/회원가입 페이지 URL

## Clerk Dashboard에서 키 찾기

### 1단계: Clerk Dashboard 접속

1. [https://dashboard.clerk.com](https://dashboard.clerk.com) 접속
2. 로그인 (Clerk 계정이 없으면 회원가입)

### 2단계: 프로젝트 선택

- 대시보드에서 프로젝트 선택
- 프로젝트가 없으면 "Create Application" 클릭하여 새 프로젝트 생성

### 3단계: API Keys 페이지로 이동

**방법 1: 사이드바에서 직접 이동**
- 좌측 사이드바에서 **"API Keys"** 클릭

**방법 2: 설정에서 이동**
- 좌측 사이드바에서 **"Configure"** 또는 **"Settings"** 클릭
- **"API Keys"** 섹션 클릭

### 4단계: 키 복사

API Keys 페이지에서 다음 정보를 확인할 수 있습니다:

#### 1. Publishable Key (공개 키)
- **위치**: "Publishable key" 섹션
- **형태**: `pk_test_...` 또는 `pk_live_...`로 시작
- **용도**: 프론트엔드에서 사용 (브라우저에 노출되어도 안전)
- **복사**: "Copy" 버튼 클릭

#### 2. Secret Key (비밀 키)
- **위치**: "Secret keys" 섹션
- **형태**: `sk_test_...` 또는 `sk_live_...`로 시작
- **용도**: 서버에서만 사용 (절대 공개하지 마세요!)
- **복사**: "Copy" 버튼 클릭
- **주의**: "Show" 버튼을 클릭해야 전체 키를 볼 수 있습니다

### 5단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_여기에_복사한_키_붙여넣기
CLERK_SECRET_KEY=sk_test_여기에_복사한_키_붙여넣기
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### 6단계: 개발 서버 재시작

환경 변수를 변경한 후에는 반드시 개발 서버를 재시작해야 합니다:

```bash
# 서버 중지 (Ctrl + C)
# 서버 재시작
pnpm dev
```

## Clerk Dashboard 화면 구성

```
┌─────────────────────────────────────────┐
│  Clerk Dashboard                         │
├─────────────────────────────────────────┤
│  [Home] [Users] [Sessions] [API Keys] ← 여기 클릭!
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Publishable key                │   │
│  │  pk_test_xxxxxxxxxxxxx          │   │
│  │  [Copy]                         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Secret keys                    │   │
│  │  sk_test_xxxxxxxxxxxxx          │   │
│  │  [Show] [Copy]                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 테스트 키 vs 프로덕션 키

- **Test 키** (`pk_test_`, `sk_test_`): 개발 환경용
- **Live 키** (`pk_live_`, `sk_live_`): 프로덕션 환경용

개발 중에는 **Test 키**를 사용하세요.

## 문제 해결

### 키를 찾을 수 없어요
- 프로젝트가 생성되었는지 확인
- 올바른 프로젝트를 선택했는지 확인
- Clerk 계정에 프로젝트 접근 권한이 있는지 확인

### 키를 복사했는데 작동하지 않아요
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 키 앞뒤에 공백이나 따옴표가 없는지 확인
- 개발 서버를 재시작했는지 확인
- `.env` 파일이 `.gitignore`에 포함되어 있는지 확인 (보안)

### Secret Key가 보이지 않아요
- "Show" 버튼을 클릭해야 전체 키를 볼 수 있습니다
- 처음 생성한 키는 한 번만 표시되므로 안전한 곳에 보관하세요

## 추가 설정 (선택사항)

### 소셜 로그인 설정

Clerk Dashboard에서 소셜 로그인을 활성화할 수 있습니다:

1. **Configure** → **Social Connections**
2. 원하는 제공자 선택 (Google, GitHub 등)
3. OAuth 자격 증명 입력
4. **Enable** 클릭

### 이메일/비밀번호 설정

1. **Configure** → **Email, Phone, Username**
2. 원하는 인증 방식 선택
3. 설정 저장

## 참고 자료

- [Clerk 공식 문서](https://clerk.com/docs)
- [Clerk Next.js 가이드](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk API Keys 문서](https://clerk.com/docs/keys/overview)

