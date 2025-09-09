'use client';

import type { WorkspaceAction } from '@/contexts/workspace-context';
import { useWorkspaceRole } from '@/contexts/workspace-context';
import { ReactNode } from 'react';

interface RoleBasedUIProps {
  action: WorkspaceAction;
  fallback?: ReactNode;
  children: ReactNode;
  memberId?: string;
}

/**
 * 역할 기반 UI 조건부 렌더링 컴포넌트
 * 사용자의 역할에 따라 UI 요소를 표시하거나 숨깁니다.
 */
export function RoleBasedUI({ 
  action, 
  fallback = null, 
  children, 
  memberId 
}: RoleBasedUIProps) {
  const { canPerformAction } = useWorkspaceRole();
  
  if (canPerformAction(action, memberId)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * 소유자만 볼 수 있는 UI 컴포넌트
 */
export function OwnerOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedUI action="delete_workspace" fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}

/**
 * 관리자 이상만 볼 수 있는 UI 컴포넌트
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedUI action="manage_workspace" fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}

/**
 * 멤버 이상만 볼 수 있는 UI 컴포넌트
 */
export function MemberOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedUI action="manage_posts" fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}

/**
 * 멤버 초대 권한이 있는 사용자만 볼 수 있는 UI 컴포넌트
 */
export function CanInviteMembers({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedUI action="invite_members" fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}

/**
 * 워크스페이스 관리 권한이 있는 사용자만 볼 수 있는 UI 컴포넌트
 */
export function CanManageWorkspace({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedUI action="manage_workspace" fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}
