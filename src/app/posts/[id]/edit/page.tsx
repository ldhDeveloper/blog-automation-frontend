'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePost, useUpdatePost } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, X } from 'lucide-react';

// 편집 폼 스키마
const editPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이하로 입력해주세요'),
  content: z
    .string()
    .min(1, '내용을 입력해주세요')
    .max(10000, '내용은 10000자 이하로 입력해주세요'),
});

type EditPostFormData = z.infer<typeof editPostSchema>;

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { data: postResponse, isLoading, error, refetch } = usePost(postId);
  const updatePost = useUpdatePost();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditPostFormData>({
    resolver: zodResolver(editPostSchema),
  });

  const post = postResponse?.data;

  // 포스트 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (post) {
      reset({
        title: post.title || '',
        content: post.content || '',
      });
    }
  }, [post, reset]);

  const onSubmit = async (data: EditPostFormData) => {
    try {
      await updatePost.mutateAsync({
        id: postId,
        data: {
          title: data.title,
          content: data.content,
        },
      });
      
      toast.success('포스트가 수정되었습니다');
      router.push(`/posts/${postId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포스트 수정에 실패했습니다';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>
              {error.message || '포스트를 불러올 수 없습니다'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline">
                다시 시도
              </Button>
              <Button onClick={handleCancel} variant="ghost">
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 포스트가 없는 경우
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>포스트를 찾을 수 없습니다</CardTitle>
            <CardDescription>
              요청하신 포스트가 존재하지 않거나 삭제되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCancel} className="w-full">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
            <h1 className="text-3xl font-bold">포스트 편집</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            포스트의 제목과 내용을 수정할 수 있습니다.
          </p>
        </div>

        {/* 편집 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>포스트 정보</CardTitle>
            <CardDescription>
              포스트의 기본 정보를 수정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 제목 입력 */}
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  placeholder="포스트 제목을 입력하세요"
                  {...register('title')}
                  className={errors.title ? 'border-red-300' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* 내용 입력 */}
              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  placeholder="포스트 내용을 입력하세요"
                  rows={12}
                  {...register('content')}
                  className={errors.content ? 'border-red-300' : ''}
                />
                {errors.content && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* 업데이트 에러 표시 */}
              {updatePost.error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                  {updatePost.error.message || '포스트 수정에 실패했습니다'}
                </div>
              )}

              {/* 버튼 그룹 */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updatePost.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={updatePost.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updatePost.isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
