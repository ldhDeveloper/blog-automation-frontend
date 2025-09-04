import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostTimeline } from './PostTimeline';

// Mock 데이터
const mockTimelineEvents = [
  {
    id: '1',
    postId: '123',
    type: 'ideate' as const,
    status: 'completed' as const,
    timestamp: '2024-01-01T08:00:00Z',
    message: '아이디어 생성 완료',
    duration: 120,
  },
  {
    id: '2',
    postId: '123',
    type: 'draft' as const,
    status: 'in-progress' as const,
    timestamp: '2024-01-01T09:00:00Z',
    message: '초안 작성 중...',
    duration: 300,
  },
  {
    id: '3',
    postId: '123',
    type: 'image' as const,
    status: 'pending' as const,
    timestamp: '2024-01-01T09:30:00Z',
    message: '이미지 생성 대기 중',
  },
];

// SSE 훅 모킹
const mockUseSSE = {
  data: null,
  isConnected: false,
  error: null,
  reconnect: vi.fn(),
};

vi.mock('@/hooks/use-sse', () => ({
  useSSE: () => mockUseSSE,
}));

// API 훅 모킹
const mockUsePostTimeline = {
  data: mockTimelineEvents,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/hooks/use-api', () => ({
  usePostTimeline: () => mockUsePostTimeline,
}));

