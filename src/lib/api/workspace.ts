import { apiClient } from '@/lib/api';
import type {
    CreateWorkspaceRequest,
    InviteMemberRequest,
    UpdateMemberRoleRequest,
    UpdateWorkspaceRequest,
    Workspace,
    WorkspaceMember,
} from '@/types/workspace';

export const workspaceApi = {
  // 워크스페이스 목록 조회
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get('workspaces').json<{ data: Workspace[] }>();
    return response.data;
  },

  // 현재 워크스페이스 조회
  async getCurrentWorkspace(): Promise<Workspace | null> {
    try {
      const response = await apiClient.get('workspaces/current').json<{ data: Workspace }>();
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // 워크스페이스 생성
  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await apiClient.post('workspaces', { json: data }).json<{ data: Workspace }>();
    return response.data;
  },

  // 워크스페이스 수정
  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    const response = await apiClient.patch(`workspaces/${workspaceId}`, { json: data }).json<{ data: Workspace }>();
    return response.data;
  },

  // 워크스페이스 삭제
  async deleteWorkspace(workspaceId: string): Promise<void> {
    await apiClient.delete(`workspaces/${workspaceId}`);
  },

  // 워크스페이스 전환
  async switchWorkspace(workspaceId: string): Promise<Workspace> {
    const response = await apiClient.post(`workspaces/${workspaceId}/switch`).json<{ data: Workspace }>();
    return response.data;
  },

  // 워크스페이스 멤버 목록 조회
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await apiClient.get(`workspaces/${workspaceId}/members`).json<{ data: WorkspaceMember[] }>();
    return response.data;
  },

  // 멤버 초대
  async inviteMember(workspaceId: string, data: InviteMemberRequest): Promise<void> {
    await apiClient.post(`workspaces/${workspaceId}/members/invite`, { json: data });
  },

  // 멤버 역할 변경
  async updateMemberRole(workspaceId: string, data: UpdateMemberRoleRequest): Promise<WorkspaceMember> {
    const response = await apiClient.patch(
      `workspaces/${workspaceId}/members/${data.memberId}/role`,
      { json: { role: data.role } }
    ).json<{ data: WorkspaceMember }>();
    return response.data;
  },

  // 멤버 제거
  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await apiClient.delete(`workspaces/${workspaceId}/members/${memberId}`);
  },

  // 워크스페이스 설정 조회
  async getWorkspaceSettings(workspaceId: string) {
    const response = await apiClient.get(`workspaces/${workspaceId}/settings`).json<{ data: any }>();
    return response.data;
  },

  // 워크스페이스 설정 업데이트
  async updateWorkspaceSettings(workspaceId: string, settings: any) {
    const response = await apiClient.patch(`workspaces/${workspaceId}/settings`, { json: settings }).json<{ data: any }>();
    return response.data;
  },
};

// 편의 함수들
export const fetchWorkspaces = workspaceApi.getWorkspaces;
export const fetchCurrentWorkspace = workspaceApi.getCurrentWorkspace;
export const createWorkspace = workspaceApi.createWorkspace;
export const updateWorkspace = workspaceApi.updateWorkspace;
export const deleteWorkspace = workspaceApi.deleteWorkspace;
export const switchWorkspace = workspaceApi.switchWorkspace;
export const fetchWorkspaceMembers = workspaceApi.getWorkspaceMembers;
export const inviteWorkspaceMember = workspaceApi.inviteMember;
export const updateWorkspaceMemberRole = workspaceApi.updateMemberRole;
export const removeWorkspaceMember = workspaceApi.removeMember;
