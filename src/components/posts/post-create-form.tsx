'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { createPostSchema, type CreatePostForm } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// 단계별 컴포넌트들
import { PostBasicInfoStep } from './post-create-steps/basic-info-step';
import { PostChannelStep } from './post-create-steps/channel-step';
import { PostContentStep } from './post-create-steps/content-step';
import { PostOptionsStep } from './post-create-steps/options-step';
import { PostPreviewStep } from './post-create-steps/preview-step';

const STEPS = [
  { id: 1, title: '기본 정보', description: '제목, 주제, 키워드 입력' },
  { id: 2, title: '채널 선택', description: '게시할 채널 선택' },
  { id: 3, title: '옵션 설정', description: '공개 설정 및 태그' },
  { id: 4, title: '내용 작성', description: '포스트 내용 및 요약' },
  { id: 5, title: '미리보기', description: '최종 확인 및 제출' },
];

export function PostCreateForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      topic: '',
      keywords: '',
      channelIds: [],
      isPublic: true,
      tags: [],
      scheduledAt: undefined,
      allowComments: true,
      notifyFollowers: true,
      content: '',
      excerpt: '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, formState: { isValid } } = form;

  const nextStep = async () => {
    // 현재 단계의 필드들만 검증
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreatePostForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '포스트 생성에 실패했습니다');
      }

      const result = await response.json();
      router.push(`/posts/${result.data.id}`);
    } catch (error) {
      console.error('포스트 생성 오류:', error);
      // TODO: 에러 토스트 표시
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (step: number): (keyof CreatePostForm)[] => {
    switch (step) {
      case 1:
        return ['title', 'topic', 'keywords'];
      case 2:
        return ['channelIds'];
      case 3:
        return ['isPublic', 'tags', 'scheduledAt', 'allowComments', 'notifyFollowers'];
      case 4:
        return ['content', 'excerpt'];
      case 5:
        return [];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PostBasicInfoStep form={form} />;
      case 2:
        return <PostChannelStep form={form} />;
      case 3:
        return <PostOptionsStep form={form} />;
      case 4:
        return <PostContentStep form={form} />;
      case 5:
        return <PostPreviewStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  currentStep > step.id
                    ? 'border-green-500 bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div className="mx-4 h-px w-8 bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* 현재 단계 표시 (모바일) */}
      <div className="sm:hidden">
        <Badge variant="outline" className="text-sm">
          {currentStep}단계: {STEPS[currentStep - 1].title}
        </Badge>
      </div>

      {/* 폼 내용 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {STEPS[currentStep - 1].title}
            </span>
            <Badge variant="secondary">
              {currentStep} / {STEPS.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              <div className="flex gap-2">
                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isValid}
                    className="flex items-center gap-2"
                  >
                    다음
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? '생성 중...' : '포스트 생성'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </Form>
  );
}
