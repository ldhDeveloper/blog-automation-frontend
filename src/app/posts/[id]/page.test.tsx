import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PostDetailPage from './page';
import type { Post, TimelineEvent } from '@/types/api';

// Mock 데이터
const mockPost: Post = {
  id: '123',
  title: '테스트 포스트',
  content: '테스트 내용',
  status: 'published',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  publishedAt: '2024-01-01T00:00:00Z',
  authorId: 'user-123',
  metadata: {
    tags: ['테스트'],
  },
  channelId: 'channel-1',
  workspaceId: 'workspace-1',
};

const mockTimeline: TimelineEvent[] = [
  {
    id: '1',
    postId: '123',
    type: 'ideate',
    status: 'completed',
    timestamp: '2024-01-01T08:00:00Z',
    message: '아이디어 생성 완료',
    duration: 120,
  },
];

interface MockUsePost {
  data: { data: Post | null };
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// API 훅 모킹
const mockUsePost: MockUsePost = {
  data: { data: mockPost },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

const mockUsePostTimeline = {
  data: { data: mockTimeline },
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

// AuthProvider 모킹
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('should render post detail page when post is loaded', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = { data: mockPost };
      mockUsePost.error = null;

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('포스트 상세')).toBeInTheDocument();
    });

    it('should show loading state when data is loading', () => {
      // Given
      mockUsePost.isLoading = true;
      mockUsePost.data = { data: null };

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
    });

    it('should show error state when post loading fails', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = { data: null };
      mockUsePost.error = new Error('네트워크 오류');

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('네트워크 오류')).toBeInTheDocument();
    });
  });

  describe('포스트 정보 표시', () => {
    it('should display post title when post is loaded', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = { data: mockPost };
      mockUsePost.error = null;

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    });

    it('should display post status when post is loaded', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = { data: mockPost };
      mockUsePost.error = null;

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('게시됨')).toBeInTheDocument();
    });
  });

  describe('액션 버튼', () => {
    it('should render action buttons when post is loaded', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = { data: mockPost };
      mockUsePost.error = null;

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('button', { name: /편집/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /목록으로/i })).toBeInTheDocument();
    });
  });

  describe('타임라인', () => {
    it('should render timeline section when post is loaded', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = { data: mockPost };
      mockUsePost.error = null;

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByText('생성 타임라인')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('should have proper ARIA labels when post is loaded', () => {
      // Given
      mockUsePost.isLoading = false;
      mockUsePost.data = { data: mockPost };
      mockUsePost.error = null;

      // When
      render(<PostDetailPage />);

      // Then
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/포스트 작업/i)).toBeInTheDocument();
    });
  });
});