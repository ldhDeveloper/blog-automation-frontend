/**
 * OAuth 콜백 처리 API 라우트
 * PKCE 기반 OAuth 플로우의 콜백을 처리하고 쿠키에 세션 저장
 */

import { setAuthCookies } from '@/lib/auth/cookie-session';
import { handleOAuthCallback } from '@/lib/auth/supabase-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // OAuth 에러 처리
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // 필수 파라미터 검증
    if (!code || !state) {
      console.error('Missing required parameters:', { code: !!code, state: !!state });
      return NextResponse.redirect(
        new URL('/auth/login?error=missing_parameters', request.url)
      );
    }

    // 콜백 URL 생성 (현재 도메인)
    const redirectTo = new URL('/dashboard', request.url).toString();

    // OAuth 콜백 처리
    const { session, error: authError } = await handleOAuthCallback(code, state);

    if (authError || !session) {
      console.error('OAuth callback failed:', authError);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(authError?.message || 'authentication_failed')}`, request.url)
      );
    }

    // 성공 응답 생성
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // 쿠키에 세션 저장
    setAuthCookies(
      response,
      session.access_token,
      session.refresh_token,
      session.user?.id
    );

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=server_error', request.url)
    );
  }
}
