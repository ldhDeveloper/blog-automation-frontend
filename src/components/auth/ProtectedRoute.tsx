'use client';

import { useCookieAuth } from '@/providers/cookie-auth-provider';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useCookieAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  // 로딩 중
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )
    );
  }

  // 인증되지 않은 사용자
  if (!user) {
    return null; // 리다이렉트가 진행 중이므로 null 반환
  }

  // 인증된 사용자
  return <>{children}</>;
}
