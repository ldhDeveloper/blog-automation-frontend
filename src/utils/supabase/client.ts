/**
 * Supabase 클라이언트사이드 클라이언트
 * @supabase/ssr 패키지를 사용하여 클라이언트사이드에서 PKCE 인증 처리
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
