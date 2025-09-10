/**
 * 서버 사이드 쿠키 세션 관리 유틸리티
 * next/headers를 사용하는 서버 전용 함수들
 */

import { NextRequest, NextResponse } from 'next/server';

// 쿠키 설정 상수
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7일
  path: '/',
};

// 쿠키 키 상수
export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  SESSION_ID: 'sb-session-id',
} as const;

/**
 * 서버 사이드에서 쿠키에 토큰 저장
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  sessionId?: string
) {
  // 액세스 토큰 쿠키 설정
  response.cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60, // 1시간
  });

  // 리프레시 토큰 쿠키 설정
  response.cookies.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60 * 24 * 7, // 7일
  });

  // 세션 ID 설정 (선택사항)
  if (sessionId) {
    response.cookies.set(COOKIE_KEYS.SESSION_ID, sessionId, {
      ...COOKIE_CONFIG,
      maxAge: 60 * 60 * 24 * 7, // 7일
    });
  }
}

/**
 * 서버 사이드에서 쿠키에서 인증 정보 읽기
 */
export async function getAuthFromCookiesServer() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  const accessToken = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value || null;
  const refreshToken = cookieStore.get(COOKIE_KEYS.REFRESH_TOKEN)?.value || null;
  const sessionId = cookieStore.get(COOKIE_KEYS.SESSION_ID)?.value || null;

  return {
    accessToken,
    refreshToken,
    sessionId,
  };
}

/**
 * 서버 사이드에서 쿠키에서 인증 정보 읽기 (NextRequest 사용)
 */
export function getAuthFromCookies(request: NextRequest) {
  const accessToken = request.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value || null;
  const refreshToken = request.cookies.get(COOKIE_KEYS.REFRESH_TOKEN)?.value || null;
  const sessionId = request.cookies.get(COOKIE_KEYS.SESSION_ID)?.value || null;

  return {
    accessToken,
    refreshToken,
    sessionId,
  };
}

/**
 * 서버 사이드에서 인증 쿠키 삭제
 */
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(COOKIE_KEYS.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_KEYS.REFRESH_TOKEN);
  response.cookies.delete(COOKIE_KEYS.SESSION_ID);
}

/**
 * JWT 토큰에서 만료 시간 추출
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // 밀리초로 변환
  } catch (error) {
    console.error('Failed to parse token expiration:', error);
    return null;
  }
}

/**
 * 토큰 만료 여부 확인
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  return Date.now() >= expiration;
}

/**
 * 토큰 유효성 검사
 */
export function isValidToken(token: string): boolean {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // 페이로드 파싱 시도
    JSON.parse(atob(parts[1]));
    
    // 만료 시간 확인
    return !isTokenExpired(token);
  } catch (error) {
    return false;
  }
}
