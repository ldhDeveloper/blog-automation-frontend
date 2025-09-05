'use client';

import { Badge } from '@/components/ui/badge';
import { createBrandIcon } from '@/components/ui/brand-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { CreatePostForm } from '@/schemas';
import { Globe, Rss } from 'lucide-react';
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
  const { control, watch, setValue } = form;
  const selectedChannels = watch('channelIds') || [];

  const handleChannelToggle = (channelId: string, checked: boolean) => {
    const currentChannels = selectedChannels;
    if (checked) {
      setValue('channelIds', [...currentChannels, channelId]);
    } else {
      setValue('channelIds', currentChannels.filter(id => id !== channelId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">채널 선택</h3>
        <p className="text-sm text-gray-600">
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
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
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
                      <h4 className="text-sm font-medium text-gray-900 truncate">
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
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900">
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
