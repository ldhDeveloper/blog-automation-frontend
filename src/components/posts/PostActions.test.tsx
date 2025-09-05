import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostActions } from './PostActions';
import * as useApiHooks from '@/hooks/use-api';

// 🔴 RED: 재시도 기능에 대한 테스트 작성

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock API hooks
vi.mock('@/hooks/use-api', () => ({
  usePost: vi.fn(),
  useDeletePost: vi.fn(),
  useRetryPost: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock window.URL
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('PostActions - 재시도 기능', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  describe('재시도 버튼 표시', () => {
    it('should show retry button when post status is failed', async () => {
      // Given: 실패한 포스트
      const mockRetryPost = { mutateAsync: vi.fn(), isPending: false };
      
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { 
          data: { 
            id: 'post-1', 
            status: 'failed',
            title: 'Test Post',
            content: 'Test content'
          } 
        },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useApiHooks.useRetryPost).mockReturnValue(mockRetryPost as any);

      // When: PostActions 컴포넌트 렌더링
      renderWithProviders(<PostActions postId="post-1" />);

      // Then: 재시도 버튼이 표시되어야 함
      expect(screen.getByRole('button', { name: /재시도/ })).toBeInTheDocument();
    });

    it('should not show retry button when post status is not failed', async () => {
      // Given: 성공한 포스트
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { 
          data: { 
            id: 'post-1', 
            status: 'published',
            title: 'Test Post',
            content: 'Test content'
          } 
        },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useApiHooks.useRetryPost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      // When: PostActions 컴포넌트 렌더링
      renderWithProviders(<PostActions postId="post-1" />);

      // Then: 재시도 버튼이 표시되지 않아야 함
      expect(screen.queryByRole('button', { name: /재시도/ })).not.toBeInTheDocument();
    });
  });

  describe('재시도 기능 동작', () => {
    it('should call retry API when retry button is clicked', async () => {
      // Given: 실패한 포스트와 재시도 기능
      const mockRetryPost = { 
        mutateAsync: vi.fn().mockResolvedValue({}), 
        isPending: false 
      };
      
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { 
          data: { 
            id: 'post-1', 
            status: 'failed',
            title: 'Test Post',
            content: 'Test content'
          } 
        },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useApiHooks.useRetryPost).mockReturnValue(mockRetryPost as any);

      // When: PostActions 렌더링 후 재시도 버튼 클릭
      renderWithProviders(<PostActions postId="post-1" />);
      
      const retryButton = screen.getByRole('button', { name: /재시도/ });
      await user.click(retryButton);

      // Then: 재시도 API가 호출되어야 함
      await waitFor(() => {
        expect(mockRetryPost.mutateAsync).toHaveBeenCalledWith('post-1');
      });
    });

    it('should show success message when retry succeeds', async () => {
      // Given: 성공적인 재시도
      const mockRetryPost = { 
        mutateAsync: vi.fn().mockResolvedValue({}), 
        isPending: false 
      };
      
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { 
          data: { 
            id: 'post-1', 
            status: 'failed',
            title: 'Test Post',
            content: 'Test content'
          } 
        },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useApiHooks.useRetryPost).mockReturnValue(mockRetryPost as any);

      const { toast } = await import('sonner');

      // When: 재시도 버튼 클릭
      renderWithProviders(<PostActions postId="post-1" />);
      
      const retryButton = screen.getByRole('button', { name: /재시도/ });
      await user.click(retryButton);

      // Then: 성공 메시지가 표시되어야 함
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('포스트 재생성을 시작했습니다');
      });
    });

    it('should show error message when retry fails', async () => {
      // Given: 실패하는 재시도
      const mockRetryPost = { 
        mutateAsync: vi.fn().mockRejectedValue(new Error('Retry failed')), 
        isPending: false 
      };
      
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { 
          data: { 
            id: 'post-1', 
            status: 'failed',
            title: 'Test Post',
            content: 'Test content'
          } 
        },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useApiHooks.useRetryPost).mockReturnValue(mockRetryPost as any);

      const { toast } = await import('sonner');

      // When: 재시도 버튼 클릭
      renderWithProviders(<PostActions postId="post-1" />);
      
      const retryButton = screen.getByRole('button', { name: /재시도/ });
      await user.click(retryButton);

      // Then: 에러 메시지가 표시되어야 함
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('재시도에 실패했습니다');
      });
    });

    it('should disable retry button while retry is pending', async () => {
      // Given: 진행 중인 재시도
      const mockRetryPost = { 
        mutateAsync: vi.fn(), 
        isPending: true  // 진행 중
      };
      
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { 
          data: { 
            id: 'post-1', 
            status: 'failed',
            title: 'Test Post',
            content: 'Test content'
          } 
        },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useApiHooks.useRetryPost).mockReturnValue(mockRetryPost as any);

      // When: PostActions 렌더링
      renderWithProviders(<PostActions postId="post-1" />);

      // Then: 재시도 버튼이 비활성화되어야 함
      const retryButton = screen.getByRole('button', { name: /재시도/ });
      expect(retryButton).toBeDisabled();
    });
  });
});
