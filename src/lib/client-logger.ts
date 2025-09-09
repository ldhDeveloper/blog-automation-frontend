// 클라이언트 사이드 로깅 유틸리티

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  meta?: any;
  userId?: string;
  sessionId?: string;
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private sessionId = this.generateSessionId();
  private userId: string | null = null;

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, meta?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context || 'UNKNOWN',
      meta,
      userId: this.userId || '',
      sessionId: this.sessionId,
    };
  }

  private log(level: LogLevel, message: string, context?: string, meta?: any) {
    const logEntry = this.createLogEntry(level, message, context, meta);
    
    // 개발 환경에서는 콘솔에 출력
    if (this.isDevelopment) {
      const emoji = {
        error: '❌',
        warn: '⚠️',
        info: 'ℹ️',
        debug: '🐛',
      }[level];
      
      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, {
        context,
        meta,
        timestamp: logEntry.timestamp,
      });
    }

    // 프로덕션에서는 서버로 전송
    if (!this.isDevelopment) {
      this.sendToServer(logEntry);
    }
  }

  private async sendToServer(logEntry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // 로그 전송 실패 시 콘솔에 출력
      console.error('Failed to send log to server:', error);
    }
  }

  error(message: string, context?: string, meta?: any) {
    this.log('error', message, context, meta);
  }

  warn(message: string, context?: string, meta?: any) {
    this.log('warn', message, context, meta);
  }

  info(message: string, context?: string, meta?: any) {
    this.log('info', message, context, meta);
  }

  debug(message: string, context?: string, meta?: any) {
    this.log('debug', message, context, meta);
  }

  // API 요청 로깅
  logApiRequest(method: string, url: string, status: number, duration: number, meta?: any) {
    const message = `${method} ${url} - ${status} (${duration}ms)`;
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    
    this.log(level, message, 'API_REQUEST', {
      method,
      url,
      status,
      duration,
      ...meta,
    });
  }

  // 사용자 액션 로깅
  logUserAction(action: string, meta?: any) {
    this.log('info', `User action: ${action}`, 'USER_ACTION', meta);
  }

  // 에러 로깅
  logError(error: Error, context?: string, meta?: any) {
    this.error(error.message, context, {
      stack: error.stack,
      name: error.name,
      ...meta,
    });
  }

  // 성능 로깅
  logPerformance(operation: string, duration: number, meta?: any) {
    const message = `Performance: ${operation} - ${duration}ms`;
    const level = duration > 1000 ? 'warn' : 'info';
    
    this.log(level, message, 'PERFORMANCE', {
      operation,
      duration,
      ...meta,
    });
  }

  // 폼 유효성 검사 로깅
  logFormValidation(formName: string, isValid: boolean, errors?: any) {
    const message = `Form validation: ${formName} - ${isValid ? 'valid' : 'invalid'}`;
    const level = isValid ? 'info' : 'warn';
    
    this.log(level, message, 'FORM_VALIDATION', {
      formName,
      isValid,
      errors,
    });
  }

  // 네비게이션 로깅
  logNavigation(from: string, to: string, meta?: any) {
    this.log('info', `Navigation: ${from} → ${to}`, 'NAVIGATION', meta);
  }
}

// 싱글톤 인스턴스 생성
export const clientLogger = new ClientLogger();

// 편의를 위한 직접 export
export const log = {
  error: (message: string, context?: string, meta?: any) => 
    clientLogger.error(message, context, meta),
  warn: (message: string, context?: string, meta?: any) => 
    clientLogger.warn(message, context, meta),
  info: (message: string, context?: string, meta?: any) => 
    clientLogger.info(message, context, meta),
  debug: (message: string, context?: string, meta?: any) => 
    clientLogger.debug(message, context, meta),
  api: (method: string, url: string, status: number, duration: number, meta?: any) =>
    clientLogger.logApiRequest(method, url, status, duration, meta),
  userAction: (action: string, meta?: any) =>
    clientLogger.logUserAction(action, meta),
  logError: (error: Error, context?: string, meta?: any) =>
    clientLogger.logError(error, context, meta),
  performance: (operation: string, duration: number, meta?: any) =>
    clientLogger.logPerformance(operation, duration, meta),
  formValidation: (formName: string, isValid: boolean, errors?: any) =>
    clientLogger.logFormValidation(formName, isValid, errors),
  navigation: (from: string, to: string, meta?: any) =>
    clientLogger.logNavigation(from, to, meta),
};

export default clientLogger;
