'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 에러를 콘솔에 로깅
    console.error('🚨 글로벌 에러 발생:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 메인 에러 카드 */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">문제가 발생했습니다</h1>
            <p className="text-muted-foreground">
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>

        {/* 에러 정보 알림 */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>오류 정보</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message}
            {error.digest && (
              <span className="block text-xs mt-1 opacity-75">
                오류 ID: {error.digest}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* 상세 정보 토글 */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
          </Button>
          
          {showDetails && (
            <div className="bg-muted p-4 rounded-lg border">
              <h4 className="font-medium text-sm mb-2">스택 트레이스:</h4>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button onClick={reset} className="w-full" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              size="lg"
            >
              <X className="w-4 h-4 mr-2" />
              이전 페이지
            </Button>
          </div>
        </div>

        {/* 도움말 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>문제가 지속되면 관리자에게 문의해주세요.</p>
        </div>
      </div>
    </div>
  );
}
