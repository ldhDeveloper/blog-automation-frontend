/**
 * 클라이언트/서버 공용 쿠키 세션 관리 유틸리티
 * next/headers를 사용하지 않는 공용 함수들
 */

// 쿠키 키 상수 (서버 파일에서 re-export)
export { COOKIE_KEYS } from './server-cookie-session';

/**
 * 클라이언트 사이드에서 쿠키 읽기 (document.cookie 사용)
 * 주의: HttpOnly 쿠키는 클라이언트에서 읽을 수 없음
 */
export function getAuthFromCookiesClient() {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }

  const cookies = document.cookie.split(';');
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'sb-access-token') {
      accessToken = value;
    } else if (name === 'sb-refresh-token') {
      refreshToken = value;
    }
  }

  return { accessToken, refreshToken };
}

/**
 * 클라이언트 사이드에서 세션 상태 확인
 */
export function getClientSessionState() {
  const { accessToken, refreshToken } = getAuthFromCookiesClient();
  
  return {
    isAuthenticated: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessToken,
    refreshToken,
  };
}

/**
 * JWT 토큰에서 만료 시간 추출 (클라이언트/서버 공용)
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
 * 토큰 만료 여부 확인 (클라이언트/서버 공용)
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  return Date.now() >= expiration;
}