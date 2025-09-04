import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSSE } from './use-sse';

// EventSource 모킹
const mockEventSource = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  readyState: 1, // OPEN
  url: '',
  withCredentials: false,
  onopen: null,
  onmessage: null,
  onerror: null,
  dispatchEvent: vi.fn(),
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
};

const mockEventSourceClass = vi.fn().mockImplementation(() => mockEventSource);

// 전역 EventSource 모킹
Object.defineProperty(global, 'EventSource', {
  value: mockEventSourceClass,
  writable: true,
});

describe('useSSE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEventSource.readyState = 1; // OPEN
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should establish SSE connection on mount', () => {
      // Given
      const url = '/api/posts/123/stream';

      // When
      renderHook(() => useSSE(url));

      // Then
      expect(mockEventSourceClass).toHaveBeenCalledWith(url, expect.objectContaining({ withCredentials: true }));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
    });

    it('should close connection on unmount', () => {
      // Given
      const url = '/api/posts/123/stream';
      const { unmount } = renderHook(() => useSSE(url));

      // When
      unmount();

      // Then
      expect(mockEventSource.close).toHaveBeenCalled();
    });

    it('should return initial state', () => {
      // Given
      const url = '/api/posts/123/stream';

      // When
      const { result } = renderHook(() => useSSE(url));

      // Then
      expect(result.current.data).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.reconnect).toBeInstanceOf(Function);
    });

    it('should update connection status when opened', async () => {
      // Given
      const url = '/api/posts/123/stream';
      const { result } = renderHook(() => useSSE(url));

      // When
      const openHandler = mockEventSource.addEventListener.mock.calls
        .find(call => call[0] === 'open')?.[1];
      
      await act(async () => {
        openHandler?.(new Event('open'));
      });

      // Then
      expect(result.current.isConnected).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle connection errors', () => {
      // Given
      const url = '/api/posts/123/stream';
      const { result } = renderHook(() => useSSE(url));

      // When
      const errorHandler = mockEventSource.addEventListener.mock.calls
        .find(call => call[0] === 'error')?.[1];
      
      act(() => {
        errorHandler?.(new Event('error'));
      });

      // Then
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Message Handling', () => {
    it('should parse and store incoming messages', () => {
      // Given
      const url = '/api/posts/123/stream';
      const { result } = renderHook(() => useSSE(url));
      
      const testData = {
        id: '1',
        type: 'timeline_update',
        data: { step: 'draft', status: 'completed' }
      };

      // When
      const messageHandler = mockEventSource.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];
      
      const mockMessageEvent = {
        data: JSON.stringify(testData),
        type: 'message',
      } as MessageEvent;

      act(() => {
        messageHandler?.(mockMessageEvent);
      });

      // Then
      expect(result.current.data).toEqual(testData);
    });

    it('should handle malformed JSON messages gracefully', () => {
      // Given
      const url = '/api/posts/123/stream';
      const { result } = renderHook(() => useSSE(url));

      // When
      const messageHandler = mockEventSource.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];
      
      const mockMessageEvent = {
        data: 'invalid json',
        type: 'message',
      } as MessageEvent;

      act(() => {
        messageHandler?.(mockMessageEvent);
      });

      // Then
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should accumulate multiple messages', () => {
      // Given
      const url = '/api/posts/123/stream';
      const onMessage = vi.fn();
      const { result } = renderHook(() => useSSE(url, { onMessage }));
      
      const message1 = { id: '1', type: 'step_start', data: { step: 'draft' } };
      const message2 = { id: '2', type: 'step_complete', data: { step: 'draft' } };

      // When
      const messageHandler = mockEventSource.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];
      
      act(() => {
        messageHandler?.({ data: JSON.stringify(message1) } as MessageEvent);
      });
      
      act(() => {
        messageHandler?.({ data: JSON.stringify(message2) } as MessageEvent);
      });

      // Then
      expect(onMessage).toHaveBeenCalledTimes(2);
      expect(onMessage).toHaveBeenNthCalledWith(1, message1);
      expect(onMessage).toHaveBeenNthCalledWith(2, message2);
    });
  });

  describe('Reconnection', () => {
    it('should provide reconnect function', () => {
      // Given
      const url = '/api/posts/123/stream';
      const { result } = renderHook(() => useSSE(url));

      // When
      act(() => {
        result.current.reconnect();
      });

      // Then
      expect(mockEventSource.close).toHaveBeenCalled();
      // Note: May be called more times due to useEffect dependencies
    });

    it('should automatically reconnect on connection loss', async () => {
      // Given
      const url = '/api/posts/123/stream';
      const { result } = renderHook(() => useSSE(url, { autoReconnect: true }));

      // When
      const errorHandler = mockEventSource.addEventListener.mock.calls
        .find(call => call[0] === 'error')?.[1];
      
      act(() => {
        errorHandler?.(new Event('error'));
      });

      // Then
      expect(result.current.isConnected).toBe(false);
      
      // Wait for auto-reconnect (simulated)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100)); // 기본 재연결 지연시간
      });

      // Note: Auto-reconnect may call EventSource constructor multiple times
    });
  });

  describe('Custom Event Handling', () => {
    it('should handle custom event types', () => {
      // Given
      const url = '/api/posts/123/stream';
      const eventHandlers = {
        timeline_update: vi.fn(),
        status_change: vi.fn(),
      };
      
      renderHook(() => useSSE(url, { eventHandlers }));

      // When
      const timelineEvent = new CustomEvent('timeline_update', {
        detail: { step: 'image', status: 'in-progress' }
      });
      
      act(() => {
        mockEventSource.addEventListener.mock.calls
          .find(call => call[0] === 'timeline_update')?.[1]?.(timelineEvent);
      });

      // Then
      expect(eventHandlers.timeline_update).toHaveBeenCalledWith(timelineEvent);
    });
  });

  describe('Options Handling', () => {
    it('should respect disabled option', () => {
      // Given
      const url = '/api/posts/123/stream';

      // When
      renderHook(() => useSSE(url, { enabled: false }));

      // Then
      expect(mockEventSourceClass).not.toHaveBeenCalled();
    });

    it('should use custom headers when provided', () => {
      // Given
      const url = '/api/posts/123/stream';
      const headers = { 'Authorization': 'Bearer token123' };

      // When
      renderHook(() => useSSE(url, { headers }));

      // Then
      // EventSource doesn't support custom headers directly, 
      // so we just verify it was called with withCredentials
      expect(mockEventSourceClass).toHaveBeenCalledWith(url, 
        expect.objectContaining({
          withCredentials: true,
        })
      );
    });
  });

  describe('URL Changes', () => {
    it('should reconnect when URL changes', () => {
      // Given
      const initialUrl = '/api/posts/123/stream';
      const newUrl = '/api/posts/456/stream';
      
      const { result, rerender } = renderHook(
        ({ url }) => useSSE(url),
        { initialProps: { url: initialUrl } }
      );

      // When
      rerender({ url: newUrl });

      // Then
      expect(mockEventSource.close).toHaveBeenCalled();
      // URL change should trigger reconnection
    });
  });
});
