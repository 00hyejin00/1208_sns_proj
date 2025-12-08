-- Tasks 테이블 생성 예제
-- Clerk + Supabase 네이티브 통합 공식 문서 예제
-- https://clerk.com/docs/guides/development/integrations/databases/supabase

-- tasks 테이블 생성
-- user_id는 Clerk user ID를 저장하며, 기본값으로 auth.jwt()->>'sub' 사용
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub')
);

-- 테이블 소유자 설정
ALTER TABLE public.tasks OWNER TO postgres;

-- Row Level Security (RLS) 활성화
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "User can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::TEXT)
);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON public.tasks
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = (user_id)::TEXT)
);

-- UPDATE 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::TEXT)
)
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = (user_id)::TEXT)
);

-- DELETE 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::TEXT)
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- 권한 부여
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.tasks_id_seq TO authenticated;

