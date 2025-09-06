'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePostForm } from '@/schemas';
import {
    Bell,
    Calendar,
    Edit,
    Eye,
    FileText,
    Globe,
    Hash,
    Lock,
    MessageCircle,
    Tag
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface PostPreviewStepProps {
  form: UseFormReturn<CreatePostForm>;
}

// 임시 채널 데이터 (실제로는 API에서 가져와야 함)
const MOCK_CHANNELS = [
  { id: '1', name: '개인 블로그', platform: 'blog' },
  { id: '2', name: 'YouTube 채널', platform: 'youtube' },
  { id: '3', name: 'Twitter', platform: 'twitter' },
  { id: '4', name: 'Instagram', platform: 'instagram' },
  { id: '5', name: 'RSS 피드', platform: 'rss' },
];

export function PostPreviewStep({ form }: PostPreviewStepProps) {
  const { watch } = form;
  const formData = watch();

  const getChannelNames = (channelIds: string[]) => {
    return channelIds
      .map(id => MOCK_CHANNELS.find(channel => channel.id === id)?.name)
      .filter(Boolean);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">미리보기 및 확인</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          입력한 정보를 확인하고 포스트를 생성하세요
        </p>
      </div>

      {/* 포스트 미리보기 */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              포스트 미리보기
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Edit className="h-3 w-3" />
              미리보기
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 제목 */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {formData.title || '제목이 입력되지 않았습니다'}
            </h1>
            {formData.topic && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                주제: {formData.topic}
              </p>
            )}
          </div>

          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {formData.isPublic ? '공개' : '비공개'}
            </Badge>
            
            {formData.tags && formData.tags.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {formData.tags.length}개 태그
              </Badge>
            )}
            
            {formData.scheduledAt && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                예약 발행
              </Badge>
            )}
          </div>

          {/* 요약 */}
          {formData.excerpt && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">요약</h3>
              <p className="text-gray-900 dark:text-gray-100">{formData.excerpt}</p>
            </div>
          )}

          {/* 내용 */}
          {formData.content && (
            <div className="prose max-w-none">
              <h3 className="text-sm font-medium text-gray-700 mb-2">내용</h3>
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {formData.content}
              </div>
            </div>
          )}

          {/* 키워드 */}
          {formData.keywords && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Hash className="h-4 w-4" />
                키워드
              </h3>
              <p className="text-gray-600 text-sm">{formData.keywords}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 설정 요약 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 기본 정보 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">제목:</span>
              <p className="font-medium">{formData.title || '미입력'}</p>
            </div>
            <div>
              <span className="text-gray-600">주제:</span>
              <p className="font-medium">{formData.topic || '미입력'}</p>
            </div>
            {formData.keywords && (
              <div>
                <span className="text-gray-600">키워드:</span>
                <p className="font-medium">{formData.keywords}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 채널 및 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              채널 및 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">선택된 채널:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.channelIds && formData.channelIds.length > 0 ? (
                  getChannelNames(formData.channelIds).map((name, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">미선택</span>
                )}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">공개 설정:</span>
              <p className="font-medium flex items-center gap-1">
                {formData.isPublic ? (
                  <>
                    <Globe className="h-3 w-3" />
                    공개
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    비공개
                  </>
                )}
              </p>
            </div>

            {formData.scheduledAt && (
              <div>
                <span className="text-gray-600">예약 발행:</span>
                <p className="font-medium">{formatDate(formData.scheduledAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 추가 옵션 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">추가 옵션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">댓글 허용:</span>
              <span className="font-medium">
                {formData.allowComments ? '예' : '아니오'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">팔로워 알림:</span>
              <span className="font-medium">
                {formData.notifyFollowers ? '예' : '아니오'}
              </span>
            </div>
          </div>

          {formData.tags && formData.tags.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-gray-600">태그:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최종 확인 메시지 */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-800">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <p className="text-sm font-medium">
              모든 정보가 올바르게 입력되었습니다. 포스트를 생성하시겠습니까?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
