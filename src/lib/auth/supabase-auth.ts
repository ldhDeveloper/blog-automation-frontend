/**
 * Supabase Auth 헬퍼 함수들
 * PKCE 기반 OAuth 플로우와 쿠키 기반 세션 관리
 */

import { AuthError, createClient, Session, User } from '@supabase/supabase-js';
// validateAndClearPKCEState는 더 이상 사용하지 않음 (서버 사이드에서 쿠키로 처리)
import {
  getAuthFromCookies,
  isTokenExpired,
  isValidToken
} from './server-cookie-session';

// Supabase 클라이언트 생성 (서버 사이드용)
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Supabase 클라이언트 생성 (클라이언트 사이드용)
export function createSupabaseClientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase.auth.token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
}

/**
 * PKCE OAuth 콜백 처리
 */
export async function handleOAuthCallback(
  code: string,
  state: string,
  request?: Request
): Promise<{ session: Session | null; error: AuthError | null }> {
  const supabase = createSupabaseServerClient();
  
  // 서버 사이드에서 쿠키로 PKCE 상태 검증
  let codeVerifier: string | null = null;
  
  if (request) {
    const cookies = request.headers.get('cookie');
    if (cookies) {
      const stateCookie = getCookieValue(cookies, 'pkce_state');
      const verifierCookie = getCookieValue(cookies, 'pkce_verifier');
      
      if (stateCookie === state && verifierCookie) {
        codeVerifier = verifierCookie;
      }
    }
  }
  
  if (!codeVerifier) {
    return {
      session: null,
      error: { message: 'Invalid PKCE state', status: 400 } as AuthError,
    };
  }

  try {
    // 코드를 토큰으로 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return { session: null, error };
    }

    return { session: data.session, error: null };
  } catch (error) {
    return {
      session: null,
      error: { message: 'OAuth callback failed', status: 500 } as AuthError,
    };
  }
}

// 쿠키에서 값 추출
function getCookieValue(cookies: string, name: string): string | null {
  const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * 서버 사이드에서 세션 검증
 */
export async function verifySessionFromCookies(request: Request): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  const supabase = createSupabaseServerClient();
  
  // 쿠키에서 토큰 추출
  const { accessToken, refreshToken } = getAuthFromCookies(request as any);
  
  if (!accessToken || !isValidToken(accessToken)) {
    return { user: null, session: null, error: 'No valid access token' };
  }

  // 토큰 만료 확인
  if (isTokenExpired(accessToken)) {
    if (!refreshToken || !isValidToken(refreshToken)) {
      return { user: null, session: null, error: 'Token expired and no valid refresh token' };
    }

    // 리프레시 토큰으로 세션 갱신
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return { user: null, session: null, error: 'Failed to refresh session' };
    }

    return { user: data.session.user, session: data.session, error: null };
  }

  // 액세스 토큰으로 사용자 정보 가져오기
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { user: null, session: null, error: 'Invalid access token' };
  }

  // 세션 객체 생성
  const session: Session = {
    access_token: accessToken,
    refresh_token: refreshToken || '',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  };

  return { user, session, error: null };
}

/**
 * 토큰 갱신
 */
export async function refreshTokens(refreshToken: string): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    return { session: data.session, error };
  } catch (error) {
    return {
      session: null,
      error: { message: 'Token refresh failed', status: 500 } as AuthError,
    };
  }
}

/**
 * 로그아웃 처리
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createSupabaseServerClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return {
      error: { message: 'Sign out failed', status: 500 } as AuthError,
    };
  }
}

/**
 * 사용자 정보 가져오기
 */
export async function getUser(accessToken: string): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    return { user, error };
  } catch (error) {
    return {
      user: null,
      error: { message: 'Failed to get user', status: 500 } as AuthError,
    };
  }
}
