/**
 * 로그아웃 API 라우트
 * 세션 무효화 및 쿠키 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth/supabase-auth';
import { getAuthFromCookies, clearAuthCookies } from '@/lib/auth/cookie-session';

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 토큰 추출
    const { accessToken } = getAuthFromCookies(request);

    // Supabase에서 로그아웃 (토큰이 있는 경우)
    if (accessToken) {
      await signOut();
    }

    // 성공 응답 생성
    const response = NextResponse.json({ success: true });

    // 인증 쿠키 삭제
    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // 에러가 발생해도 쿠키는 삭제
    const response = NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
    clearAuthCookies(response);
    return response;
  }
}
