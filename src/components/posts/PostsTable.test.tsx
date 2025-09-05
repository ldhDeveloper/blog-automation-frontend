import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostsTable } from './PostsTable';
import type { Post } from '@/types/api';

// 🔴 RED → 🟢 GREEN: PostsTable 컴포넌트 테스트 작성

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock API hooks
vi.mock('@/hooks/use-api', () => ({
  usePosts: vi.fn(),
}));

// Mock 포스트 데이터
const mockPosts: Post[] = [
  {
    id: 'post-1',
    title: 'First Post',
    content: 'Content of first post',
    status: 'published',
    channelId: 'channel-1',
    workspaceId: 'workspace-1',
    authorId: 'author-1',
    publishedAt: '2024-01-01T10:00:00Z',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:30:00Z',
    metadata: {
      readTime: 5,
      wordCount: 250,
      tags: ['tech', 'react'],
    },
  },
  {
    id: 'post-2',
    title: 'Second Post',
    content: 'Content of second post',
    status: 'failed',
    channelId: 'channel-1',
    workspaceId: 'workspace-1',
    authorId: 'author-1',
    createdAt: '2024-01-02T09:00:00Z',
    updatedAt: '2024-01-02T09:30:00Z',
    metadata: {
      readTime: 3,
      wordCount: 150,
      tags: ['blog'],
    },
  },
  {
    id: 'post-3',
    title: 'Third Post',
    content: 'Content of third post',
    status: 'generating',
    channelId: 'channel-2',
    workspaceId: 'workspace-1',
    authorId: 'author-1',
    createdAt: '2024-01-03T09:00:00Z',
    updatedAt: '2024-01-03T09:30:00Z',
  },
];

describe('PostsTable', () => {
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

  describe('기본 렌더링', () => {
    it('should render table headers', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: {
          data: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByText('제목')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('생성일')).toBeInTheDocument();
      expect(screen.getByText('작업')).toBeInTheDocument();
    });

    it('should display posts data', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: {
          data: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('Third Post')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('should show empty state when no posts', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByText('아직 생성된 포스트가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 포스트를 생성해보세요')).toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('should show loading state', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('should show error state', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API Error'),
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  describe('상태 표시', () => {
    it('should display correct status badges', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: {
          data: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByText('게시됨')).toBeInTheDocument(); // published
      expect(screen.getByText('실패')).toBeInTheDocument(); // failed
      expect(screen.getByText('생성 중')).toBeInTheDocument(); // generating
    });
  });

  describe('네비게이션', () => {
    it('should navigate to post detail when clicking on post', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: {
          data: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<PostsTable />);

      // When
      const postTitle = screen.getByText('First Post');
      await user.click(postTitle);

      // Then
      expect(mockPush).toHaveBeenCalledWith('/posts/post-1');
    });
  });

  describe('페이지네이션', () => {
    it('should display pagination when multiple pages', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: {
          data: mockPosts,
          pagination: {
            page: 1,
            limit: 2,
            total: 5,
            totalPages: 3,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByText('1 / 3 페이지')).toBeInTheDocument();
    });
  });

  describe('작업 버튼', () => {
    it('should display action buttons for each post', async () => {
      // Given
      const { usePosts } = await import('@/hooks/use-api');
      vi.mocked(usePosts).mockReturnValue({
        data: {
          data: [mockPosts[0]], // 하나만 테스트
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      // When
      renderWithProviders(<PostsTable />);

      // Then
      expect(screen.getByRole('button', { name: /메뉴 열기/ })).toBeInTheDocument();
    });
  });
});
