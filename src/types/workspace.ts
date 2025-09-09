export interface Workspace {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  allowMemberInvites: boolean;
  requireApprovalForPosts: boolean;
  defaultPostVisibility: 'public' | 'private' | 'members';
  maxMembers?: number;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  slug: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface InviteMemberRequest {
  email: string;
  role: WorkspaceRole;
}

export interface UpdateMemberRoleRequest {
  memberId: string;
  role: WorkspaceRole;
}
