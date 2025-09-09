import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 싱글톤 패턴으로 클라이언트 인스턴스 관리
let supabaseInstance: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  // 이미 인스턴스가 있으면 재사용
  if (supabaseInstance) {
    return supabaseInstance
  }

  // 새로운 인스턴스 생성
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // 브라우저 환경에서만 세션을 자동으로 복원
      autoRefreshToken: true,
      persistSession: true,
      // 동일한 storage key 사용을 보장
      storageKey: 'supabase.auth.token',
      // 동일한 storage 사용
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  })

  return supabaseInstance
}

// 기본 export로 싱글톤 인스턴스 제공
export const supabase = createClient()

// 타입 정의 (나중에 데이터베이스 스키마 생성 후 자동 생성된 타입으로 교체)
export type Database = Record<string, unknown>
