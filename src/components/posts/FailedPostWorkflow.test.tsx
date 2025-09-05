import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostDetail } from './PostDetail';
import { PostActions } from './PostActions';
import type { Post, TimelineEvent } from '@/types/api';

// 🔴 RED: 실패한 포스트의 전체 워크플로우 통합 테스트

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
  usePostTimeline: vi.fn(),
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

describe('Failed Post Workflow Integration Test', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const mockFailedPost: Post = {
    id: 'post-1',
    title: 'Failed Post',
    content: 'This post generation failed',
    status: 'failed',
    channelId: 'channel-1',
    workspaceId: 'workspace-1',
    authorId: 'author-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:05:00Z',
  };

  const mockFailedTimelineEvent: TimelineEvent = {
    id: 'event-1',
    postId: 'post-1',
    type: 'draft',
    status: 'failed',
    timestamp: '2024-01-01T00:03:00Z',
    message: 'Draft generation failed',
    error: 'OpenAI API rate limit exceeded. Please try again later.',
    metadata: {
      retryCount: 1,
      lastRetry: '2024-01-01T00:04:00Z'
    }
  };

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

  describe('실패한 포스트 전체 워크플로우', () => {
    it('should display error information and allow retry for failed post', async () => {
      // Given: 실패한 포스트와 타임라인 이벤트
      const { usePost, usePostTimeline, useRetryPost, useDeletePost } = await import('@/hooks/use-api');
      
      const mockRetryPost = { 
        mutateAsync: vi.fn().mockResolvedValue({}), 
        isPending: false 
      };

      vi.mocked(usePost).mockReturnValue({
        data: { data: mockFailedPost },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(usePostTimeline).mockReturnValue({
        data: { data: [mockFailedTimelineEvent] },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useRetryPost).mockReturnValue(mockRetryPost as any);

      // When: PostDetail과 PostActions를 함께 렌더링
      renderWithProviders(
        <div>
          <PostDetail postId="post-1" />
          <PostActions postId="post-1" />
        </div>
      );

      // Then: 실패 정보와 재시도 버튼이 모두 표시되어야 함
      await waitFor(() => {
        // 포스트 제목이 표시됨
        expect(screen.getByText('Failed Post')).toBeInTheDocument();
        
        // 실패 상태 배지가 표시됨
        expect(screen.getByText('실패')).toBeInTheDocument();
        
        // 에러 메시지가 표시됨
        expect(screen.getByText('실패 원인')).toBeInTheDocument();
        expect(screen.getByText('OpenAI API rate limit exceeded. Please try again later.')).toBeInTheDocument();
        
        // 재시도 횟수가 표시됨
        expect(screen.getByText(/재시도 횟수: 1회/)).toBeInTheDocument();
        
        // 재시도 버튼이 표시됨
        expect(screen.getByRole('button', { name: /재시도/ })).toBeInTheDocument();
      });

      // When: 재시도 버튼 클릭
      const retryButton = screen.getByRole('button', { name: /재시도/ });
      await user.click(retryButton);

      // Then: 재시도 API가 호출되고 성공 메시지가 표시됨
      await waitFor(() => {
        expect(mockRetryPost.mutateAsync).toHaveBeenCalledWith('post-1');
      });

      const { toast } = await import('sonner');
      expect(toast.success).toHaveBeenCalledWith('포스트 재생성을 시작했습니다');
    });

    it('should not display error information for successful post', async () => {
      // Given: 성공한 포스트
      const successPost = { ...mockFailedPost, status: 'published' as const };
      
      const { usePost, usePostTimeline, useRetryPost, useDeletePost } = await import('@/hooks/use-api');

      vi.mocked(usePost).mockReturnValue({
        data: { data: successPost },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(usePostTimeline).mockReturnValue({
        data: { data: [] },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useRetryPost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      // When: PostDetail과 PostActions를 함께 렌더링
      renderWithProviders(
        <div>
          <PostDetail postId="post-1" />
          <PostActions postId="post-1" />
        </div>
      );

      // Then: 에러 정보나 재시도 버튼이 표시되지 않아야 함
      await waitFor(() => {
        // 포스트 제목은 표시됨
        expect(screen.getByText('Failed Post')).toBeInTheDocument();
        
        // 성공 상태 배지가 표시됨
        expect(screen.getByText('게시됨')).toBeInTheDocument();
        
        // 에러 정보는 표시되지 않음
        expect(screen.queryByText('실패 원인')).not.toBeInTheDocument();
        expect(screen.queryByText('OpenAI API rate limit exceeded')).not.toBeInTheDocument();
        
        // 재시도 버튼은 표시되지 않음
        expect(screen.queryByRole('button', { name: /재시도/ })).not.toBeInTheDocument();
      });
    });

    it('should handle multiple failed events correctly', async () => {
      // Given: 여러 실패 이벤트가 있는 경우
      const multipleFailedEvents: TimelineEvent[] = [
        {
          id: 'event-1',
          postId: 'post-1',
          type: 'ideate',
          status: 'completed',
          timestamp: '2024-01-01T00:01:00Z',
          message: 'Ideation completed successfully',
        },
        {
          id: 'event-2',
          postId: 'post-1',
          type: 'draft',
          status: 'failed',
          timestamp: '2024-01-01T00:02:00Z',
          message: 'Draft generation failed',
          error: 'First failure: Network timeout',
        },
        {
          id: 'event-3',
          postId: 'post-1',
          type: 'draft',
          status: 'failed',
          timestamp: '2024-01-01T00:03:00Z',
          message: 'Draft generation retry failed',
          error: 'Second failure: Rate limit exceeded',
          metadata: {
            retryCount: 2,
            lastRetry: '2024-01-01T00:03:30Z'
          }
        }
      ];

      const { usePost, usePostTimeline, useRetryPost, useDeletePost } = await import('@/hooks/use-api');

      vi.mocked(usePost).mockReturnValue({
        data: { data: mockFailedPost },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(usePostTimeline).mockReturnValue({
        data: { data: multipleFailedEvents },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useDeletePost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(useRetryPost).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      } as any);

      // When: 컴포넌트 렌더링
      renderWithProviders(
        <div>
          <PostDetail postId="post-1" />
          <PostActions postId="post-1" />
        </div>
      );

      // Then: 첫 번째 실패 이벤트의 정보가 표시되어야 함 (find는 첫 번째 매치를 반환)
      await waitFor(() => {
        expect(screen.getByText('실패 원인')).toBeInTheDocument();
        expect(screen.getByText('First failure: Network timeout')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /재시도/ })).toBeInTheDocument();
      });
    });
  });
});
