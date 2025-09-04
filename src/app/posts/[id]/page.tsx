'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePost } from '@/hooks/use-api';
import { PostDetail } from '@/components/posts/PostDetail';
import { PostTimeline } from '@/components/posts/PostTimeline';
import { PostActions } from '@/components/posts/PostActions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const { data: postResponse, isLoading, error, refetch } = usePost(postId);
  const post = postResponse?.data;

  const handleBack = () => {
    router.push('/posts');
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"
          data-testid="loading-spinner"
        />
        <span className="ml-2 text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">{error.message || '포스트를 불러올 수 없습니다'}</p>
        <Button onClick={() => refetch()} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  // 포스트가 없는 경우
  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">포스트를 찾을 수 없습니다</p>
        <Button onClick={handleBack} variant="outline">
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6" role="main">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
          <h1 className="text-3xl font-bold">포스트 상세</h1>
        </div>
        <PostActions postId={postId} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 포스트 내용 */}
        <div className="lg:col-span-2" data-testid="post-content">
          <PostDetail postId={postId} />
        </div>

        {/* 사이드바 */}
        <div className="space-y-6" data-testid="post-sidebar">
          <PostTimeline postId={postId} />
        </div>
      </div>
    </main>
  );
}

export default function PostDetailPage() {
  return (
    <ProtectedRoute>
      <PostDetailContent />
    </ProtectedRoute>
  );
}
