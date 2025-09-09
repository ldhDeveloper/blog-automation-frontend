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
import { useWorkspace } from '@/contexts/workspace-context';
import { deleteWorkspace } from '@/lib/api/workspace';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { OwnerOnly } from './role-based-ui';

interface WorkspaceManagementProps {
  workspaceId: string;
  workspaceName: string;
}

export function WorkspaceManagement({ workspaceId, workspaceName }: WorkspaceManagementProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { switchToWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkspace(workspaceId),
    onSuccess: async () => {
      // 워크스페이스 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['currentWorkspace'] });
      
      toast.success('워크스페이스가 삭제되었습니다');
      
      // 다른 워크스페이스로 전환하거나 대시보드로 이동
      try {
        const workspaces = queryClient.getQueryData(['workspaces']) as any[];
        if (workspaces && workspaces.length > 0) {
          await switchToWorkspace(workspaces[0].id);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '워크스페이스 삭제에 실패했습니다');
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <OwnerOnly>
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-red-600">위험 구역</h3>
            <p className="text-sm text-gray-500 mb-4">
              이 작업은 되돌릴 수 없습니다. 신중하게 진행하세요.
            </p>
            
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              워크스페이스 삭제
            </Button>
          </div>
        </div>
      </OwnerOnly>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              워크스페이스 삭제
            </DialogTitle>
            <DialogDescription>
              정말로 <strong>"{workspaceName}"</strong> 워크스페이스를 삭제하시겠습니까?
              <br />
              <br />
              이 작업은 되돌릴 수 없으며, 워크스페이스의 모든 데이터가 영구적으로 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
