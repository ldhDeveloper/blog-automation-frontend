'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CreatePostForm } from '@/schemas';
import {
  Bell,
  Calendar,
  Globe,
  Lock,
  MessageCircle,
  Plus,
  Tag,
  X
} from 'lucide-react';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface PostOptionsStepProps {
  form: UseFormReturn<CreatePostForm>;
}

export function PostOptionsStep({ form }: PostOptionsStepProps) {
  const { control, watch, setValue } = form;
  const [newTag, setNewTag] = useState('');
  
  const isPublic = watch('isPublic');
  const tags = watch('tags') || [];
  const scheduledAt = watch('scheduledAt');
  const allowComments = watch('allowComments');
  const notifyFollowers = watch('notifyFollowers');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">옵션 설정</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          포스트의 공개 설정, 태그, 예약 발행 등을 설정해주세요
        </p>
      </div>

      <div className="grid gap-6">
        {/* 공개 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              공개 설정
            </CardTitle>
            <CardDescription>
              포스트의 공개 범위를 설정해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">공개 포스트</FormLabel>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      모든 사용자가 볼 수 있는 공개 포스트
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 태그 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />
              태그
            </CardTitle>
            <CardDescription>
              포스트를 분류할 태그를 추가해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 태그 입력 */}
            <div className="flex gap-2">
              <Input
                placeholder="태그를 입력하세요"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim()}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                추가
              </Button>
            </div>

            {/* 태그 목록 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 예약 발행 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              예약 발행
            </CardTitle>
            <CardDescription>
              나중에 자동으로 발행할 시간을 설정해주세요 (선택사항)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발행 예정 시간</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 추가 옵션 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">추가 옵션</CardTitle>
            <CardDescription>
              포스트의 추가 기능을 설정해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 댓글 허용 */}
            <FormField
              control={control}
              name="allowComments"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      댓글 허용
                    </FormLabel>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      사용자가 댓글을 남길 수 있도록 허용
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 팔로워 알림 */}
            <FormField
              control={control}
              name="notifyFollowers"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      팔로워 알림
                    </FormLabel>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      팔로워들에게 새 포스트 알림 전송
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* 설정 요약 */}
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-100">
            설정 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">공개 설정:</span>
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "공개" : "비공개"}
            </Badge>
          </div>
          
          {tags.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">태그:</span>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {scheduledAt && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">예약 발행:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {new Date(scheduledAt).toLocaleString('ko-KR')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
