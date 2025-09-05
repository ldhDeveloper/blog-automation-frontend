import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/providers/theme-provider';

// 테스트용 QueryClient 생성
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// 테스트 래퍼 컴포넌트
interface TestProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const TestProviders = ({ children, queryClient }: TestProvidersProps) => {
  const client = queryClient || createTestQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
};

// 커스텀 render 함수
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  { queryClient, ...options }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient ?? new QueryClient()}>{children}</TestProviders>
    ),
    ...options,
  });
};

// 테스트 유틸리티 함수들
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'member' as const,
  workspaceId: 'test-workspace-id',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPost = (overrides = {}) => ({
  id: 'test-post-id',
  title: 'Test Post',
  content: 'Test content',
  status: 'draft' as const,
  channelId: 'test-channel-id',
  workspaceId: 'test-workspace-id',
  authorId: 'test-user-id',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockChannel = (overrides = {}) => ({
  id: 'test-channel-id',
  name: 'Test Channel',
  description: 'Test description',
  platform: 'blog',
  settings: {},
  workspaceId: 'test-workspace-id',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockWorkspace = (overrides = {}) => ({
  id: 'test-workspace-id',
  name: 'Test Workspace',
  description: 'Test workspace description',
  ownerId: 'test-user-id',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// API 응답 모킹 헬퍼
export const createMockApiResponse = <T,>(data: T, overrides = {}) => ({
  data,
  success: true,
  message: 'Success',
  ...overrides,
});

export const createMockApiError = (message = 'Test error', overrides = {}) => ({
  data: null,
  success: false,
  message,
  ...overrides,
});

// 비동기 작업 대기 헬퍼
export const waitForNextTick = () => new Promise((resolve) => process.nextTick(resolve));

// 재내보내기
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
