'use client';

import { createContext, ReactNode, useCallback, useContext } from 'react';
import { toast } from 'sonner';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

interface ErrorContextType {
  showError: (error: Error | ApiError, options?: ErrorOptions) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  clearErrors: () => void;
}

interface ErrorOptions {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const showError = useCallback((error: Error | ApiError, options: ErrorOptions = {}) => {
    const apiError: ApiError = error instanceof Error
      ? { message: error.message }
      : error;

    const errorMessage = apiError.message || '알 수 없는 오류가 발생했습니다';
    
    // Toast로 에러 표시
    const toastOptions: any = {
      id: `error-${Date.now()}`,
      duration: options.duration || 5000,
    };

    if (apiError.status) {
      toastOptions.description = `상태 코드: ${apiError.status}`;
    }

    if (options.action) {
      toastOptions.action = {
        label: options.action.label,
        onClick: options.action.onClick,
      };
    }

    if (options.onDismiss) {
      toastOptions.onDismiss = options.onDismiss;
    }

    toast.error(errorMessage, toastOptions);

    // 콘솔에도 로깅
    console.error('🚨 API 에러:', {
      message: errorMessage,
      status: apiError.status,
      code: apiError.code,
      details: apiError.details,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    toast.info(message, {
      duration: 4000,
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message, {
      duration: 4000,
    });
  }, []);

  const clearErrors = useCallback(() => {
    toast.dismiss();
  }, []);

  const value: ErrorContextType = {
    showError,
    showSuccess,
    showInfo,
    showWarning,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// React Query 에러 핸들러 훅
export function useQueryErrorHandler() {
  const { showError } = useError();

  const handleError = useCallback((error: Error | ApiError, options?: ErrorOptions) => {
    showError(error, {
      title: '데이터 로딩 오류',
      action: {
        label: '다시 시도',
        onClick: () => window.location.reload(),
      },
      ...options,
    });
  }, [showError]);

  return { handleError };
}

// API 에러 핸들러 훅
export function useApiErrorHandler() {
  const { showError } = useError();

  const handleApiError = useCallback((error: Error | ApiError, options?: ErrorOptions) => {
    showError(error, {
      title: 'API 요청 오류',
      action: {
        label: '다시 시도',
        onClick: () => window.location.reload(),
      },
      ...options,
    });
  }, [showError]);

  return { handleApiError };
}