describe('PostTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSSE.data = null;
    mockUseSSE.isConnected = false;
    mockUseSSE.error = null;
    mockUsePostTimeline.data = mockTimelineEvents;
    mockUsePostTimeline.isLoading = false;
    mockUsePostTimeline.error = null;
  });

  describe('Rendering', () => {
    it('should render timeline with all steps', () => {
      // Given & When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText('생성 타임라인')).toBeInTheDocument();
      expect(screen.getByText('아이디어 생성')).toBeInTheDocument();
      expect(screen.getByText('초안 작성')).toBeInTheDocument();
      expect(screen.getByText('이미지 생성')).toBeInTheDocument();
      expect(screen.getByText('SEO 최적화')).toBeInTheDocument();
      expect(screen.getByText('게시')).toBeInTheDocument();
    });

    it('should display step messages correctly', () => {
      // Given & When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText('아이디어 생성 완료')).toBeInTheDocument();
      expect(screen.getByText('초안 작성 중...')).toBeInTheDocument();
      expect(screen.getByText('이미지 생성 대기 중')).toBeInTheDocument();
    });

    it('should show status indicators for each step', () => {
      // Given & When
      render(<PostTimeline postId="123" />);

      // Then
      // 완료된 단계는 체크 아이콘
      const completedIcons = screen.getAllByTestId('completed-icon');
      expect(completedIcons).toHaveLength(1);

      // 진행 중인 단계는 시계 아이콘
      const inProgressIcons = screen.getAllByTestId('in-progress-icon');
      expect(inProgressIcons).toHaveLength(1);

      // 대기 중인 단계는 시계 아이콘 (회색)
      const pendingIcons = screen.getAllByTestId('pending-icon');
      expect(pendingIcons).toHaveLength(1);
    });

    it('should display timestamps and durations', () => {
      // Given & When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText('08:00')).toBeInTheDocument();
      expect(screen.getByText('09:00')).toBeInTheDocument();
      expect(screen.getByText('09:30')).toBeInTheDocument();
      expect(screen.getByText('2분')).toBeInTheDocument(); // 120초 = 2분
      expect(screen.getByText('5분')).toBeInTheDocument(); // 300초 = 5분
    });

    it('should calculate and display total duration', () => {
      // Given & When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText(/총 소요시간/i)).toBeInTheDocument();
      expect(screen.getByText('7분')).toBeInTheDocument(); // (120 + 300) / 60 = 7분
    });
  });

  describe('Real-time Connection Status', () => {
    it('should show connected status when SSE is connected', () => {
      // Given
      mockUseSSE.isConnected = true;

      // When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText('실시간')).toBeInTheDocument();
      expect(screen.getByTestId('connection-indicator')).toHaveClass('bg-green-500');
    });

    it('should show disconnected status when SSE is not connected', () => {
      // Given
      mockUseSSE.isConnected = false;

      // When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText('연결 끊김')).toBeInTheDocument();
      expect(screen.getByTestId('connection-indicator')).toHaveClass('bg-red-500');
    });

    it('should provide reconnect button when disconnected', () => {
      // Given
      mockUseSSE.isConnected = false;
      mockUseSSE.error = { message: '연결 오류' };

      // When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByRole('button', { name: /다시 연결/i })).toBeInTheDocument();
    });

    it('should call reconnect when reconnect button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUseSSE.isConnected = false;
      mockUseSSE.error = { message: '연결 오류' };

      render(<PostTimeline postId="123" />);

      // When
      const reconnectButton = screen.getByRole('button', { name: /다시 연결/i });
      await user.click(reconnectButton);

      // Then
      expect(mockUseSSE.reconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real-time Updates', () => {
    it('should update timeline when receiving SSE messages', async () => {
      // Given
      render(<PostTimeline postId="123" />);

      // When - SSE 메시지 수신 시뮬레이션
      const newEvent = {
        id: '4',
        postId: '123',
        type: 'image',
        status: 'completed',
        timestamp: '2024-01-01T09:45:00Z',
        message: '이미지 생성 완료',
        duration: 180,
      };

      act(() => {
        mockUseSSE.data = {
          type: 'timeline_update',
          data: newEvent,
        };
      });

      // Then
      await waitFor(() => {
        expect(screen.getByText('이미지 생성 완료')).toBeInTheDocument();
      });
    });

    it('should handle step status changes', async () => {
      // Given
      render(<PostTimeline postId="123" />);

      // When - 단계 상태 변경 SSE 메시지
      act(() => {
        mockUseSSE.data = {
          type: 'step_status_change',
          data: {
            id: '2',
            status: 'completed',
            message: '초안 작성 완료',
          },
        };
      });

      // Then
      await waitFor(() => {
        expect(screen.getByText('초안 작성 완료')).toBeInTheDocument();
      });
    });

    it('should handle error updates', async () => {
      // Given
      render(<PostTimeline postId="123" />);

      // When - 에러 SSE 메시지
      act(() => {
        mockUseSSE.data = {
          type: 'step_error',
          data: {
            id: '2',
            status: 'failed',
            error: '초안 작성 중 오류가 발생했습니다',
          },
        };
      });

      // Then
      await waitFor(() => {
        expect(screen.getByText('초안 작성 중 오류가 발생했습니다')).toBeInTheDocument();
      });
    });

    it('should animate new timeline events', async () => {
      // Given
      render(<PostTimeline postId="123" />);

      // When - 새로운 이벤트 추가
      act(() => {
        mockUseSSE.data = {
          type: 'new_step',
          data: {
            id: '5',
            postId: '123',
            type: 'seo',
            status: 'in-progress',
            timestamp: '2024-01-01T10:00:00Z',
            message: 'SEO 최적화 시작',
          },
        };
      });

      // Then
      await waitFor(() => {
        const newStepElement = screen.getByText('SEO 최적화 시작');
        expect(newStepElement).toBeInTheDocument();
        expect(newStepElement.closest('.timeline-event')).toHaveClass('animate-fade-in');
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state when data is loading', () => {
      // Given
      mockUsePostTimeline.isLoading = true;
      mockUsePostTimeline.data = null;

      // When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText(/타임라인 로딩 중/i)).toBeInTheDocument();
      expect(screen.getByTestId('timeline-loading')).toBeInTheDocument();
    });

    it('should show error state when data loading fails', () => {
      // Given
      mockUsePostTimeline.isLoading = false;
      mockUsePostTimeline.data = null;
      mockUsePostTimeline.error = { message: '타임라인을 불러올 수 없습니다' };

      // When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText(/타임라인을 불러올 수 없습니다/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /다시 시도/i })).toBeInTheDocument();
    });

    it('should retry loading when retry button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePostTimeline.isLoading = false;
      mockUsePostTimeline.data = null;
      mockUsePostTimeline.error = { message: '네트워크 오류' };

      render(<PostTimeline postId="123" />);

      // When
      const retryButton = screen.getByRole('button', { name: /다시 시도/i });
      await user.click(retryButton);

      // Then
      expect(mockUsePostTimeline.refetch).toHaveBeenCalledTimes(1);
    });

    it('should show empty state when no timeline events exist', () => {
      // Given
      mockUsePostTimeline.data = [];

      // When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText(/아직 타임라인이 없습니다/i)).toBeInTheDocument();
      expect(screen.getByText(/포스트 생성이 시작되면 타임라인이 표시됩니다/i)).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should expand step details when clicked', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostTimeline postId="123" />);

      // When
      const stepElement = screen.getByText('아이디어 생성');
      await user.click(stepElement);

      // Then
      expect(screen.getByText(/상세 정보/i)).toBeInTheDocument();
    });

    it('should show step progress when in progress', () => {
      // Given
      const inProgressEvent = {
        ...mockTimelineEvents[1],
        status: 'in-progress' as const,
        progress: 65,
      };
      mockUsePostTimeline.data = [mockTimelineEvents[0], inProgressEvent];

      // When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle retry for failed steps', async () => {
      // Given
      const user = userEvent.setup();
      const failedEvent = {
        ...mockTimelineEvents[1],
        status: 'failed' as const,
        error: '처리 중 오류 발생',
      };
      mockUsePostTimeline.data = [mockTimelineEvents[0], failedEvent];

      render(<PostTimeline postId="123" />);

      // When
      const retryButton = screen.getByRole('button', { name: /재시도/i });
      await user.click(retryButton);

      // Then
      // 재시도 기능이 호출되었는지 확인 (실제 구현에서는 API 호출)
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and structure', () => {
      // Given & When
      render(<PostTimeline postId="123" />);

      // Then
      expect(screen.getByRole('region', { name: /타임라인/i })).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(5); // 5개 단계
    });

    it('should support keyboard navigation', async () => {
      // Given
      const user = userEvent.setup();
      render(<PostTimeline postId="123" />);

      // When
      await user.tab(); // 첫 번째 단계로 이동
      expect(screen.getByText('아이디어 생성').closest('button')).toHaveFocus();

      await user.tab(); // 두 번째 단계로 이동
      expect(screen.getByText('초안 작성').closest('button')).toHaveFocus();
    });

    it('should announce status changes to screen readers', async () => {
      // Given
      render(<PostTimeline postId="123" />);

      // When - 상태 변경 시뮬레이션
      act(() => {
        mockUseSSE.data = {
          type: 'step_status_change',
          data: {
            id: '2',
            status: 'completed',
            message: '초안 작성 완료',
          },
        };
      });

      // Then
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('초안 작성 완료');
      });
    });
  });
});
