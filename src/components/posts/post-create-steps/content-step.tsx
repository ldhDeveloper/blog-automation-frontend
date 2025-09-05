'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CreatePostForm } from '@/schemas';
import { AlignLeft, FileText } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface PostContentStepProps {
  form: UseFormReturn<CreatePostForm>;
}

export function PostContentStep({ form }: PostContentStepProps) {
  const { control, watch } = form;
  const content = watch('content') || '';
  const excerpt = watch('excerpt') || '';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">내용 작성</h3>
        <p className="text-sm text-gray-600">
          포스트의 상세 내용과 요약을 작성해주세요 (선택사항)
        </p>
      </div>

      <div className="grid gap-6">
        {/* 포스트 내용 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              포스트 내용
            </CardTitle>
            <CardDescription>
              포스트의 상세 내용을 작성해주세요 (선택사항)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="포스트의 상세 내용을 작성해주세요..."
                      rows={12}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 mt-1">
                    {content.length}자
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 포스트 요약 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlignLeft className="h-4 w-4" />
              포스트 요약
            </CardTitle>
            <CardDescription>
              포스트의 간단한 요약을 작성해주세요 (선택사항)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>요약</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="포스트의 핵심 내용을 간단히 요약해주세요..."
                      rows={4}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 mt-1">
                    {excerpt.length} / 300자
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* 작성 가이드 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-900">
            작성 가이드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>포스트 내용:</strong> 상세한 내용을 작성하면 AI가 더 정확한 포스트를 생성할 수 있습니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>포스트 요약:</strong> 핵심 내용을 요약하면 SEO와 소셜 미디어 공유에 도움이 됩니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>선택사항:</strong> 내용과 요약은 선택사항이며, 나중에 수정할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 작성된 내용 미리보기 */}
      {(content || excerpt) && (
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">
              작성 내용 미리보기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">포스트 내용:</h4>
                <div className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded border">
                  {content}
                </div>
              </div>
            )}
            
            {excerpt && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">포스트 요약:</h4>
                <div className="text-sm text-gray-900 bg-white p-3 rounded border">
                  {excerpt}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
