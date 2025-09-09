'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

interface ApiErrorDisplayProps {
  error: ApiError | Error | null;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ApiErrorDisplay({
  error,
  title = '오류가 발생했습니다',
  onRetry,
  onDismiss,
  showDetails = false,
  className = '',
}: ApiErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error.message;
  const errorStatus = 'status' in error ? error.status : undefined;
  const errorCode = 'code' in error ? error.code : undefined;

  const getStatusText = (status?: number) => {
    switch (status) {
      case 400:
        return '잘못된 요청';
      case 401:
        return '인증이 필요합니다';
      case 403:
        return '접근 권한이 없습니다';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다';
      case 409:
        return '데이터 충돌이 발생했습니다';
      case 422:
        return '입력 데이터가 올바르지 않습니다';
      case 429:
        return '요청 한도를 초과했습니다';
      case 500:
        return '서버 내부 오류';
      case 502:
        return '게이트웨이 오류';
      case 503:
        return '서비스를 사용할 수 없습니다';
      default:
        return '알 수 없는 오류';
    }
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{title}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-destructive/20"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <div>
          <p className="font-medium">{errorMessage}</p>
          {errorStatus && (
            <p className="text-sm text-muted-foreground">
              {getStatusText(errorStatus)} ({errorStatus})
            </p>
          )}
          {errorCode && (
            <p className="text-xs text-muted-foreground">코드: {errorCode}</p>
          )}
        </div>

        {showDetails && 'details' in error && error.details && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              상세 정보 보기
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}

        {onRetry && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              다시 시도
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// 간단한 에러 메시지만 표시하는 컴포넌트
export function SimpleErrorDisplay({
  message,
  onRetry,
  className = '',
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`rounded-md border border-destructive/50 bg-destructive/10 p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <p className="text-sm font-medium text-destructive">{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="ml-auto h-6 px-2 text-destructive hover:bg-destructive/20"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// 인라인 에러 메시지 컴포넌트
export function InlineErrorDisplay({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 text-sm text-destructive ${className}`}>
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  );
}
