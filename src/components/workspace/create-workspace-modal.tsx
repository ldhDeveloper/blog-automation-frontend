'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createWorkspace } from '@/lib/api/workspace';
import { createWorkspaceSchema, type CreateWorkspaceRequest } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (workspace: any) => void;
}

export function CreateWorkspaceModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateWorkspaceModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      settings: {
        allowMemberInvites: true,
        requireApprovalForPosts: false,
        defaultPostVisibility: 'public',
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: (newWorkspace) => {
      // 워크스페이스 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['currentWorkspace'] });
      
      toast.success('워크스페이스가 생성되었습니다');
      form.reset();
      onOpenChange(false);
      onSuccess?.(newWorkspace);
    },
    onError: (error: any) => {
      toast.error(error.message || '워크스페이스 생성에 실패했습니다');
    },
  });

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    setIsSubmitting(true);
    try {
      const requestData: CreateWorkspaceRequest = {
        name: data.name,
        slug: data.slug,
        ...(data.description && { description: data.description }),
        settings: data.settings,
      };
      await createMutation.mutateAsync(requestData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 워크스페이스 생성</DialogTitle>
          <DialogDescription>
            팀과 함께 사용할 새로운 워크스페이스를 생성하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>워크스페이스 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 우리 회사 블로그" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명 (선택사항)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="워크스페이스에 대한 간단한 설명을 입력하세요"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL 슬러그</FormLabel>
                    <FormControl>
                      <Input placeholder="our-company-blog" {...field} />
                    </FormControl>
                    <FormDescription>
                      워크스페이스의 고유한 URL 식별자입니다. 소문자, 숫자, 하이픈만 사용할 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">워크스페이스 설정</h4>
                
                <FormField
                  control={form.control}
                  name="settings.allowMemberInvites"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>멤버 초대 허용</FormLabel>
                        <FormDescription>
                          멤버들이 다른 사용자를 초대할 수 있도록 허용합니다.
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name="settings.requireApprovalForPosts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>포스트 승인 필요</FormLabel>
                        <FormDescription>
                          포스트 발행 전에 관리자의 승인이 필요합니다.
                        </FormDescription>
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
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '생성 중...' : '워크스페이스 생성'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
