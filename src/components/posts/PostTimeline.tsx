'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Lightbulb,
  FileText,
  Image,
  Search,
  Globe,
  RefreshCw
} from 'lucide-react';
import { useSSE } from '@/hooks/use-sse';
import { usePostTimeline } from '@/hooks/use-api';

interface SSEMessage {
  type: 'timeline_update' | 'step_status_change';
  data: TimelineEvent;
}

interface TimelineEvent {
  id: string;
  type: 'ideate' | 'draft' | 'image' | 'seo' | 'publish';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: string;
  message: string;
  duration?: number; // 초 단위
  error?: string;
}

interface PostTimelineProps {
  postId: string;
}

const stepIcons = {
  ideate: Lightbulb,
  draft: FileText,
  image: Image,
  seo: Search,
  publish: Globe,
};

const stepLabels = {
  ideate: '아이디어 생성',
  draft: '초안 작성',
  image: '이미지 생성',
  seo: 'SEO 최적화',
  publish: '게시',
};

const statusIcons = {
  pending: Clock,
  'in-progress': Clock,
  completed: CheckCircle,
  failed: XCircle,
};

const statusColors = {
  pending: 'text-muted-foreground',
  'in-progress': 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

export function PostTimeline({ postId }: PostTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // API에서 초기 타임라인 데이터 가져오기
  const { 
    data: timelineData, 
    isLoading, 
    error: timelineError, 
    refetch 
  } = usePostTimeline(postId);

  // SSE 연결 (실시간 업데이트)
  const { 
    data: sseData, 
    isConnected, 
    error: sseError, 
    reconnect 
  } = useSSE<SSEMessage>(`/api/posts/${postId}/stream`, {
    enabled: !!postId,
    autoReconnect: true,
    onMessage: (data) => {
      // SSE 메시지 수신 시 타임라인 업데이트
      if (data && typeof data === 'object' && 'type' in data && data.type === 'timeline_update') {
        const message = data as SSEMessage;
        setTimeline(prev => {
          const updated = [...prev];
          const index = updated.findIndex(item => item.id === message.data.id);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...message.data };
          } else {
            updated.push(message.data);
          }
          return updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
      }
    },
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (timelineData?.data && Array.isArray(timelineData.data)) {
      setTimeline(timelineData.data);
    }
  }, [timelineData]);

  // 총 소요시간 계산
  const totalDuration = timeline.reduce((sum, event) => sum + (event.duration || 0), 0);
  const totalMinutes = Math.round(totalDuration / 60);

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes}분`;
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: ko });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">생성 타임라인</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8" data-testid="timeline-loading">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">타임라인 로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (timelineError) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">생성 타임라인</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive text-center">
              {timelineError.message || '타임라인을 불러올 수 없습니다'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 빈 상태
  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">생성 타임라인</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">아직 타임라인이 없습니다</p>
            <p className="text-xs text-muted-foreground">포스트 생성이 시작되면 타임라인이 표시됩니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">생성 타임라인</h3>
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              data-testid="connection-indicator"
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? '실시간' : '연결 끊김'}
            </span>
            {sseError && (
              <Button onClick={reconnect} variant="ghost" size="sm" className="text-xs">
                다시 연결
              </Button>
            )}
          </div>
        </div>
        {totalDuration > 0 && (
          <div className="text-sm text-muted-foreground">
            총 소요시간: <span className="font-medium">{totalMinutes}분</span>
          </div>
        )}
      </CardHeader>
      <CardContent role="region" aria-label="타임라인">
        <ul className="space-y-4" role="list">
          {timeline.map((event, index) => {
            const StepIcon = stepIcons[event.type];
            const StatusIcon = statusIcons[event.status];
            const isLast = index === timeline.length - 1;

            return (
              <li key={event.id} className="relative timeline-event" role="listitem">
                {/* 연결선 */}
                {!isLast && (
                  <div className="absolute left-4 top-8 w-0.5 h-8 bg-border" />
                )}

                <button className="flex items-start gap-3 w-full text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                  {/* 아이콘 */}
                  <div className="relative">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <StatusIcon 
                        className={`h-4 w-4 ${statusColors[event.status]}`}
                        data-testid={`${event.status}-icon`}
                      />
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {stepLabels[event.type]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.message}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{formatTime(event.timestamp)}</p>
                        {event.duration && (
                          <p>{formatDuration(event.duration)}</p>
                        )}
                      </div>
                    </div>

                    {/* 에러 메시지 */}
                    {event.status === 'failed' && event.error && (
                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span>{event.error}</span>
                        </div>
                      </div>
                    )}

                    {/* 진행 중 표시 */}
                    {event.status === 'in-progress' && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          진행 중...
                        </Badge>
                      </div>
                    )}

                    {/* 실패한 단계 재시도 버튼 */}
                    {event.status === 'failed' && (
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: 재시도 로직 구현
                            console.log('Retry step:', event.type);
                          }}
                        >
                          재시도
                        </Button>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* 실시간 업데이트 상태 알림 */}
        <div className="sr-only" role="status" aria-live="polite">
          {sseData?.type === 'step_status_change' && sseData.data?.message}
        </div>
      </CardContent>
    </Card>
  );
}
