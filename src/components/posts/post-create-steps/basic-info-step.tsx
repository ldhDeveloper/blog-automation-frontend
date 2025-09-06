'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreatePostForm } from '@/schemas';
import { FileText, Hash, Tag } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface PostBasicInfoStepProps {
  form: UseFormReturn<CreatePostForm>;
}

export function PostBasicInfoStep({ form }: PostBasicInfoStepProps) {
  const { control, watch } = form;
  const title = watch('title');
  const topic = watch('topic');
  const keywords = watch('keywords');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">기본 정보 입력</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          포스트의 제목, 주제, 키워드를 입력해주세요
        </p>
      </div>

      <div className="grid gap-6">
        {/* 제목 입력 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              포스트 제목
            </CardTitle>
            <CardDescription>
              포스트의 제목을 입력해주세요 (최대 200자)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: React 18의 새로운 기능들"
                      {...field}
                      className="text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 mt-1">
                    {title?.length || 0} / 200자
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 주제 입력 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />
              포스트 주제
            </CardTitle>
            <CardDescription>
              포스트의 주요 주제나 카테고리를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주제 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: React, JavaScript, 웹 개발"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 mt-1">
                    {topic?.length || 0} / 100자
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 키워드 입력 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="h-4 w-4" />
              키워드
            </CardTitle>
            <CardDescription>
              SEO를 위한 키워드를 입력해주세요 (선택사항)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>키워드</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="예: React, JavaScript, 프론트엔드, 웹개발, 컴포넌트, 훅"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 mt-1">
                    {keywords?.length || 0} / 500자
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* 입력된 정보 미리보기 */}
      {(title || topic || keywords) && (
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-100">
              입력 정보 미리보기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {title && (
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">제목:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{title}</p>
              </div>
            )}
            {topic && (
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">주제:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{topic}</p>
              </div>
            )}
            {keywords && (
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">키워드:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{keywords}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
