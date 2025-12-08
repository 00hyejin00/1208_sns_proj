'use client'

/**
 * @file app/tasks-test/page.tsx
 * @description Clerk + Supabase 통합 테스트 페이지 (공식 문서 예제 기반)
 * 
 * 이 페이지는 Clerk 공식 문서의 예제를 기반으로 작성되었습니다.
 * Tasks 테이블을 사용하여 Clerk 인증과 Supabase RLS 정책이 올바르게 작동하는지 테스트합니다.
 * 
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 */

import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Task {
  id: number
  name: string
  user_id: string
}

export default function TasksTestPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // useUser() hook으로 사용자 정보 로드 확인
  const { user } = useUser()
  
  // useSession() hook으로 세션 객체 가져오기
  const { session } = useSession()
  
  // Clerk + Supabase 통합 클라이언트
  const supabase = useClerkSupabaseClient()

  // Tasks 로드
  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await supabase.from('tasks').select()
      
      if (error) {
        console.error('Error loading tasks:', error)
        setLoading(false)
        return
      }
      
      if (data) setTasks(data)
      setLoading(false)
    }

    loadTasks()
  }, [user, supabase])

  // Task 생성
  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!name.trim()) return
    
    setSubmitting(true)
    
    try {
      const { error } = await supabase.from('tasks').insert({
        name: name.trim(),
      })
      
      if (error) {
        console.error('Error creating task:', error)
        alert('작업 생성 실패: ' + error.message)
        return
      }
      
      // 성공 시 목록 새로고침
      setName('')
      window.location.reload()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('작업 생성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold mb-2">Tasks 테스트</h1>
          <p className="text-gray-600">
            이 페이지를 사용하려면 먼저 로그인해야 합니다.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">
            🔐 로그인이 필요합니다. 상단 네비게이션에서 로그인해주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">Tasks 테스트</h1>
        <p className="text-gray-600 mb-4">
          Clerk + Supabase 네이티브 통합 공식 문서 예제 기반 테스트 페이지
        </p>
        <div className="text-sm text-gray-500">
          <p>✅ Clerk 세션 토큰 자동 사용</p>
          <p>✅ RLS 정책으로 사용자별 데이터 분리</p>
          <p>✅ JWT 템플릿 불필요</p>
        </div>
      </div>

      {/* Tasks 목록 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Tasks</h2>
        
        {loading && <p>Loading...</p>}
        
        {!loading && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg bg-white dark:bg-gray-800"
              >
                <p className="font-medium">{task.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  User ID: {task.user_id}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {!loading && tasks.length === 0 && (
          <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
            <p className="text-gray-600">작업이 없습니다. 아래에서 새 작업을 추가하세요.</p>
          </div>
        )}
      </div>

      {/* Task 생성 폼 */}
      <div className="border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">새 작업 추가</h3>
        <form onSubmit={createTask} className="flex gap-4">
          <input
            autoFocus
            type="text"
            name="name"
            placeholder="작업 이름을 입력하세요"
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? '추가 중...' : '추가'}
          </Button>
        </form>
      </div>

      {/* 디버그 정보 */}
      <details className="mt-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <summary className="cursor-pointer font-semibold text-sm">
          디버그 정보 (개발용)
        </summary>
        <div className="mt-4 text-xs space-y-2 font-mono">
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
          <p>
            <strong>Session:</strong> {session ? '활성' : '없음'}
          </p>
          <p>
            <strong>Tasks Count:</strong> {tasks.length}
          </p>
        </div>
      </details>
    </div>
  )
}

