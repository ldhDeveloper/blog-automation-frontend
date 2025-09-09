'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useQueryErrorHandler } from '@/contexts/error-context';
import { useWorkspace, useWorkspaceRole } from '@/contexts/workspace-context';
import { fetchWorkspaceMembers, removeWorkspaceMember, updateWorkspaceMemberRole } from '@/lib/api/workspace';
import type { WorkspaceRole } from '@/types/workspace';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Trash2, UserCog, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { InviteMemberModal } from './invite-member-modal';
import { CanInviteMembers, OwnerOnly } from './role-based-ui';

interface WorkspaceMembersProps {
  workspaceId: string;
}

export function WorkspaceMembers({ workspaceId }: WorkspaceMembersProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { handleError } = useQueryErrorHandler();
  const { currentWorkspace } = useWorkspace();
  const { canPerformAction } = useWorkspaceRole();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['workspaceMembers', workspaceId],
    queryFn: () => fetchWorkspaceMembers(workspaceId),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceRole }) =>
      updateWorkspaceMemberRole(workspaceId, { memberId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
      setEditingMember(null);
    },
    onError: handleError,
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeWorkspaceMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
    },
    onError: handleError,
  });

  // 에러 처리
  if (error) {
    handleError(error);
  }

  const handleRoleChange = (memberId: string, newRole: WorkspaceRole) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('정말로 이 멤버를 제거하시겠습니까?')) {
      removeMemberMutation.mutate(memberId);
    }
  };

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return '소유자';
      case 'admin':
        return '관리자';
      case 'member':
        return '멤버';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">워크스페이스 멤버</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            총 {members.length}명
          </div>
          <CanInviteMembers>
            <Button
              onClick={() => setShowInviteModal(true)}
              size="sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              멤버 초대
            </Button>
          </CanInviteMembers>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>사용자</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name || member.user.email}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {member.user.name || '이름 없음'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {editingMember === member.id ? (
                  <Select
                    value={member.role}
                    onValueChange={(value: WorkspaceRole) => handleRoleChange(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">멤버</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                      {member.role === 'owner' && (
                        <SelectItem value="owner">소유자</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {getRoleLabel(member.role)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(member.joinedAt).toLocaleDateString('ko-KR')}
              </TableCell>
              <TableCell>
                <CanInviteMembers>
                  {member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingMember(member.id)}
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          역할 변경
                        </DropdownMenuItem>
                        <OwnerOnly>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            제거
                          </DropdownMenuItem>
                        </OwnerOnly>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CanInviteMembers>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InviteMemberModal
        workspaceId={workspaceId}
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
      />
    </div>
  );
}