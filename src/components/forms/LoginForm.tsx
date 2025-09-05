'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginSchema } from '@/schemas';

// 🟢 GREEN: 테스트를 통과하는 최소한의 코드 작성

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset(); // 성공 후 폼 초기화
    } catch {
      // 에러는 상위 컴포넌트에서 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonLoading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* 에러 메시지 표시 */}
      {error && (
        <div role="alert" className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* 이메일 입력 */}
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@domain.com"
          {...register('email')}
          disabled={isButtonLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* 비밀번호 입력 */}
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="8자 이상 입력해주세요"
          {...register('password')}
          disabled={isButtonLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full"
        disabled={isButtonLoading}
      >
        {isButtonLoading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
