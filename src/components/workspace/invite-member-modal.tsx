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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { inviteWorkspaceMember } from '@/lib/api/workspace';
import type { WorkspaceRole } from '@/types/workspace';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { CanInviteMembers } from './role-based-ui';

const inviteMemberSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  role: z.enum(['member', 'admin'] as const, {
    required_error: '역할을 선택해주세요',
  }),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberModalProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({ 
  workspaceId, 
  open, 
  onOpenChange 
}: InviteMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteMemberFormData) => 
      inviteWorkspaceMember(workspaceId, data),
    onSuccess: () => {
      // 멤버 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
      
      toast.success('멤버 초대가 전송되었습니다');
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || '멤버 초대에 실패했습니다');
    },
  });

  const onSubmit = async (data: InviteMemberFormData) => {
    setIsSubmitting(true);
    try {
      await inviteMutation.mutateAsync(data);
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

  const getRoleDescription = (role: WorkspaceRole) => {
    switch (role) {
      case 'admin':
        return '워크스페이스를 관리하고 멤버를 초대할 수 있습니다';
      case 'member':
        return '포스트를 작성하고 관리할 수 있습니다';
      default:
        return '';
    }
  };

  return (
    <CanInviteMembers>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              멤버 초대
            </DialogTitle>
            <DialogDescription>
              새로운 멤버를 워크스페이스에 초대하세요. 초대받은 사용자는 이메일을 통해 가입할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일 주소</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="user@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>역할</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="역할을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">
                          <div>
                            <div className="font-medium">멤버</div>
                            <div className="text-sm text-gray-500">
                              {getRoleDescription('member')}
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div>
                            <div className="font-medium">관리자</div>
                            <div className="text-sm text-gray-500">
                              {getRoleDescription('admin')}
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      나중에 역할을 변경할 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  {isSubmitting ? '초대 중...' : '초대 전송'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </CanInviteMembers>
  );
}
