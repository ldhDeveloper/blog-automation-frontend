/**
 * Next.js Middleware
 * 보호된 라우트에 대한 인증 검사 및 리다이렉트 처리
 */

import { verifySessionFromCookies } from '@/lib/auth/supabase-auth';
import { NextRequest, NextResponse } from 'next/server';

// 보호된 라우트 패턴
const protectedRoutes = [
  '/dashboard',
  '/posts',
  '/workspace',
  '/api/posts',
  '/api/workspace',
];

// 공개 라우트 패턴 (인증이 필요하지 않음)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/api/auth/callback',
  '/api/auth/refresh',
  '/api/auth/logout',
];

// 정적 파일 및 Next.js 내부 라우트
const staticRoutes = [
  '/_next',
  '/favicon.ico',
  '/api/logs', // 로그 API는 공개
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일이나 Next.js 내부 라우트는 통과
  if (staticRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 공개 라우트는 통과
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 보호된 라우트인지 확인
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // 쿠키에서 세션 검증
    const { user, session, error } = await verifySessionFromCookies(request);

    if (error || !user || !session) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(loginUrl);
    }

    // 인증 성공 시 요청 헤더에 사용자 정보 추가
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email || '');
    requestHeaders.set('x-user-name', user.user_metadata?.name || user.email || '');
    requestHeaders.set('x-access-token', session.access_token);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    
    // 에러 발생 시 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'authentication_error');
    
    return NextResponse.redirect(loginUrl);
  }
}

// 미들웨어가 실행될 라우트 설정
export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 경로에서 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
