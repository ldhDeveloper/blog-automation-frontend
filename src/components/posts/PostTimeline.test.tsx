import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostTimeline } from './PostTimeline';
import type { TimelineEvent } from '@/types/api';

// 🟢 GREEN: 실제 PostTimeline 컴포넌트 구현에 맞는 간단한 테스트

// Mock API hooks
vi.mock('@/hooks/use-api', () => ({
  usePostTimeline: vi.fn(),
}));

vi.mock('@/hooks/use-sse', () => ({
  useSSE: vi.fn(),
}));

// Mock 타임라인 데이터
const mockTimelineData: TimelineEvent[] = [
  {
    id: '1',
    postId: 'post-123',
    type: 'ideate',
    status: 'completed',
    timestamp: '2024-01-01T09:00:00Z',
    message: '아이디어 생성 완료',
    duration: 60,
  },
  {
    id: '2',
    postId: 'post-123',
    type: 'draft',
    status: 'in-progress',
    timestamp: '2024-01-01T09:05:00Z',
    message: '초안 작성 중',
  },
];

describe('PostTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('should render timeline header', async () => {
      // Given
      const { usePostTimeline } = await import('@/hooks/use-api');
      const { useSSE } = await import('@/hooks/use-sse');
      
      vi.mocked(usePostTimeline).mockReturnValue({
        data: { data: mockTimelineData },
        isLoading: false,
        error: null,
      } as any);
      
      vi.mocked(useSSE).mockReturnValue({
        data: null,
        isConnected: true,
        error: null,
        reconnect: vi.fn(),
      } as any);

      // When
      render(<PostTimeline postId="post-123" />);

      // Then
      expect(screen.getByText('생성 타임라인')).toBeInTheDocument();
    });

    it('should show empty state when no timeline data', async () => {
      // Given
      const { usePostTimeline } = await import('@/hooks/use-api');
      const { useSSE } = await import('@/hooks/use-sse');
      
      vi.mocked(usePostTimeline).mockReturnValue({
        data: { data: [] },
        isLoading: false,
        error: null,
      } as any);
      
      vi.mocked(useSSE).mockReturnValue({
        data: null,
        isConnected: true,
        error: null,
        reconnect: vi.fn(),
      } as any);

      // When
      render(<PostTimeline postId="post-123" />);

      // Then
      expect(screen.getByText('아직 타임라인이 없습니다')).toBeInTheDocument();
      expect(screen.getByText('포스트 생성이 시작되면 타임라인이 표시됩니다')).toBeInTheDocument();
    });
  });

  describe('로딩 및 에러 상태', () => {
    it('should show loading state', async () => {
      // Given
      const { usePostTimeline } = await import('@/hooks/use-api');
      const { useSSE } = await import('@/hooks/use-sse');
      
      vi.mocked(usePostTimeline).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);
      
      vi.mocked(useSSE).mockReturnValue({
        data: null,
        isConnected: true,
        error: null,
        reconnect: vi.fn(),
      } as any);

      // When
      render(<PostTimeline postId="post-123" />);

      // Then
      expect(screen.getByText('타임라인 로딩 중...')).toBeInTheDocument();
    });

    it('should show error state', async () => {
      // Given
      const { usePostTimeline } = await import('@/hooks/use-api');
      const { useSSE } = await import('@/hooks/use-sse');
      
      vi.mocked(usePostTimeline).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API Error'),
      } as any);
      
      vi.mocked(useSSE).mockReturnValue({
        data: null,
        isConnected: true,
        error: null,
        reconnect: vi.fn(),
      } as any);

      // When
      render(<PostTimeline postId="post-123" />);

      // Then
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  describe('타임라인 이벤트 표시', () => {
    it('should display timeline events when data is available', async () => {
      // Given
      const { usePostTimeline } = await import('@/hooks/use-api');
      const { useSSE } = await import('@/hooks/use-sse');
      
      vi.mocked(usePostTimeline).mockReturnValue({
        data: { data: mockTimelineData },
        isLoading: false,
        error: null,
      } as any);
      
      vi.mocked(useSSE).mockReturnValue({
        data: null,
        isConnected: true,
        error: null,
        reconnect: vi.fn(),
      } as any);

      // When
      render(<PostTimeline postId="post-123" />);

      // Then
      expect(screen.getByText('아이디어 생성')).toBeInTheDocument();
      expect(screen.getByText('초안 작성')).toBeInTheDocument();
    });
  });
});
