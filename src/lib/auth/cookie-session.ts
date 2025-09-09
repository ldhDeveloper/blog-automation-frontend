/**
 * 쿠키 기반 세션 관리 유틸리티
 * HttpOnly + Secure + SameSite=Lax 쿠키로 세션 관리
 */

import { cookies } from 'next/headers';
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
): void {
  // 액세스 토큰 쿠키 설정 (15분)
  response.cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 15, // 15분
  });

  // 리프레시 토큰 쿠키 설정 (7일)
  response.cookies.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60 * 24 * 7, // 7일
  });

  // 세션 ID 쿠키 설정 (선택적)
  if (sessionId) {
    response.cookies.set(COOKIE_KEYS.SESSION_ID, sessionId, {
      ...COOKIE_CONFIG,
      maxAge: 60 * 60 * 24 * 7, // 7일
    });
  }
}

/**
 * 서버 사이드에서 쿠키에서 토큰 읽기
 */
export function getAuthFromCookies(request: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
} {
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
 * 서버 컴포넌트에서 쿠키에서 토큰 읽기
 */
export async function getAuthFromCookiesServer(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
}> {
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
 * 인증 쿠키 삭제
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(COOKIE_KEYS.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_KEYS.REFRESH_TOKEN);
  response.cookies.delete(COOKIE_KEYS.SESSION_ID);
}

/**
 * 클라이언트 사이드에서 쿠키 읽기 (공개 쿠키만)
 */
export function getPublicCookies(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const cookieString = document.cookie;
  const cookies: Record<string, string> = {};
  
  cookieString.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

/**
 * 토큰 유효성 검사 (기본적인 형식 검사)
 */
export function isValidToken(token: string | null): boolean {
  if (!token) return false;
  
  // JWT 토큰은 3개 부분으로 구성 (header.payload.signature)
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * 토큰 만료 시간 추출
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // 초를 밀리초로 변환
  } catch {
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
