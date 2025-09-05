import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostDetail } from './PostDetail';
import type { Post, TimelineEvent } from '@/types/api';
import * as useApiHooks from '@/hooks/use-api';

// 🔴 RED: 새로운 실패 원인 표시 기능에 대한 테스트 작성

// Mock 데이터
const mockPost: Post = {
  id: 'post-1',
  title: 'Test Post',
  content: 'Test content',
  status: 'failed',
  channelId: 'channel-1',
  workspaceId: 'workspace-1',
  authorId: 'author-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:05:00Z',
  metadata: {
    readTime: 5,
    wordCount: 100,
    tags: ['test', 'blog'],
    seoScore: 85
  }
};

const mockFailedTimelineEvent: TimelineEvent = {
  id: 'event-1',
  postId: 'post-1',
  type: 'draft',
  status: 'failed',
  timestamp: '2024-01-01T00:03:00Z',
  message: 'Draft generation failed',
  error: 'API timeout: Content generation took too long',
  metadata: {
    retryCount: 2,
    lastRetry: '2024-01-01T00:05:00Z'
  }
};

// Mock API hooks
vi.mock('@/hooks/use-api', () => ({
  usePost: vi.fn(),
  usePostTimeline: vi.fn(),
}));

// Mock PostErrorDisplay 컴포넌트
vi.mock('./PostErrorDisplay', () => ({
  PostErrorDisplay: vi.fn(({ timelineEvent }) => 
    timelineEvent ? (
      <div data-testid="post-error-display">
        Error: {timelineEvent.error}
      </div>
    ) : null
  ),
}));

describe('PostDetail - 실패 원인 표시 기능', () => {
  let queryClient: QueryClient;

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

  describe('실패한 포스트의 에러 표시', () => {
    it('should display error information when post status is failed', async () => {
      // Given: 실패한 포스트와 실패 이벤트가 있는 상태
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { data: mockPost },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.usePostTimeline).mockReturnValue({
        data: { data: [mockFailedTimelineEvent] },
        isLoading: false,
        error: null,
      } as any);

      // When: PostDetail 컴포넌트를 렌더링
      renderWithProviders(<PostDetail postId="post-1" />);

      // Then: 에러 정보가 표시되어야 함
      await waitFor(() => {
        expect(screen.getByTestId('post-error-display')).toBeInTheDocument();
        expect(screen.getByText(/API timeout: Content generation took too long/)).toBeInTheDocument();
      });
    });

    it('should not display error information when post status is not failed', async () => {
      // Given: 성공한 포스트 상태
      const successPost = { ...mockPost, status: 'published' as const };
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { data: successPost },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.usePostTimeline).mockReturnValue({
        data: { data: [] },
        isLoading: false,
        error: null,
      } as any);

      // When: PostDetail 컴포넌트를 렌더링
      renderWithProviders(<PostDetail postId="post-1" />);

      // Then: 에러 정보가 표시되지 않아야 함
      await waitFor(() => {
        expect(screen.queryByTestId('post-error-display')).not.toBeInTheDocument();
      });
    });

    it('should not display error information when no failed timeline events exist', async () => {
      // Given: 실패한 포스트이지만 실패 이벤트가 없는 상태
      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { data: mockPost },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.usePostTimeline).mockReturnValue({
        data: { data: [] }, // 빈 타임라인
        isLoading: false,
        error: null,
      } as any);

      // When: PostDetail 컴포넌트를 렌더링
      renderWithProviders(<PostDetail postId="post-1" />);

      // Then: 에러 정보가 표시되지 않아야 함
      await waitFor(() => {
        expect(screen.queryByTestId('post-error-display')).not.toBeInTheDocument();
      });
    });
  });

  describe('타임라인 이벤트 처리', () => {
    it('should find and display the most recent failed event', async () => {
      // Given: 여러 이벤트가 있고 하나가 실패한 상태
      const multipleEvents: TimelineEvent[] = [
        {
          id: 'event-1',
          postId: 'post-1',
          type: 'ideate',
          status: 'completed',
          timestamp: '2024-01-01T00:01:00Z',
          message: 'Ideation completed',
        },
        mockFailedTimelineEvent,
        {
          id: 'event-3',
          postId: 'post-1',
          type: 'image',
          status: 'pending',
          timestamp: '2024-01-01T00:04:00Z',
          message: 'Image generation pending',
        }
      ];

      vi.mocked(useApiHooks.usePost).mockReturnValue({
        data: { data: mockPost },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useApiHooks.usePostTimeline).mockReturnValue({
        data: { data: multipleEvents },
        isLoading: false,
        error: null,
      } as any);

      // When: PostDetail 컴포넌트를 렌더링
      renderWithProviders(<PostDetail postId="post-1" />);

      // Then: 실패한 이벤트의 에러 정보만 표시되어야 함
      await waitFor(() => {
        expect(screen.getByTestId('post-error-display')).toBeInTheDocument();
        expect(screen.getByText(/API timeout: Content generation took too long/)).toBeInTheDocument();
      });
    });
  });
});
