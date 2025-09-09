import { clientLogger } from '@/lib/client-logger';
import { useCallback, useRef } from 'react';

// 로깅을 위한 React Hook
export function useLogger(context?: string) {
  // 로깅 헬퍼 함수들을 개별적으로 메모이제이션
  const error = useCallback((message: string, meta?: any) => {
    clientLogger.error(message, context, meta);
  }, [context]);

  const warn = useCallback((message: string, meta?: any) => {
    clientLogger.warn(message, context, meta);
  }, [context]);

  const info = useCallback((message: string, meta?: any) => {
    clientLogger.info(message, context, meta);
  }, [context]);

  const debug = useCallback((message: string, meta?: any) => {
    clientLogger.debug(message, context, meta);
  }, [context]);

  const api = useCallback((method: string, url: string, status: number, duration: number, meta?: any) => {
    clientLogger.logApiRequest(method, url, status, duration, meta);
  }, []);

  const userAction = useCallback((action: string, meta?: any) => {
    clientLogger.logUserAction(action, meta);
  }, []);

  const performance = useCallback((operation: string, duration: number, meta?: any) => {
    clientLogger.logPerformance(operation, duration, meta);
  }, []);

  const formValidation = useCallback((formName: string, isValid: boolean, errors?: any) => {
    clientLogger.logFormValidation(formName, isValid, errors);
  }, []);

  const log = {
    error,
    warn,
    info,
    debug,
    api,
    userAction,
    performance,
    formValidation,
  };

  // 네비게이션 로깅은 각 페이지에서 수동으로 처리

  return log;
}

// 성능 측정을 위한 Hook
export function usePerformanceLogger(operation: string) {
  const startTimeRef = useRef<number>(0);
  const logger = useLogger('PERFORMANCE');

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    logger.debug(`Started: ${operation}`);
  }, [operation, logger]);

  const end = useCallback((meta?: any) => {
    const duration = Date.now() - startTimeRef.current;
    logger.performance(operation, duration, meta);
  }, [operation, logger]);

  const measure = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    start();
    try {
      const result = await fn();
      end({ success: true });
      return result;
    } catch (error) {
      end({ success: false, error });
      throw error;
    }
  }, [start, end]);

  return { start, end, measure };
}

// 에러 바운더리를 위한 로깅 Hook
export function useErrorLogger() {
  const logger = useLogger('ERROR_BOUNDARY');

  const logError = useCallback((error: Error, errorInfo?: any) => {
    logger.error('Error boundary caught error', {
      message: error.message,
      stack: error.stack,
      errorInfo,
    });
  }, [logger]);

  return { logError };
}

// 폼 로깅을 위한 Hook
export function useFormLogger(formName: string) {
  const logger = useLogger('FORM');

  const logValidation = useCallback((isValid: boolean, errors?: any) => {
    logger.formValidation(formName, isValid, errors);
  }, [formName, logger]);

  const logSubmit = useCallback((data: any) => {
    logger.userAction(`Form submit: ${formName}`, { data });
  }, [formName, logger]);

  const logFieldChange = useCallback((fieldName: string, value: any) => {
    logger.debug(`Field change: ${formName}.${fieldName}`, { fieldName, value });
  }, [formName, logger]);

  return { logValidation, logSubmit, logFieldChange };
}

// API 요청 로깅을 위한 Hook
export function useApiLogger() {
  const logger = useLogger('API');

  const logRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    method: string,
    url: string
  ): Promise<T> => {
    const startTime = Date.now();
    
    try {
      const result = await requestFn();
      const duration = Date.now() - startTime;
      logger.api(method, url, 200, duration, { success: true });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const status = error.status || 500;
      logger.api(method, url, status, duration, { 
        success: false, 
        error: error.message 
      });
      throw error;
    }
  }, [logger]);

  return { logRequest };
}
