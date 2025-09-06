'use client';

import { Badge } from '@/components/ui/badge';
import { createBrandIcon } from '@/components/ui/brand-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { CreatePostForm } from '@/schemas';
import { Globe, Rss } from 'lucide-react';
import { useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { siInstagram, siX, siYoutube } from 'simple-icons';

interface PostChannelStepProps {
  form: UseFormReturn<CreatePostForm>;
}

export const YoutubeIcon = createBrandIcon("YoutubeIcon", {
    path: siYoutube.path,
    // SimpleIcons는 24x24 스케일이 기본
    viewBox: "0 0 24 24",
    title: siYoutube.title, // "YouTube"
  });

export const InstagramIcon = createBrandIcon("InstagramIcon", {
    path: siInstagram.path,
    viewBox: "0 0 24 24",
    title: siInstagram.title,
  });

export const XIcon = createBrandIcon("XIcon", {
    path: siX.path,
    viewBox: "0 0 24 24",
    title: siX.title,
  });

// 임시 채널 데이터 (실제로는 API에서 가져와야 함)
const MOCK_CHANNELS = [
  {
    id: '1',
    name: '개인 블로그',
    platform: 'blog',
    description: '개인 기술 블로그',
    icon: Globe,
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'YouTube 채널',
    platform: 'youtube',
    description: '개발 관련 영상 채널',
    icon: YoutubeIcon,
    color: 'bg-red-500',
  },
  {
    id: '3',
    name: 'X',
    platform: 'x',
    description: '개발 소식 공유',
    icon: XIcon,
    color: 'bg-black-500',
  },
  {
    id: '4',
    name: 'Instagram',
    platform: 'instagram',
    description: '개발 일상 공유',
    icon: InstagramIcon,
    color: 'bg-pink-500',
  },
  {
    id: '5',
    name: 'RSS 피드',
    platform: 'rss',
    description: 'RSS 구독자용 피드',
    icon: Rss,
    color: 'bg-orange-500',
  },
];

export function PostChannelStep({ form }: PostChannelStepProps) {
  const { control, watch, setValue, trigger } = form;
  const selectedChannels = watch('channelIds') || [];
  
  // 중복 처리 방지를 위한 ref
  const isProcessingRef = useRef(false);

  const handleChannelToggle = (channelId: string, checked: boolean) => {
    // 중복 처리 방지
    if (isProcessingRef.current) {
      console.log('⏸️ 이미 처리 중이므로 스킵:', { channelId, checked });
      return;
    }
    
    console.log('🔄 handleChannelToggle 호출됨:', { channelId, checked });
    isProcessingRef.current = true;
    
    // 현재 선택된 채널들을 직접 계산
    const currentChannels = selectedChannels || [];
    console.log('📋 현재 채널들:', currentChannels);
    
    if (checked) {
      // 이미 선택되어 있으면 추가하지 않음
      if (currentChannels.includes(channelId)) {
        console.log('⚠️ 이미 선택된 채널:', channelId);
        isProcessingRef.current = false;
        return;
      }
      const newChannels = [...currentChannels, channelId];
      console.log('✅ 채널 추가:', newChannels);
      setValue('channelIds', newChannels, { 
        shouldValidate: false, // 수동으로 트리거하므로 false
        shouldDirty: true,
        shouldTouch: true
      });
      
      // 수동으로 유효성 검사 트리거
      trigger('channelIds');
    } else {
      // 선택되어 있지 않으면 제거하지 않음
      if (!currentChannels.includes(channelId)) {
        console.log('⚠️ 선택되지 않은 채널:', channelId);
        isProcessingRef.current = false;
        return;
      }
      const newChannels = currentChannels.filter((id: string) => id !== channelId);
      console.log('❌ 채널 제거:', newChannels);
      setValue('channelIds', newChannels, { 
        shouldValidate: false, // 수동으로 트리거하므로 false
        shouldDirty: true,
        shouldTouch: true
      });
      
      // 수동으로 유효성 검사 트리거
      trigger('channelIds');
    }
    
    // 처리 완료 후 플래그 리셋
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">채널 선택</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          포스트를 게시할 채널을 선택해주세요 (최소 1개 이상)
        </p>
      </div>

      <div className="grid gap-4">
        {MOCK_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          const isSelected = selectedChannels.includes(channel.id);
          
          return (
            <Card 
              key={channel.id} 
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'hover:shadow-md hover:border-gray-300'
              }`}
              onClick={() => handleChannelToggle(channel.id, !isSelected)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${channel.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {channel.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {channel.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {channel.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => {}} // onClick에서 처리하므로 빈 함수
                      className="pointer-events-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 선택된 채널 요약 */}
      {selectedChannels.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              선택된 채널 ({selectedChannels.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedChannels.map((channelId) => {
                const channel = MOCK_CHANNELS.find(c => c.id === channelId);
                if (!channel) return null;
                
                const Icon = channel.icon;
                return (
                  <Badge 
                    key={channelId} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    <Icon className="h-3 w-3" />
                    {channel.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 채널이 선택되지 않은 경우 안내 */}
      {selectedChannels.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">
                최소 하나의 채널을 선택해주세요
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <FormField
        control={control}
        name="channelIds"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
