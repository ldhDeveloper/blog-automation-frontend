/**
 * 쿠키 기반 인증 프로바이더
 * PKCE OAuth 플로우와 쿠키 기반 세션 관리
 */

'use client';

import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// 타입 정의
interface CookieAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface CookieAuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialSession?: Session | null;
}

// 컨텍스트 생성
const CookieAuthContext = createContext<CookieAuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export function CookieAuthProvider({ 
  children, 
  initialUser = null, 
  initialSession = null 
}: CookieAuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(false);

  // 세션 갱신
  const refreshSession = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 페이지 새로고침으로 서버에서 최신 세션 정보 가져오기
          window.location.reload();
        }
      } else {
        // 갱신 실패 시 로그아웃
        await signOut();
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        setSession(null);
        // 로그인 페이지로 리다이렉트
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      setUser(null);
      setSession(null);
      window.location.href = '/auth/login';
    } finally {
      setLoading(false);
    }
  };

  // 토큰 만료 체크 및 자동 갱신
  useEffect(() => {
    if (!session?.access_token) return;

    const checkTokenExpiry = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeUntilExpiry = expiresAt - now;

      // 토큰이 5분 이내에 만료되면 갱신
      if (timeUntilExpiry < 300) {
        refreshSession();
      }
    };

    // 즉시 체크
    checkTokenExpiry();

    // 1분마다 체크
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const value: CookieAuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    signOut,
    refreshSession,
  };

  return (
    <CookieAuthContext.Provider value={value}>
      {children}
    </CookieAuthContext.Provider>
  );
}

// useCookieAuth 훅
export function useCookieAuth(): CookieAuthContextType {
  const context = useContext(CookieAuthContext);
  
  if (context === undefined) {
    throw new Error('useCookieAuth must be used within a CookieAuthProvider');
  }
  
  return context;
}
