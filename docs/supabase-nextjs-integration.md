# Supabase + Next.js 통합 가이드

이 문서는 Supabase 공식 문서를 기반으로 Next.js 15 App Router에서 Supabase를 사용하는 방법을 설명합니다.

> **참고**: 이 프로젝트는 Clerk를 인증 제공자로 사용하고 있으며, Supabase는 Clerk 토큰을 통해 인증됩니다. 기본 Supabase Auth는 사용하지 않습니다.

## 프로젝트 구조

### Supabase 클라이언트 파일들

프로젝트에는 용도에 따라 여러 Supabase 클라이언트가 있습니다:

```
lib/supabase/
├── clerk-client.ts      # Client Component용 (Clerk 통합)
│   ├── useClerkSupabaseClient()      # Hook 버전 (권장)
│   └── createClerkSupabaseClient()   # 함수 버전
├── server.ts            # Server Component/Server Action용 (Clerk 통합)
│   ├── createClient()                # 공식 문서 패턴 (권장)
│   └── createClerkSupabaseClient()    # 명시적 Clerk 통합
├── client.ts            # 공개 데이터용 (인증 불필요)
│   └── supabase
└── service-role.ts      # 관리자 권한 작업용
    └── getServiceRoleClient()
```

### 공식 문서와의 호환성

이 프로젝트는 [Supabase 공식 문서](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)의 패턴을 따르면서도, Clerk를 인증 제공자로 사용합니다:

- ✅ `createClient` 함수 제공 (공식 문서 패턴)
- ✅ `await createClient()` 사용 (공식 문서 예제와 동일)
- ✅ 내부적으로 Clerk 통합 사용
- ✅ Suspense를 사용한 로딩 상태 처리

### 1. Clerk 통합 클라이언트 (권장)

Clerk를 인증 제공자로 사용할 때:

#### Client Component

```tsx
'use client'

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client'

export default function MyComponent() {
  const supabase = useClerkSupabaseClient()
  
  // 데이터 조회
  const { data } = await supabase.from('tasks').select()
  
  return <div>{/* ... */}</div>
}
```

#### Server Component

**방법 1: 공식 문서 패턴 (권장)**

Supabase 공식 문서의 예제와 호환되는 방식입니다:

```tsx
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'

async function InstrumentsData() {
  const supabase = await createClient()
  const { data: instruments } = await supabase.from('instruments').select()
  return <pre>{JSON.stringify(instruments, null, 2)}</pre>
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  )
}
```

**방법 2: Clerk 통합 명시적 사용**

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = createClerkSupabaseClient()
  const { data } = await supabase.from('tasks').select()
  
  return <div>{/* ... */}</div>
}
```

> **참고**: 두 방법 모두 내부적으로는 동일하게 Clerk 통합을 사용합니다. `createClient()`는 공식 문서 패턴과의 호환성을 위해 제공됩니다.

### 2. 공개 데이터용 클라이언트

인증이 필요 없는 공개 데이터에 접근할 때:

```tsx
import { supabase } from '@/lib/supabase/client'

// RLS 정책이 'anon' 사용자를 허용하는 경우
const { data } = await supabase.from('public_data').select()
```

### 3. 관리자 권한 클라이언트

RLS를 우회해야 하는 관리자 작업용:

```tsx
import { getServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(req: Request) {
  const supabase = getServiceRoleClient()
  // RLS 우회, 모든 데이터 접근 가능
  const { data } = await supabase.from('users').select()
}
```

## 환경 변수

`.env.local` 파일에 다음 환경 변수가 필요합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 서버 사이드 전용
```

## 데이터베이스 접근

### RLS (Row Level Security) 정책

Clerk를 사용할 때는 RLS 정책에서 `auth.jwt()->>'sub'`를 사용하여 Clerk 사용자 ID를 확인합니다:

```sql
-- 예제: Tasks 테이블
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub')
);

-- RLS 정책
CREATE POLICY "User can view their own tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::TEXT)
);
```

## 공식 문서 예제

Supabase 공식 문서의 예제를 따라하려면:

### 1. Instruments 테이블 생성

```sql
-- Supabase Dashboard의 SQL Editor에서 실행
CREATE TABLE instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

INSERT INTO instruments (name) VALUES
  ('violin'),
  ('viola'),
  ('cello');

ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read instruments"
ON instruments FOR SELECT
TO anon
USING (true);
```

### 2. Server Component에서 데이터 조회

**공식 문서 패턴 (권장)**

```tsx
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'

async function InstrumentsData() {
  const supabase = await createClient()
  const { data: instruments } = await supabase.from('instruments').select()
  
  return <pre>{JSON.stringify(instruments, null, 2)}</pre>
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  )
}
```

> **참고**: 이 예제는 [Supabase 공식 문서](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)의 예제와 동일한 패턴을 따릅니다. 내부적으로는 Clerk 통합을 사용하여 인증을 처리합니다.

## 참고 자료

- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Server-Side Guide](https://supabase.com/docs/guides/auth/server-side)
- [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md)

