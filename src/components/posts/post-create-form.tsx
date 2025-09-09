'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useApiErrorHandler } from '@/contexts/error-context';
import { useLogger } from '@/hooks/use-logger';
import { createPostSchema, type CreatePostForm } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const logger = useLogger('POST_CREATE_FORM');
  const { handleApiError } = useApiErrorHandler();

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

  const { handleSubmit, trigger, formState: { isValid, errors }, watch } = form;
  
  // ref를 사용하여 최신 값들을 참조
  const loggerRef = useRef(logger);
  const currentStepRef = useRef(currentStep);
  const watchRef = useRef(watch);
  
  // ref 값들을 최신으로 업데이트
  loggerRef.current = logger;
  currentStepRef.current = currentStep;
  watchRef.current = watch;

  // 유효성 검사 함수를 ref로 저장하여 안정화
  const checkCurrentStepValidityRef = useRef<(() => Promise<void>) | null>(null);
  
  checkCurrentStepValidityRef.current = async () => {
    const fieldsToValidate = getFieldsForStep(currentStepRef.current);
    const isStepValid = await trigger(fieldsToValidate);
    
    loggerRef.current.debug('현재 단계 유효성 검사', {
      step: currentStepRef.current,
      fieldsToValidate,
      isStepValid,
      formValues: watchRef.current()
    });
    
    setIsCurrentStepValid(isStepValid);
  };

  // 현재 단계가 변경될 때 유효성 검사
  useEffect(() => {
    checkCurrentStepValidityRef.current?.();
  }, [currentStep]);

  // 필드 변경 감시 (안전한 방법으로 재구현)
  useEffect(() => {
    console.log('🔍 watch 구독 시작');
    let timeoutId: NodeJS.Timeout;
    let lastProcessedValue: any = null;
    
    const subscription = watchRef.current((value, { name, type }) => {
      // 값이 실제로 변경되었는지 확인
      const currentValue = JSON.stringify(value);
      if (currentValue === lastProcessedValue) {
        console.log('⏸️ 값이 동일하므로 스킵:', { name, type });
        return;
      }
      
      console.log('👀 필드 변경 감지:', { name, type, value });
      loggerRef.current.debug('필드 변경 감지', { name, type, value });
      
      // 디바운싱을 사용하여 연속된 호출 방지
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastProcessedValue = currentValue;
        console.log('🔧 유효성 검사 실행 (디바운싱)');
        checkCurrentStepValidityRef.current?.();
      }, 200); // 200ms 디바운싱으로 증가
    });
    
    return () => {
      console.log('🔍 watch 구독 해제');
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // 빈 의존성 배열

  const nextStep = async () => {
    // 현재 단계의 필드들만 검증
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    logger.userAction('다음 단계로 이동 시도', {
      currentStep,
      isStepValid,
      fieldsToValidate
    });
    
    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      logger.info('다음 단계로 이동 성공', { newStep: currentStep + 1 });
    } else {
      logger.warn('다음 단계로 이동 실패', { isStepValid, currentStep });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      logger.userAction('이전 단계로 이동', { fromStep: currentStep, toStep: currentStep - 1 });
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreatePostForm) => {
    logger.info('폼 제출 시작', { data });
    setIsSubmitting(true);
    // 이전 에러는 자동으로 클리어됨 (Toast 기반)
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const duration = Date.now() - startTime;
      logger.api('POST', '/api/posts', response.status, duration, { success: response.ok });

      if (!response.ok) {
        const error = await response.json();
        logger.error('API 에러', { status: response.status, error, data });
        
        // API 에러 표시
        handleApiError({
          message: error.message || '포스트 생성에 실패했습니다',
          status: response.status,
          code: error.code,
          details: error.details,
        }, {
          title: '포스트 생성 오류',
          action: {
            label: '다시 시도',
            onClick: () => onSubmit(data),
          },
        });
        return;
      }

      const result = await response.json();
      logger.info('포스트 생성 성공', { result, duration });
      logger.userAction('포스트 생성 완료', { postId: result.data.id });
      
      router.push(`/posts/${result.data.id}`);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('포스트 생성 오류', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        data,
        duration
      });
      
      // 네트워크 에러 등 기타 에러 표시
      handleApiError({
        message: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
        status: 0,
        code: 'NETWORK_ERROR',
      }, {
        title: '네트워크 오류',
        action: {
          label: '다시 시도',
          onClick: () => onSubmit(data),
        },
      });
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
        {/* API 에러 표시 */}
        
        {/* 개발 환경 디버깅 패널 */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200">🐛 디버깅 정보</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="text-foreground">
                <strong>현재 단계:</strong> {currentStep} / {STEPS.length}
              </div>
              <div className="text-foreground">
                <strong>현재 단계 유효성:</strong> 
                <span className={isCurrentStepValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {isCurrentStepValid ? ' ✅ 유효' : ' ❌ 무효'}
                </span>
              </div>
              <div className="text-foreground">
                <strong>전체 폼 유효성:</strong> 
                <span className={isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {isValid ? ' ✅ 유효' : ' ❌ 무효'}
                </span>
              </div>
              <div className="text-foreground">
                <strong>에러:</strong>
                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(errors, null, 2)}
                </pre>
              </div>
              <div className="text-foreground">
                <strong>폼 값:</strong>
                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(watch(), null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
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
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.title}</p>
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
                    disabled={!isCurrentStepValid}
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
