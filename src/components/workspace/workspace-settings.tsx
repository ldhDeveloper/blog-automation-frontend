'use client';

import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/contexts/workspace-context';
import { workspaceApi } from '@/lib/api/workspace';
import type { Workspace } from '@/types/workspace';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { CanManageWorkspace } from './role-based-ui';

const workspaceSettingsSchema = z.object({
  name: z.string().min(1, '워크스페이스 이름을 입력해주세요').max(50, '이름은 50자 이하여야 합니다'),
  description: z.string().max(200, '설명은 200자 이하여야 합니다').optional(),
  settings: z.object({
    allowMemberInvites: z.boolean(),
    requireApprovalForPosts: z.boolean(),
    defaultPostVisibility: z.enum(['public', 'private', 'members']),
    maxMembers: z.number().min(1).max(1000).optional(),
  }),
});

type WorkspaceSettingsFormData = z.infer<typeof workspaceSettingsSchema>;

interface WorkspaceSettingsProps {
  workspace: Workspace;
}

export function WorkspaceSettings({ workspace }: WorkspaceSettingsProps) {
  const { refreshWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkspaceSettingsFormData>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || '',
      settings: {
        allowMemberInvites: workspace.settings.allowMemberInvites,
        requireApprovalForPosts: workspace.settings.requireApprovalForPosts,
        defaultPostVisibility: workspace.settings.defaultPostVisibility,
        maxMembers: workspace.settings.maxMembers,
      },
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<WorkspaceSettingsFormData>) => {
      const { settings, ...workspaceData } = data;
      return Promise.all([
        workspaceApi.updateWorkspace(workspace.id, {
          ...workspaceData,
          description: workspaceData.description || '',
        }),
        workspaceApi.updateWorkspaceSettings(workspace.id, settings),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentWorkspace'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      refreshWorkspace();
      toast.success('워크스페이스 설정이 저장되었습니다');
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast.error(error.message || '설정 저장에 실패했습니다');
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: WorkspaceSettingsFormData) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      // 에러는 mutation에서 처리됨
    }
  };

  return (
    <CanManageWorkspace>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">워크스페이스 설정</h3>
          <p className="text-sm text-gray-500">
            워크스페이스의 기본 정보와 권한 설정을 관리하세요.
          </p>
        </div>

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
                    <Input {...field} />
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
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="워크스페이스에 대한 설명을 입력하세요"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 pt-6 border-t">
            <h4 className="text-sm font-medium">권한 설정</h4>
            
            <div className="space-y-4">
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

              <FormField
                control={form.control}
                name="settings.defaultPostVisibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>기본 포스트 공개 범위</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="공개 범위를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">공개</SelectItem>
                        <SelectItem value="members">멤버만</SelectItem>
                        <SelectItem value="private">비공개</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      새로 생성되는 포스트의 기본 공개 범위입니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settings.maxMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최대 멤버 수 (선택사항)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="1000" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      워크스페이스에 참여할 수 있는 최대 멤버 수를 설정하세요. 비워두면 제한이 없습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '설정 저장'}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </CanManageWorkspace>
  );
}
