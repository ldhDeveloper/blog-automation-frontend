'use client';

import { fetchCurrentWorkspace, switchWorkspace } from '@/lib/api/workspace';
import type { Workspace } from '@/types/workspace';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useState } from 'react';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  switchToWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  const {
    data: currentWorkspace,
    isLoading,
    error,
    refetch: refreshWorkspace,
  } = useQuery({
    queryKey: ['currentWorkspace'],
    queryFn: fetchCurrentWorkspace,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1,
  });

  const switchMutation = useMutation({
    mutationFn: switchWorkspace,
    onSuccess: (newWorkspace) => {
      // 현재 워크스페이스 데이터 업데이트
      queryClient.setQueryData(['currentWorkspace'], newWorkspace);
      
      // 관련 쿼리들 무효화하여 새 데이터 로드
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      
      setIsSwitching(false);
    },
    onError: () => {
      setIsSwitching(false);
    },
  });

  const switchToWorkspace = async (workspaceId: string) => {
    if (isSwitching) return;
    
    setIsSwitching(true);
    try {
      await switchMutation.mutateAsync(workspaceId);
    } catch (error) {
      console.error('워크스페이스 전환 실패:', error);
      throw error;
    }
  };

  const value: WorkspaceContextType = {
    currentWorkspace: currentWorkspace || null,
    isLoading: isLoading || isSwitching,
    error: error as Error | null,
    switchToWorkspace,
    refreshWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

// 워크스페이스 권한 체크 훅
export function useWorkspacePermissions() {
  const { currentWorkspace } = useWorkspace();
  
  const isOwner = (memberId?: string) => {
    if (!currentWorkspace) return false;
    return currentWorkspace.ownerId === memberId;
  };

  const canManageWorkspace = (memberId?: string) => {
    if (!currentWorkspace) return false;
    return currentWorkspace.ownerId === memberId;
  };

  const canInviteMembers = (memberId?: string) => {
    if (!currentWorkspace) return false;
    return currentWorkspace.ownerId === memberId;
  };

  const canManagePosts = (memberId?: string) => {
    if (!currentWorkspace) return false;
    return currentWorkspace.ownerId === memberId;
  };

  return {
    isOwner,
    canManageWorkspace,
    canInviteMembers,
    canManagePosts,
  };
}

// 워크스페이스 역할 관리 훅
export function useWorkspaceRole() {
  const { currentWorkspace } = useWorkspace();
  
  // 현재 사용자의 역할 확인 (실제 구현에서는 사용자 ID를 가져와야 함)
  const getCurrentUserRole = (): WorkspaceRole | null => {
    if (!currentWorkspace) return null;
    // TODO: 실제 사용자 ID를 가져와서 역할 확인
    // 현재는 임시로 owner로 설정
    return 'owner';
  };

  const hasRole = (role: WorkspaceRole, memberId?: string): boolean => {
    if (!currentWorkspace) return false;
    
    // 소유자는 모든 권한을 가짐
    if (currentWorkspace.ownerId === memberId) return true;
    
    // TODO: 실제 멤버 역할을 확인하는 로직 구현
    // 현재는 임시로 false 반환
    return false;
  };

  const canPerformAction = (action: WorkspaceAction, memberId?: string): boolean => {
    if (!currentWorkspace) return false;
    
    const userRole = getCurrentUserRole();
    if (!userRole) return false;

    // 소유자는 모든 액션 가능
    if (userRole === 'owner') return true;

    // 역할별 권한 체크
    switch (action) {
      case 'manage_workspace':
        return userRole === 'owner' || userRole === 'admin';
      case 'invite_members':
        return userRole === 'owner' || userRole === 'admin';
      case 'manage_posts':
        return userRole === 'owner' || userRole === 'admin' || userRole === 'member';
      case 'view_members':
        return true;
      case 'delete_workspace':
        return userRole === 'owner';
      default:
        return false;
    }
  };

  return {
    getCurrentUserRole,
    hasRole,
    canPerformAction,
  };
}

// 워크스페이스 액션 타입
export type WorkspaceAction = 
  | 'manage_workspace'
  | 'invite_members'
  | 'manage_posts'
  | 'view_members'
  | 'delete_workspace';
