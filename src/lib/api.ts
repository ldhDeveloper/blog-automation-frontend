import type { ApiError, ApiResponse } from '@/types/api';
import ky, { HTTPError } from 'ky';
import { createSupabaseServerClient } from './auth/supabase-auth';
import { clientLogger } from './client-logger';

// API 클라이언트 설정 (프록시 사용)
const apiClient = ky.create({
  prefixUrl: '/api/proxy',
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      async (_request) => {
        // 프록시에서 쿠키를 읽어 Authorization 헤더로 자동 변환
        // 클라이언트에서는 별도 처리 불필요
        // 쿠키는 자동으로 포함되어 프록시로 전달됨
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        // API 요청 로깅
        const method = request.method;
        const url = request.url;
        const status = response.status;
        
        clientLogger.logApiRequest(method, url, status, 0, {
          success: status >= 200 && status < 300
        });
        
        // 401 에러 시 인증 페이지로 리다이렉트
        if (response.status === 401) {
          clientLogger.warn('인증 실패로 로그아웃', 'AUTH', { url, method });
          // 로그아웃 API 호출
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch (error) {
            console.error('Logout failed:', error);
          }
          window.location.href = '/auth/login';
        }
        return response;
      },
    ],
    beforeError: [
      (error) => {
        // HTTP 에러 로깅
        if (error instanceof HTTPError) {
          clientLogger.error('HTTP 에러 발생', 'API_ERROR', {
            status: error.response.status,
            url: error.response.url,
            message: error.message
          });
        }
        return error;
      },
    ],
  },
});

// API 응답 처리 헬퍼
async function handleApiResponse<T>(request: Promise<Response>): Promise<ApiResponse<T>> {
  try {
    const response = await request;
    return await response.json();
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorData: ApiError = await error.response.json().catch(() => ({
        message: 'Unknown error occurred',
      }));
      
      throw new Error(errorData.message || `HTTP ${error.response.status}`);
    }
    
    throw error;
  }
}

// JWT 토큰 검증 및 사용자 정보 추출 (서버 사이드 전용)
export async function validateJWTToken(accessToken: string) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      throw new Error('Invalid token');
    }
    
    return {
      user,
      isValid: true,
    };
  } catch (error) {
    console.error('JWT validation failed:', error);
    return {
      user: null,
      isValid: false,
      error: error instanceof Error ? error.message : 'Token validation failed',
    };
  }
}

// 서버 사이드에서 쿠키 읽기 (서버 컴포넌트에서 사용)
export async function getServerAuthFromCookies() {
  const { getAuthFromCookiesServer } = await import('./auth/server-cookie-session');
  return getAuthFromCookiesServer();
}

// 서버 사이드 API 클라이언트 (JWT 직접 전달)
export function createServerApiClient(accessToken: string) {
  return ky.create({
    prefixUrl: process.env.BACKEND_API_URL || 'http://localhost:3001',
    timeout: 30000,
    retry: {
      limit: 2,
      methods: ['get', 'put', 'delete'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

// API 클라이언트 export
export { apiClient };

// API 메서드들
export const api = {
  // 포스트 관련
  posts: {
    getAll: (params?: { 
      page?: number; 
      limit?: number; 
      status?: string; 
      search?: string; 
      sort?: string; 
      channelId?: string; 
    }) => handleApiResponse(apiClient.get('posts', { searchParams: params })),
    
    get: (id: string) =>
      handleApiResponse(apiClient.get(`posts/${id}`)),
    
    getTimeline: (id: string) =>
      handleApiResponse(apiClient.get(`posts/${id}/timeline`)),
    
    create: (data: { title: string; content: string; channelId: string }) =>
      handleApiResponse(apiClient.post('posts', { json: data })),
    
    update: (id: string, data: Partial<{ title: string; content: string; channelId: string }>) =>
      handleApiResponse(apiClient.patch(`posts/${id}`, { json: data })),
    
    delete: (id: string) =>
      handleApiResponse(apiClient.delete(`posts/${id}`)),
    
    retry: (id: string) =>
      handleApiResponse(apiClient.post(`posts/${id}/retry`)),
    
    retryJob: (jobId: string) =>
      handleApiResponse(apiClient.post(`jobs/${jobId}/retry`)),
  },

  // 채널 관련
  channels: {
    list: () =>
      handleApiResponse(apiClient.get('channels')),
    
    get: (id: string) =>
      handleApiResponse(apiClient.get(`channels/${id}`)),
    
    create: (data: { name: string; description?: string; platform: string; settings: Record<string, unknown> }) =>
      handleApiResponse(apiClient.post('channels', { json: data })),
    
    update: (id: string, data: Partial<{ name: string; description?: string; platform: string; settings: Record<string, unknown> }>) =>
      handleApiResponse(apiClient.patch(`channels/${id}`, { json: data })),
    
    delete: (id: string) =>
      handleApiResponse(apiClient.delete(`channels/${id}`)),
  },

  // 워크스페이스 관련
  workspaces: {
    list: () =>
      handleApiResponse(apiClient.get('workspaces')),
    
    get: (id: string) =>
      handleApiResponse(apiClient.get(`workspaces/${id}`)),
    
    create: (data: { name: string; description?: string }) =>
      handleApiResponse(apiClient.post('workspaces', { json: data })),
    
    update: (id: string, data: Partial<{ name: string; description?: string }>) =>
      handleApiResponse(apiClient.patch(`workspaces/${id}`, { json: data })),
  },

  // 사용자 관련
  users: {
    me: () =>
      handleApiResponse(apiClient.get('users/me')),
    
    update: (data: Partial<{ name: string; avatar?: string }>) =>
      handleApiResponse(apiClient.patch('users/me', { json: data })),
  },
};

// SSE 연결을 위한 헬퍼
export function createSSEConnection(url: string, onMessage: (data: unknown) => void, onError?: (error: Event) => void) {
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse SSE data:', error);
    }
  };
  
  if (onError) {
    eventSource.onerror = onError;
  }
  
  return eventSource;
}
