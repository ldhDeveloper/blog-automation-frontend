import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostDetailPage from './page';

// Mock 데이터
const mockPost = {
  id: '123',
  title: '테스트 블로그 포스트',
  content: '이것은 테스트 포스트 내용입니다. 매우 흥미로운 주제에 대해 다루고 있습니다.',
  status: 'published',
  channelId: 'channel-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
  publishedAt: '2024-01-01T10:00:00Z',
  metadata: {
    readTime: 5,
    wordCount: 250,
    tags: ['기술', '개발', 'Next.js'],
    seoScore: 85,
  },
};

const mockTimeline = [
  {
    id: '1',
    type: 'ideate',
    status: 'completed',
    timestamp: '2024-01-01T08:00:00Z',
    message: '아이디어 생성 완료',
    duration: 120,
  },
  {
    id: '2',
    type: 'draft',
    status: 'completed',
    timestamp: '2024-01-01T09:00:00Z',
    message: '초안 작성 완료',
    duration: 300,
  },
  {
    id: '3',
    type: 'image',
    status: 'completed',
    timestamp: '2024-01-01T09:30:00Z',
    message: '이미지 생성 완료',
    duration: 180,
  },
  {
    id: '4',
    type: 'seo',
    status: 'completed',
    timestamp: '2024-01-01T09:45:00Z',
    message: 'SEO 최적화 완료',
    duration: 90,
  },
  {
    id: '5',
    type: 'publish',
    status: 'completed',
    timestamp: '2024-01-01T10:00:00Z',
    message: '게시 완료',
    duration: 60,
  },
];

// API 훅 모킹
const mockUsePost = {
  data: mockPost,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

const mockUsePostTimeline = {
  data: mockTimeline,
  isLoading: false,
  error: null,
};

vi.mock('@/hooks/use-api', () => ({
  usePost: () => mockUsePost,
  usePostTimeline: () => mockUsePostTimeline,
  useDeletePost: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useRetryPost: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Next.js router 및 params 모킹
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn(),
  }),
  useParams: () => ({ id: '123' }),
  notFound: vi.fn(),
}));

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render post detail page with all sections', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('포스트 상세');
      expect(screen.getByText('테스트 블로그 포스트')).toBeInTheDocument();
      expect(screen.getByText(/이것은 테스트 포스트 내용입니다/)).toBeInTheDocument();
    });

    it('should render post metadata correctly', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('5분')).toBeInTheDocument(); // 읽기 시간
      expect(screen.getByText('250개')).toBeInTheDocument(); // 단어 수
      expect(screen.getByText('85점')).toBeInTheDocument(); // SEO 점수
      expect(screen.getByText('기술')).toBeInTheDocument(); // 태그
      expect(screen.getByText('개발')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
    });

    it('should render post status badge', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('게시됨')).toBeInTheDocument();
    });

    it('should render post actions', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('button', { name: /편집/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /삭제/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /목록으로/i })).toBeInTheDocument();
    });

    it('should render timeline section', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('생성 타임라인')).toBeInTheDocument();
      expect(screen.getByText('아이디어 생성 완료')).toBeInTheDocument();
      expect(screen.getByText('초안 작성 완료')).toBeInTheDocument();
      expect(screen.getByText('이미지 생성 완료')).toBeInTheDocument();
      expect(screen.getByText('SEO 최적화 완료')).toBeInTheDocument();
      expect(screen.getByText('게시 완료')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when data is loading', () => {
      // Given
      mockUsePost.isLoading = true;
      mockUsePost.data = null;

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when post loading fails', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = null;
      mockUsePost.error = { message: '포스트를 불러올 수 없습니다' };

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText(/포스트를 불러올 수 없습니다/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /다시 시도/i })).toBeInTheDocument();
    });

    it('should retry loading when retry button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePost.isLoading = false;
      mockUsePost.data = null;
      mockUsePost.error = { message: '네트워크 오류' };

      render(<PostDetailPage />);

      // When
      const retryButton = screen.getByRole('button', { name: /다시 시도/i });
      await user.click(retryButton);

      // Then
      expect(mockUsePost.refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Post Actions', () => {
    it('should navigate to edit page when edit button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostDetailPage />);

      // When
      const editButton = screen.getByRole('button', { name: /편집/i });
      await user.click(editButton);

      // Then
      expect(mockPush).toHaveBeenCalledWith('/posts/123/edit');
    });

    it('should navigate back to posts list when back button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostDetailPage />);

      // When
      const backButton = screen.getByRole('button', { name: /목록으로/i });
      await user.click(backButton);

      // Then
      expect(mockPush).toHaveBeenCalledWith('/posts');
    });

    it('should show delete confirmation dialog when delete button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostDetailPage />);

      // When
      const deleteButton = screen.getByRole('button', { name: /삭제/i });
      await user.click(deleteButton);

      // Then
      expect(screen.getByText(/정말로 삭제하시겠습니까/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /확인/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
    });

    it('should show retry button for failed posts', () => {
      // Given
      mockUsePost.data = { ...mockPost, status: 'failed' };

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('button', { name: /재시도/i })).toBeInTheDocument();
    });
  });

  describe('Timeline Features', () => {
    it('should show timeline step durations', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('2분')).toBeInTheDocument(); // ideate duration
      expect(screen.getByText('5분')).toBeInTheDocument(); // draft duration
      expect(screen.getByText('3분')).toBeInTheDocument(); // image duration
      expect(screen.getByText('1분')).toBeInTheDocument(); // seo duration
      expect(screen.getByText('1분')).toBeInTheDocument(); // publish duration
    });

    it('should show timeline step timestamps', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText(/08:00/)).toBeInTheDocument();
      expect(screen.getByText(/09:00/)).toBeInTheDocument();
      expect(screen.getByText(/09:30/)).toBeInTheDocument();
      expect(screen.getByText(/09:45/)).toBeInTheDocument();
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
    });

    it('should show total generation time', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText(/총 소요시간/i)).toBeInTheDocument();
      expect(screen.getByText('12분')).toBeInTheDocument(); // 총 750초 = 12.5분
    });
  });

  describe('Content Display', () => {
    it('should render markdown content properly', () => {
      // Given
      mockUsePost.data = {
        ...mockPost,
        content: '# 제목\n\n**굵은 글씨**와 *이탤릭*이 포함된 내용입니다.\n\n- 목록 항목 1\n- 목록 항목 2',
      };

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('제목');
      expect(screen.getByText('굵은 글씨')).toBeInTheDocument();
      expect(screen.getByText('이탤릭')).toBeInTheDocument();
    });

    it('should show published date for published posts', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText(/게시일/i)).toBeInTheDocument();
      expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
    });

    it('should not show published date for draft posts', () => {
      // Given
      mockUsePost.data = { ...mockPost, status: 'draft', publishedAt: null };

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.queryByText(/게시일/i)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have proper layout structure', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('post-content')).toBeInTheDocument();
      expect(screen.getByTestId('post-sidebar')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and structure', () => {
      // Given & When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByLabelText(/포스트 작업/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostDetailPage />);

      // When
      await user.tab(); // Navigate to edit button
      expect(screen.getByRole('button', { name: /편집/i })).toHaveFocus();

      await user.tab(); // Navigate to delete button
      expect(screen.getByRole('button', { name: /삭제/i })).toHaveFocus();

      await user.tab(); // Navigate to back button
      expect(screen.getByRole('button', { name: /목록으로/i })).toHaveFocus();
    });
  });
});
