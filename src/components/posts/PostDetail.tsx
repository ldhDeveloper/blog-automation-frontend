'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, FileText, Target, Calendar, Tag } from 'lucide-react';
import { usePost, usePostTimeline } from '@/hooks/use-api';
import { PostErrorDisplay } from './PostErrorDisplay';

interface PostDetailProps {
  postId: string;
}

const statusMap = {
  draft: { label: '초안', variant: 'secondary' as const },
  generating: { label: '생성 중', variant: 'default' as const },
  ready: { label: '준비됨', variant: 'outline' as const },
  published: { label: '게시됨', variant: 'default' as const },
  failed: { label: '실패', variant: 'destructive' as const },
};

export function PostDetail({ postId }: PostDetailProps) {
  const { data: postResponse, isLoading, error } = usePost(postId);
  const { data: timelineResponse } = usePostTimeline(postId);
  const post = postResponse?.data;
  const timelineEvents = timelineResponse?.data || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2 text-muted-foreground">로딩 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-destructive">{error.message || '포스트를 불러올 수 없습니다'}</p>
        </CardContent>
      </Card>
    );
  }

  if (!post) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-muted-foreground">포스트를 찾을 수 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <article className="space-y-6" role="article">
      {/* 포스트 헤더 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={statusMap[post.status as keyof typeof statusMap]?.variant || 'secondary'}>
            {statusMap[post.status as keyof typeof statusMap]?.label || post.status}
          </Badge>
          {post.publishedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>게시일: {format(new Date(post.publishedAt), 'yyyy-MM-dd HH:mm', { locale: ko })}</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold leading-tight">{post.title}</h2>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>생성일: {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
          <span>수정일: {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true, locale: ko })}</span>
        </div>
      </div>

      {/* 실패 원인 표시 (실패한 포스트인 경우) */}
      {post.status === 'failed' && (() => {
        const failedEvent = timelineEvents.find(event => event.status === 'failed');
        return failedEvent ? <PostErrorDisplay timelineEvent={failedEvent} /> : null;
      })()}

      <Separator />

      {/* 포스트 메타데이터 */}
      {post.metadata && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">메타데이터</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {post.metadata.readTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">읽기 시간</p>
                    <p className="text-sm text-muted-foreground">{post.metadata.readTime}분</p>
                  </div>
                </div>
              )}
              
              {post.metadata.wordCount && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">단어 수</p>
                    <p className="text-sm text-muted-foreground">{post.metadata.wordCount}개</p>
                  </div>
                </div>
              )}
              
              {post.metadata.seoScore && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">SEO 점수</p>
                    <p className="text-sm text-muted-foreground">{post.metadata.seoScore}점</p>
                  </div>
                </div>
              )}
              
              {post.metadata.tags && post.metadata.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">태그</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* 포스트 내용 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">내용</h3>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {/* 단순 텍스트로 표시 (향후 마크다운 렌더러로 교체 가능) */}
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
