import { useEffect, useState, useRef, useCallback } from 'react';

interface SSEOptions {
  enabled?: boolean;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  withCredentials?: boolean;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  eventHandlers?: Record<string, (event: Event) => void>;
}

interface SSEState {
  data: T | null;
  isConnected: boolean;
  error: Event | Error | null;
  reconnect: () => void;
}

export function useSSE(url: string, options: SSEOptions = {}): SSEState {
  const {
    enabled = true,
    autoReconnect = false,
    reconnectDelay = 1000,
    headers = {},
    withCredentials = true,
    onMessage,
    onError,
    onOpen,
    eventHandlers = {},
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | Error | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    try {
      // EventSource 옵션 설정
      const eventSourceOptions: EventSourceInit = {};
      if (withCredentials) {
        eventSourceOptions.withCredentials = withCredentials;
      }
      
      // 헤더는 EventSource에서 직접 지원하지 않으므로 URL에 포함하거나 서버 측에서 처리
      const eventSource = new EventSource(url, eventSourceOptions);
      eventSourceRef.current = eventSource;

      // 연결 성공
      eventSource.addEventListener('open', (event) => {
        setIsConnected(true);
        setError(null);
        onOpen?.(event);
      });

      // 메시지 수신
      eventSource.addEventListener('message', (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
          onMessage?.(parsedData);
        } catch (parseError) {
          const error = new Error(`Failed to parse SSE message: ${parseError}`);
          setError(error);
        }
      });

      // 에러 처리
      eventSource.addEventListener('error', (event) => {
        setIsConnected(false);
        setError(event);
        onError?.(event);

        // 자동 재연결
        if (autoReconnect && eventSource.readyState === EventSource.CLOSED) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      });

      // 커스텀 이벤트 핸들러 등록
      Object.entries(eventHandlers).forEach(([eventType, handler]) => {
        eventSource.addEventListener(eventType, handler);
      });

    } catch (error) {
      setError(error as Error);
      setIsConnected(false);
    }
  }, [url, enabled, withCredentials, onMessage, onError, onOpen, eventHandlers, autoReconnect, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  // 초기 연결 및 URL 변경 시 재연결
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, enabled, connect, disconnect]);

  return {
    data,
    isConnected,
    error,
    reconnect,
  };
}
