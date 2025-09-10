/**
 * OAuth 콜백 처리 API 라우트
 * Supabase 공식 문서에 따른 PKCE 기반 OAuth 콜백 처리
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  console.log('code !!!', code);
  
  // "next" 파라미터가 있으면 리다이렉트 URL로 사용, 없으면 기본값 '/'
  let next = searchParams.get('next') ?? '/';
  if (next.startsWith('/')) {
    next = '/dashboard';
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('exchangeCodeForSession result:', { data, error });
    
    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    
    if (data.session) {
      // 성공 시 대시보드로 리다이렉트
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      console.log('redirecting to', `${origin}${next}`);
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 에러 발생 시 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/login?error=auth_code_error`);
}
