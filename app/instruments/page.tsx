import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Link from "next/link";

/**
 * @file app/instruments/page.tsx
 * @description Supabase 공식 문서 예제 기반 Instruments 테스트 페이지
 * 
 * 이 페이지는 Supabase 공식 문서의 Quickstart 예제를 기반으로 작성되었습니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * Instruments 테이블의 데이터를 조회하여 표시합니다.
 * 
 * 공식 문서 패턴:
 * - `createClient`를 `@/lib/supabase/server`에서 import
 * - `await createClient()` 사용 (async 함수)
 * - Suspense를 사용한 로딩 상태 처리
 */

interface Instrument {
  id: number;
  name: string;
}

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 border-red-200">
        <h3 className="font-semibold text-red-800 mb-2">오류 발생</h3>
        <p className="text-sm text-red-700">{error.message}</p>
        <p className="text-xs text-red-600 mt-4">
          💡 <strong>해결 방법:</strong>
          <br />
          1. Supabase Dashboard에서 <code>instruments</code> 테이블이 생성되었는지 확인
          <br />
          2. RLS 정책이 올바르게 설정되었는지 확인
          <br />
          3. 테이블이 존재하지 않으면 SQL Editor에서 생성 스크립트를 실행하세요
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">
          Instruments 테이블에 데이터가 없습니다.
          <br />
          Supabase Dashboard의 SQL Editor에서 샘플 데이터를 추가하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {instruments.map((instrument: Instrument) => (
        <div
          key={instrument.id}
          className="p-4 border rounded-lg bg-white dark:bg-gray-800"
        >
          <p className="font-medium">{instrument.name}</p>
          <p className="text-xs text-gray-500 mt-1">ID: {instrument.id}</p>
        </div>
      ))}
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">Instruments</h1>
        <p className="text-gray-600 mb-4">
          Supabase 공식 문서 예제 기반 테스트 페이지
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>📚 공식 문서: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs</p>
          <p>✅ Server Component에서 Supabase 데이터 조회</p>
          <p>✅ Suspense를 사용한 로딩 상태 처리</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Instruments 목록</h2>
        <Suspense
          fallback={
            <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
              <p>Loading instruments...</p>
            </div>
          }
        >
          <InstrumentsData />
        </Suspense>
      </div>

      <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          📝 Instruments 테이블 생성 방법
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
          Supabase Dashboard의 SQL Editor에서 다음 스크립트를 실행하세요:
        </p>
        <pre className="bg-white dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto">
          {`-- Create the table
CREATE TABLE instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- Insert some sample data
INSERT INTO instruments (name)
VALUES ('violin'), ('viola'), ('cello');

-- Enable RLS
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);`}
        </pre>
      </div>
    </div>
  );
}

