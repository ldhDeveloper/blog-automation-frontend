'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQueryErrorHandler } from '@/contexts/error-context';
import { usePosts } from '@/hooks/use-api';
import type { Post } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const statusMap = {
  draft: { label: '초안', variant: 'secondary' as const },
  generating: { label: '생성 중', variant: 'default' as const },
  ready: { label: '준비됨', variant: 'outline' as const },
  published: { label: '게시됨', variant: 'default' as const },
  failed: { label: '실패', variant: 'destructive' as const },
};

export function PostsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleError } = useQueryErrorHandler();
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'createdAt';

  const { data, isLoading, error } = usePosts({
    page: currentPage,
    limit,
    status,
    search,
    sort,
  });

  // 에러 처리
  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/posts?${params.toString()}`);
  };

  const handlePostClick = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  const handleEditPost = (postId: string) => {
    router.push(`/posts/${postId}/edit`);
  };

  const handleDeletePost = (postId: string) => {
    // TODO: 삭제 확인 모달 구현
    console.log('Delete post:', postId);
  };

  const handleRetryPost = (postId: string) => {
    // TODO: 재시도 기능 구현
    console.log('Retry post:', postId);
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

  // 빈 상태
  if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">아직 생성된 포스트가 없습니다</p>
        <p className="text-sm text-muted-foreground">첫 번째 포스트를 생성해보세요</p>
        <Button onClick={() => router.push('/posts/create')}>
          새 포스트 생성
        </Button>
      </div>
    );
  }

  const posts = data.data;
  const pagination = data.pagination || { 
    page: currentPage, 
    totalPages: 1, 
    total: posts.length, 
    limit 
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table aria-label="포스트 목록">
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>채널</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead>수정일</TableHead>
              <TableHead className="w-[70px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post: Post) => (
              <TableRow key={post.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <button
                    onClick={() => handlePostClick(post.id)}
                    className="text-left hover:underline font-medium"
                  >
                    {post.title}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={statusMap[post.status as keyof typeof statusMap]?.variant || 'secondary'}>
                    {statusMap[post.status as keyof typeof statusMap]?.label || post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {post.channelId}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { 
                    addSuffix: true, 
                    locale: ko 
                  })}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(post.updatedAt), { 
                    addSuffix: true, 
                    locale: ko 
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">메뉴 열기</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePostClick(post.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        보기
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditPost(post.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        편집
                      </DropdownMenuItem>
                      {post.status === 'failed' && (
                        <DropdownMenuItem onClick={() => handleRetryPost(post.id)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          재시도
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <nav className="flex items-center justify-between" aria-label="페이지네이션">
          <p className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages} 페이지
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="다음 페이지"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
