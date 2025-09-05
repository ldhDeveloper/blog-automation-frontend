import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostsHeader } from './PostsHeader';

// 🔴 RED → 🟢 GREEN: PostsHeader 컴포넌트 테스트 작성

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('PostsHeader', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('should render header title', () => {
      // When
      render(<PostsHeader />);

      // Then
      expect(screen.getByText('포스트 관리')).toBeInTheDocument();
    });

    it('should render description', () => {
      // When
      render(<PostsHeader />);

      // Then
      expect(screen.getByText('포스트를 관리하고 모니터링할 수 있습니다')).toBeInTheDocument();
    });

    it('should render new post button', () => {
      // When
      render(<PostsHeader />);

      // Then
      expect(screen.getByRole('button', { name: /새 포스트/ })).toBeInTheDocument();
    });
  });

  describe('새 포스트 버튼', () => {
    it('should navigate to new post page when clicked', async () => {
      // Given
      render(<PostsHeader />);
      const newPostButton = screen.getByRole('button', { name: /새 포스트/ });

      // When
      await user.click(newPostButton);

      // Then
      expect(mockPush).toHaveBeenCalledWith('/posts/create');
    });

    it('should have plus icon', () => {
      // When
      render(<PostsHeader />);

      // Then
      const button = screen.getByRole('button', { name: /새 포스트/ });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('should have proper heading hierarchy', () => {
      // When
      render(<PostsHeader />);

      // Then
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('포스트 관리');
    });

    it('should have accessible button text', () => {
      // When
      render(<PostsHeader />);

      // Then
      const button = screen.getByRole('button', { name: /새 포스트/ });
      expect(button).toHaveTextContent('새 포스트 생성');
    });
  });

  describe('반응형 디자인', () => {
    it('should have responsive layout classes', () => {
      // When
      const { container } = render(<PostsHeader />);

      // Then
      const headerDiv = container.firstChild as HTMLElement;
      expect(headerDiv).toHaveClass('flex', 'flex-col', 'gap-4', 'md:flex-row', 'md:items-center', 'md:justify-between');
    });
  });
});