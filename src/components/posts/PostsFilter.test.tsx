import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostsFilter } from './PostsFilter';

// 🔴 RED → 🟢 GREEN: PostsFilter 컴포넌트 테스트 작성

// Mock Next.js router
const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/posts',
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe('PostsFilter', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  describe('기본 렌더링', () => {
    it('should render filter controls', () => {
      // When
      render(<PostsFilter />);

      // Then
      expect(screen.getByLabelText('포스트 검색')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /상태/ })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /정렬/ })).toBeInTheDocument();
    });

    it('should render search input with correct placeholder', () => {
      // When
      render(<PostsFilter />);

      // Then
      expect(screen.getByPlaceholderText('포스트 제목 검색')).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('should update search value when typing', async () => {
      // Given
      render(<PostsFilter />);
      const searchInput = screen.getByLabelText('포스트 검색');

      // When
      await user.type(searchInput, 'test search');

      // Then
      expect(searchInput).toHaveValue('test search');
    });
  });

  describe('상태 필터', () => {
    it('should display all status options', () => {
      // When
      render(<PostsFilter />);

      // Then
      const statusSelect = screen.getByRole('combobox', { name: /상태/ });
      expect(statusSelect).toHaveTextContent('전체');
    });
  });

  describe('정렬 기능', () => {
    it('should display all sort options', () => {
      // When
      render(<PostsFilter />);

      // Then
      const sortSelect = screen.getByRole('combobox', { name: /정렬/ });
      expect(sortSelect).toHaveTextContent('생성일순');
    });
  });

  describe('접근성', () => {
    it('should have proper ARIA labels', () => {
      // When
      render(<PostsFilter />);

      // Then
      expect(screen.getByLabelText('포스트 검색')).toBeInTheDocument();
      expect(screen.getByLabelText('상태')).toBeInTheDocument();
      expect(screen.getByLabelText('정렬')).toBeInTheDocument();
    });
  });
});