import { vi } from 'vitest';

// Next.js router 모킹
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  isFallback: false,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
};

// useRouter 훅 모킹
export const useRouter = vi.fn(() => mockRouter);

// Next.js navigation 모킹
export const usePathname = vi.fn(() => '/');
export const useSearchParams = vi.fn(() => new URLSearchParams());
export const useParams = vi.fn(() => ({}));

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
