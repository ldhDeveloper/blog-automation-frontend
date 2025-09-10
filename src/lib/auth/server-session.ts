/**
 * 서버 사이드 세션 관리
 * RSC(React Server Components)에서 쿠키 기반 세션 읽기
 */

import { Session, User } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { getAuthFromCookiesServer, isTokenExpired, isValidToken } from './server-cookie-session';
import { createSupabaseServerClient } from './supabase-auth';

export interface ServerSession {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

/**
 * 서버 컴포넌트에서 현재 세션 가져오기
 */
export async function getServerSession(): Promise<ServerSession> {
  try {
    // 쿠키에서 토큰 읽기
    const { accessToken, refreshToken } = await getAuthFromCookiesServer();

    if (!accessToken || !isValidToken(accessToken)) {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
      };
    }

    // 토큰 만료 확인
    if (isTokenExpired(accessToken)) {
      if (!refreshToken || !isValidToken(refreshToken)) {
        return {
          user: null,
          session: null,
          isAuthenticated: false,
        };
      }

      // 리프레시 토큰으로 세션 갱신
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        return {
          user: null,
          session: null,
          isAuthenticated: false,
        };
      }

      return {
        user: data.session.user,
        session: data.session,
        isAuthenticated: true,
      };
    }

    // 액세스 토큰으로 사용자 정보 가져오기
    const supabase = createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
      };
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

    return {
      user,
      session,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Server session error:', error);
    return {
      user: null,
      session: null,
      isAuthenticated: false,
    };
  }
}

/**
 * 미들웨어에서 설정한 사용자 정보 가져오기
 */
export async function getServerUserFromHeaders(): Promise<{
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  accessToken: string | null;
}> {
  try {
    const headersList = await headers();
    
    return {
      userId: headersList.get('x-user-id'),
      userEmail: headersList.get('x-user-email'),
      userName: headersList.get('x-user-name'),
      accessToken: headersList.get('x-access-token'),
    };
  } catch (error) {
    console.error('Error reading user headers:', error);
    return {
      userId: null,
      userEmail: null,
      userName: null,
      accessToken: null,
    };
  }
}

/**
 * 인증이 필요한 서버 액션에서 사용자 검증
 */
export async function requireAuth(): Promise<{
  user: User;
  session: Session;
}> {
  const { user, session, isAuthenticated } = await getServerSession();

  if (!isAuthenticated || !user || !session) {
    throw new Error('Authentication required');
  }

  return { user, session };
}

/**
 * 선택적 인증 (인증되지 않은 사용자도 허용)
 */
export async function getOptionalAuth(): Promise<{
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}> {
  return await getServerSession();
}
