import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()

// 타입 정의 (나중에 데이터베이스 스키마 생성 후 자동 생성된 타입으로 교체)
export type Database = Record<string, unknown>
