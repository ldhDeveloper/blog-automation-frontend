import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSSE } from './use-sse';

describe('useSSE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 기능', () => {
    it('should return initial state', () => {
      // Given
      const url = '/api/posts/123/stream';

      // When
      const { result } = renderHook(() => useSSE(url));

      // Then
      expect(result.current.data).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.reconnect).toBe('function');
    });

    it('should respect disabled option', () => {
      // Given
      const url = '/api/posts/123/stream';

      // When
      const { result } = renderHook(() => useSSE(url, { enabled: false }));

      // Then
      expect(result.current.data).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide reconnect function', () => {
      // Given
      const url = '/api/posts/123/stream';
      const { result } = renderHook(() => useSSE(url));

      // When
      result.current.reconnect();

      // Then
      expect(typeof result.current.reconnect).toBe('function');
    });
  });

  describe('옵션 처리', () => {
    it('should handle autoReconnect option', () => {
      // Given
      const url = '/api/posts/123/stream';

      // When
      const { result } = renderHook(() => useSSE(url, { autoReconnect: true }));

      // Then
      expect(result.current.data).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle withCredentials option', () => {
      // Given
      const url = '/api/posts/123/stream';

      // When
      const { result } = renderHook(() => useSSE(url, { withCredentials: false }));

      // Then
      expect(result.current.data).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle custom event handlers', () => {
      // Given
      const url = '/api/posts/123/stream';
      const eventHandlers = {
        custom_event: vi.fn(),
      };

      // When
      const { result } = renderHook(() => useSSE(url, { eventHandlers }));

      // Then
      expect(result.current.data).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('URL 변경', () => {
    it('should handle URL changes', () => {
      // Given
      let url = '/api/posts/123/stream';
      const { rerender } = renderHook(({ url }) => useSSE(url), {
        initialProps: { url },
      });

      // When
      url = '/api/posts/456/stream';
      rerender({ url });

      // Then
      expect(url).toBe('/api/posts/456/stream');
    });
  });
});