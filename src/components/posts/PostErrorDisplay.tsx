import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import type { TimelineEvent } from '@/types/api';

// 🟢 GREEN: 테스트를 통과하는 최소한의 코드 작성

interface PostErrorDisplayProps {
  timelineEvent?: TimelineEvent;
}

export function PostErrorDisplay({ timelineEvent }: PostErrorDisplayProps) {
  // 실패 상태가 아니거나 이벤트가 없으면 렌더링하지 않음
  if (!timelineEvent || timelineEvent.status !== 'failed') {
    return null;
  }

  const errorMessage = timelineEvent.error || '알 수 없는 오류가 발생했습니다';
  const retryCount = timelineEvent.metadata?.retryCount as number;
  const lastRetry = timelineEvent.metadata?.lastRetry as string;

  return (
    <Alert variant="destructive" role="alert" className="border-destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <h4 className="font-medium text-destructive-foreground mb-2">
            실패 원인
          </h4>
          <p className="text-sm text-destructive-foreground/90">
            {errorMessage}
          </p>
        </div>

        {/* 재시도 정보 표시 */}
        {(retryCount !== undefined || lastRetry) && (
          <div className="flex flex-wrap gap-2">
            {retryCount !== undefined && (
              <Badge variant="outline" className="text-xs">
                재시도 횟수: {retryCount}회
              </Badge>
            )}
            {lastRetry && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                마지막 재시도: {lastRetry}
              </Badge>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
