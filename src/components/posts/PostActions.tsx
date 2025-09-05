'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeletePost, useRetryPost } from '@/hooks/use-api';
import { toast } from 'sonner';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  RotateCcw, 
  Copy, 
  Share,
  Download,
  ExternalLink
} from 'lucide-react';
import { usePost } from '@/hooks/use-api';

interface PostActionsProps {
  postId: string;
}

export function PostActions({ postId }: PostActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: postResponse } = usePost(postId);
  const post = postResponse?.data;
  
  const deletePost = useDeletePost();
  const retryPost = useRetryPost();

  const handleEdit = () => {
    router.push(`/posts/${postId}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('포스트가 삭제되었습니다');
      router.push('/posts');
    } catch {
      toast.error('포스트 삭제에 실패했습니다');
    }
  };

  const handleRetry = async () => {
    try {
      await retryPost.mutateAsync(postId);
      toast.success('포스트 재생성을 시작했습니다');
    } catch {
      toast.error('재시도에 실패했습니다');
    }
  };

  const handleCopy = async () => {
    if (!post?.content) return;
    try {
      await navigator.clipboard.writeText(post.content);
      toast.success('내용이 클립보드에 복사되었습니다');
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('링크가 클립보드에 복사되었습니다');
    } catch {
      toast.error('공유 링크 복사에 실패했습니다');
    }
  };

  const handleDownload = () => {
    if (!post?.content || !post?.title) return;
    const element = document.createElement('a');
    const file = new Blob([post.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${post.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('파일이 다운로드되었습니다');
  };

  const handleViewPublished = () => {
    // TODO: 실제 게시된 URL로 이동 (현재는 임시)
    window.open(`/published/${postId}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2" aria-label="포스트 작업">
      {/* 편집 버튼 */}
      <Button onClick={handleEdit} variant="outline" size="sm">
        <Edit className="h-4 w-4 mr-2" />
        편집
      </Button>

      {/* 재시도 버튼 (실패한 포스트인 경우) */}
      {post?.status === 'failed' && (
        <Button 
          onClick={handleRetry} 
          variant="outline" 
          size="sm"
          disabled={retryPost.isPending}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          재시도
        </Button>
      )}

      {/* 더보기 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">더 많은 작업</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            내용 복사
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            링크 공유
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            파일 다운로드
          </DropdownMenuItem>

          {post?.status === 'published' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewPublished}>
                <ExternalLink className="h-4 w-4 mr-2" />
                게시글 보기
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>포스트 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletePost.isPending ? '삭제 중...' : '확인'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
