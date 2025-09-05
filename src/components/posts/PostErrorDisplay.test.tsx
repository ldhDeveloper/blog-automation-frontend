import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostErrorDisplay } from './PostErrorDisplay';
import type { TimelineEvent } from '@/types/api';

// 🔴 RED: 실패하는 테스트 작성

describe('PostErrorDisplay', () => {
  const mockTimelineEvent: TimelineEvent = {
    id: '1',
    postId: 'post-1',
    type: 'draft',
    status: 'failed',
    timestamp: '2024-01-01T00:00:00Z',
    message: 'Draft generation failed',
    error: 'API timeout: Content generation took too long',
    metadata: {
      retryCount: 2,
      lastRetry: '2024-01-01T00:05:00Z'
    }
  };

  describe('실패 메시지 표시', () => {
    it('should display error message when timeline event has error', () => {
      render(<PostErrorDisplay timelineEvent={mockTimelineEvent} />);
      
      expect(screen.getByText('실패 원인')).toBeInTheDocument();
      expect(screen.getByText('API timeout: Content generation took too long')).toBeInTheDocument();
    });

    it('should display retry count when available', () => {
      render(<PostErrorDisplay timelineEvent={mockTimelineEvent} />);
      
      expect(screen.getByText(/재시도 횟수: 2회/)).toBeInTheDocument();
    });

    it('should display last retry time when available', () => {
      render(<PostErrorDisplay timelineEvent={mockTimelineEvent} />);
      
      expect(screen.getByText(/마지막 재시도: 2024-01-01T00:05:00Z/)).toBeInTheDocument();
    });
  });

  describe('다양한 에러 타입 처리', () => {
    it('should display different error types appropriately', () => {
      const networkError: TimelineEvent = {
        ...mockTimelineEvent,
        error: 'Network error: Unable to connect to API server',
        type: 'image'
      };

      render(<PostErrorDisplay timelineEvent={networkError} />);
      
      expect(screen.getByText('Network error: Unable to connect to API server')).toBeInTheDocument();
    });

    it('should display generic message when no specific error provided', () => {
      const { error, ...noErrorMessage } = mockTimelineEvent;

      render(<PostErrorDisplay timelineEvent={noErrorMessage} />);
      
      expect(screen.getByText('알 수 없는 오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  describe('빈 상태 처리', () => {
    it('should not render anything when timeline event is not failed', () => {
      const successEvent: TimelineEvent = {
        ...mockTimelineEvent,
        status: 'completed'
      };

      const { container } = render(<PostErrorDisplay timelineEvent={successEvent} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render anything when timeline event is undefined', () => {
      const { container } = render(<PostErrorDisplay />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('접근성', () => {
    it('should have proper ARIA labels', () => {
      render(<PostErrorDisplay timelineEvent={mockTimelineEvent} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have appropriate semantic structure', () => {
      render(<PostErrorDisplay timelineEvent={mockTimelineEvent} />);
      
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toHaveClass('border-destructive');
    });
  });
});
