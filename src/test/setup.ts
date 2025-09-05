import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Supabase 모킹
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

// Next.js 라우터 모킹
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

// AuthProvider 모킹
vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// 각 테스트 후 DOM 정리
afterEach(() => {
  cleanup();
});

// 전역 모킹 설정
beforeAll(() => {
  // Next.js 라우터 모킹
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // IntersectionObserver 모킹
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// EventSource 모킹 - 기존 속성이 있는지 확인 후 정의
if (!global.EventSource) {
  Object.defineProperty(global, 'EventSource', {
    value: vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      readyState: 1,
      url: '',
      withCredentials: false,
      CONNECTING: 0,
      OPEN: 1,
      CLOSED: 2,
    })),
    writable: true,
    configurable: true,
  });
}

// MessageEvent 모킹
global.MessageEvent = vi.fn().mockImplementation((type, options) => ({
  type,
  data: options?.data || '',
  origin: options?.origin || '',
  lastEventId: options?.lastEventId || '',
  source: options?.source || null,
  ports: options?.ports || [],
}));

  // 환경 변수 모킹
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

afterAll(() => {
  vi.clearAllMocks();
});
