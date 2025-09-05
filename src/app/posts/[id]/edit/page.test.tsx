import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostEditPage from './page';
import type { Post } from '@/types/api';

// Mock 데이터
const mockPost: Post = {
  id: 'post-123',
  title: '테스트 포스트',
  content: '테스트 내용입니다.',
  status: 'draft',
  channelId: 'channel-123',
  workspaceId: 'workspace-123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  publishedAt: null,
  metadata: {},
};

// Mock API 훅
const mockUsePost = {
  data: { data: mockPost },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

const mockUseUpdatePost = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null,
};

// Mock 설정
vi.mock('@/hooks/use-api', () => ({
  usePost: vi.fn(() => mockUsePost),
  useUpdatePost: vi.fn(() => mockUseUpdatePost),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ 
    push: vi.fn(),
    back: vi.fn(),
  })),
  useParams: vi.fn(() => ({ id: 'post-123' })),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-123', email: 'test@example.com' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PostEditPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePost.data = { data: mockPost };
    mockUsePost.isLoading = false;
    mockUsePost.error = null;
    mockUseUpdatePost.isPending = false;
    mockUseUpdatePost.error = null;
  });

  describe('기본 렌더링', () => {
    it('should render edit page with form fields', async () => {
      // When
      render(<PostEditPage />);

      // Then
      expect(screen.getByText('포스트 편집')).toBeInTheDocument();
      expect(screen.getByLabelText(/제목/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/내용/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
    });

    it('should populate form with existing post data', async () => {
      // When
      render(<PostEditPage />);

      // Then
      await waitFor(() => {
        expect(screen.getByDisplayValue('테스트 포스트')).toBeInTheDocument();
        expect(screen.getByDisplayValue('테스트 내용입니다.')).toBeInTheDocument();
      });
    });
  });

  describe('로딩 상태', () => {
    it('should show loading state when post is loading', async () => {
      // Given
      mockUsePost.isLoading = true;
      mockUsePost.data = null;

      // When
      render(<PostEditPage />);

      // Then
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('should show error state when post fails to load', async () => {
      // Given
      mockUsePost.error = new Error('포스트를 불러올 수 없습니다');
      mockUsePost.data = null;

      // When
      render(<PostEditPage />);

      // Then
      expect(screen.getByText('포스트를 불러올 수 없습니다')).toBeInTheDocument();
    });
  });

  describe('폼 제출', () => {
    it('should update post when form is submitted', async () => {
      // Given
      mockUseUpdatePost.mutateAsync.mockResolvedValue({ data: { ...mockPost, title: '수정된 제목' } });
      
      render(<PostEditPage />);

      // When
      const titleInput = screen.getByLabelText(/제목/i);
      const saveButton = screen.getByRole('button', { name: /저장/i });
      
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 제목');
      await user.click(saveButton);

      // Then
      await waitFor(() => {
        expect(mockUseUpdatePost.mutateAsync).toHaveBeenCalledWith({
          id: 'post-123',
          title: '수정된 제목',
          content: '테스트 내용입니다.',
        });
      });
    });

    it('should show loading state during update', async () => {
      // Given
      mockUseUpdatePost.isPending = true;
      
      render(<PostEditPage />);

      // Then
      expect(screen.getByRole('button', { name: /저장 중/i })).toBeInTheDocument();
    });

    it('should show error when update fails', async () => {
      // Given
      mockUseUpdatePost.error = new Error('업데이트 실패');
      
      render(<PostEditPage />);

      // Then
      expect(screen.getByText('업데이트 실패')).toBeInTheDocument();
    });
  });

  describe('폼 검증', () => {
    it('should show validation error for empty title', async () => {
      // Given
      render(<PostEditPage />);

      // When
      const titleInput = screen.getByLabelText(/제목/i);
      const saveButton = screen.getByRole('button', { name: /저장/i });
      
      await user.clear(titleInput);
      await user.click(saveButton);

      // Then
      expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
    });

    it('should show validation error for empty content', async () => {
      // Given
      render(<PostEditPage />);

      // When
      const contentInput = screen.getByLabelText(/내용/i);
      const saveButton = screen.getByRole('button', { name: /저장/i });
      
      await user.clear(contentInput);
      await user.click(saveButton);

      // Then
      expect(screen.getByText('내용을 입력해주세요')).toBeInTheDocument();
    });
  });

  describe('네비게이션', () => {
    it('should navigate back when cancel button is clicked', async () => {
      // Given
      const mockPush = vi.fn();
      const mockBack = vi.fn();
      const { useRouter } = await import('next/navigation');
      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        back: mockBack,
      });
      
      render(<PostEditPage />);

      // When
      const cancelButton = screen.getByRole('button', { name: /취소/i });
      await user.click(cancelButton);

      // Then
      expect(mockBack).toHaveBeenCalled();
    });
  });
});
