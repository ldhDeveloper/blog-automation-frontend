/**
 * 토큰 갱신 API 라우트
 * 리프레시 토큰을 사용하여 액세스 토큰 갱신
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshTokens } from '@/lib/auth/supabase-auth';
import { getAuthFromCookies, setAuthCookies, clearAuthCookies } from '@/lib/auth/cookie-session';

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 리프레시 토큰 추출
    const { refreshToken } = getAuthFromCookies(request);

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // 토큰 갱신
    const { session, error } = await refreshTokens(refreshToken);

    if (error || !session) {
      // 갱신 실패 시 쿠키 삭제
      const response = NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    // 성공 응답 생성
    const response = NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email,
      },
    });

    // 새로운 토큰을 쿠키에 저장
    setAuthCookies(
      response,
      session.access_token,
      session.refresh_token,
      session.user?.id
    );

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // 에러 시 쿠키 삭제
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    clearAuthCookies(response);
    return response;
  }
}
