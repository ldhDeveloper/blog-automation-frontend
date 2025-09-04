import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostsPage from './page';

// API 모킹
const mockPosts = [
  {
    id: '1',
    title: '첫 번째 블로그 포스트',
    content: '포스트 내용...',
    status: 'published',
    channelId: 'channel-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: '두 번째 블로그 포스트',
    content: '다른 포스트 내용...',
    status: 'draft',
    channelId: 'channel-1',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: '세 번째 블로그 포스트',
    content: '또 다른 포스트 내용...',
    status: 'generating',
    channelId: 'channel-2',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

// 포스트 API 훅 모킹
const mockUsePosts = {
  data: { data: mockPosts, pagination: { page: 1, limit: 10, total: 3, totalPages: 1 } },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/hooks/use-api', () => ({
  usePosts: () => mockUsePosts,
}));

// Next.js router 모킹
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/posts',
}));

describe('PostsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render posts page with header and content', () => {
      // Given & When
      render(<PostsPage />);

      // Then
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('포스트 관리');
      expect(screen.getByText(/포스트를 관리하고 모니터링할 수 있습니다/i)).toBeInTheDocument();
    });

    it('should render posts filter component', () => {
      // Given & When
      render(<PostsPage />);

      // Then
      expect(screen.getByRole('combobox', { name: /상태/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /정렬/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/포스트 제목 검색/i)).toBeInTheDocument();
    });

    it('should render posts table with data', () => {
      // Given & When
      render(<PostsPage />);

      // Then
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 블로그 포스트')).toBeInTheDocument();
      expect(screen.getByText('두 번째 블로그 포스트')).toBeInTheDocument();
      expect(screen.getByText('세 번째 블로그 포스트')).toBeInTheDocument();
    });

    it('should display post status badges correctly', () => {
      // Given & When
      render(<PostsPage />);

      // Then
      expect(screen.getByText('게시됨')).toBeInTheDocument();
      expect(screen.getByText('초안')).toBeInTheDocument();
      expect(screen.getByText('생성 중')).toBeInTheDocument();
    });

    it('should render create new post button', () => {
      // Given & When
      render(<PostsPage />);

      // Then
      const createButton = screen.getByRole('button', { name: /새 포스트 생성/i });
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when data is loading', () => {
      // Given
      mockUsePosts.isLoading = true;
      mockUsePosts.data = null;

      // When
      render(<PostsPage />);

      // Then
      expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when data loading fails', () => {
      // Given
      mockUsePosts.isLoading = false;
      mockUsePosts.data = null;
      mockUsePosts.error = { message: '포스트를 불러오는데 실패했습니다' };

      // When
      render(<PostsPage />);

      // Then
      expect(screen.getByText(/포스트를 불러오는데 실패했습니다/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /다시 시도/i })).toBeInTheDocument();
    });

    it('should retry loading when retry button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePosts.isLoading = false;
      mockUsePosts.data = null;
      mockUsePosts.error = { message: '네트워크 오류' };

      render(<PostsPage />);

      // When
      const retryButton = screen.getByRole('button', { name: /다시 시도/i });
      await user.click(retryButton);

      // Then
      expect(mockUsePosts.refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no posts exist', () => {
      // Given
      mockUsePosts.isLoading = false;
      mockUsePosts.data = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      mockUsePosts.error = null;

      // When
      render(<PostsPage />);

      // Then
      expect(screen.getByText(/아직 생성된 포스트가 없습니다/i)).toBeInTheDocument();
      expect(screen.getByText(/첫 번째 포스트를 생성해보세요/i)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter posts by status', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostsPage />);

      // When
      const statusFilter = screen.getByRole('combobox', { name: /상태/i });
      await user.click(statusFilter);
      
      const publishedOption = screen.getByText('게시됨');
      await user.click(publishedOption);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/posts?status=published');
      });
    });

    it('should search posts by title', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostsPage />);

      // When
      const searchInput = screen.getByPlaceholderText(/포스트 제목 검색/i);
      await user.type(searchInput, '첫 번째');

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/posts?search=첫 번째');
      });
    });

    it('should sort posts by different criteria', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostsPage />);

      // When
      const sortFilter = screen.getByRole('combobox', { name: /정렬/i });
      await user.click(sortFilter);
      
      const titleOption = screen.getByText('제목순');
      await user.click(titleOption);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/posts?sort=title');
      });
    });
  });

  describe('Pagination', () => {
    it('should render pagination controls when there are multiple pages', () => {
      // Given
      mockUsePosts.data = {
        data: mockPosts,
        pagination: { page: 1, limit: 2, total: 10, totalPages: 5 }
      };

      // When
      render(<PostsPage />);

      // Then
      expect(screen.getByRole('navigation', { name: /페이지네이션/i })).toBeInTheDocument();
      expect(screen.getByText('1 / 5 페이지')).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePosts.data = {
        data: mockPosts,
        pagination: { page: 1, limit: 2, total: 10, totalPages: 5 }
      };

      render(<PostsPage />);

      // When
      const nextButton = screen.getByRole('button', { name: /다음 페이지/i });
      await user.click(nextButton);

      // Then
      expect(mockPush).toHaveBeenCalledWith('/posts?page=2');
    });
  });

  describe('Post Actions', () => {
    it('should navigate to post detail when clicking on post title', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostsPage />);

      // When
      const postTitle = screen.getByText('첫 번째 블로그 포스트');
      await user.click(postTitle);

      // Then
      expect(mockPush).toHaveBeenCalledWith('/posts/1');
    });

    it('should navigate to post creation page when clicking create button', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostsPage />);

      // When
      const createButton = screen.getByRole('button', { name: /새 포스트 생성/i });
      await user.click(createButton);

      // Then
      expect(mockPush).toHaveBeenCalledWith('/posts/create');
    });
  });

  describe('Real-time Updates', () => {
    it('should update post status in real-time', async () => {
      // Given
      render(<PostsPage />);

      // When
      // SSE 이벤트 시뮬레이션
      const eventSource = new EventSource('/api/posts/stream');
      const updateEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'post_updated',
          postId: '2',
          status: 'published'
        })
      });

      // Then
      fireEvent(eventSource, updateEvent);
      
      await waitFor(() => {
        expect(mockUsePosts.refetch).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and keyboard navigation', () => {
      // Given & When
      render(<PostsPage />);

      // Then
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', '포스트 목록');
      
      const searchInput = screen.getByPlaceholderText(/포스트 제목 검색/i);
      expect(searchInput).toHaveAttribute('aria-label', '포스트 검색');
    });

    it('should support keyboard navigation for filters', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostsPage />);

      // When
      await user.tab(); // Navigate to search input
      expect(screen.getByPlaceholderText(/포스트 제목 검색/i)).toHaveFocus();

      await user.tab(); // Navigate to status filter
      expect(screen.getByRole('combobox', { name: /상태/i })).toHaveFocus();

      await user.tab(); // Navigate to sort filter
      expect(screen.getByRole('combobox', { name: /정렬/i })).toHaveFocus();
    });
  });
});
