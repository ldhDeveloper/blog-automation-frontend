/**
 * API 프록시 라우트
 * 클라이언트 요청을 백엔드 API로 프록시하고 쿠키에서 토큰을 헤더로 변환
 */

import { getAuthFromCookies } from '@/lib/auth/cookie-session';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'DELETE');
}

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // 경로 구성
    const path = pathSegments.join('/');
    const backendUrl = `${BACKEND_API_URL}/${path}`;
    
    // 쿼리 파라미터 추가
    const url = new URL(backendUrl);
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // 쿠키에서 인증 토큰 추출
    const { accessToken } = getAuthFromCookies(request);

    // 요청 헤더 구성
    const headers = new Headers();
    
    // 원본 요청의 헤더 복사 (일부 제외)
    const excludeHeaders = ['host', 'connection', 'upgrade', 'proxy-connection'];
    request.headers.forEach((value, key) => {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // 인증 토큰이 있으면 Authorization 헤더 추가
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // Content-Type 설정 (POST, PUT, PATCH 요청의 경우)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }

    // 요청 본문 처리
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text();
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }

    // 백엔드 API 호출
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body || null,
    }).catch((error) => {
      console.error('Backend connection failed:', error);
      // 백엔드가 연결되지 않은 경우 모의 응답 반환
      if (error.code === 'ECONNREFUSED') {
        return new Response(JSON.stringify({
          error: 'Backend service unavailable',
          message: '백엔드 서비스가 실행되지 않았습니다. BACKEND_API_URL을 확인하세요.',
          code: 'BACKEND_UNAVAILABLE'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    });

    // 응답 헤더 복사
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // CORS 관련 헤더는 제외
      if (!['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    // CORS 헤더 설정
    responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');

    // 응답 본문 읽기
    const responseBody = await response.text();

    // 응답 반환
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
