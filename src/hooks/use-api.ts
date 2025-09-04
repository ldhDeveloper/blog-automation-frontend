import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Post, Channel, Workspace, TimelineEvent, ApiResponse, PaginatedResponse } from '@/types/api';

interface PostsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
  channelId?: string;
}

// 쿼리 키 팩토리
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (params?: PostsQueryParams) => 
      [...queryKeys.posts.lists(), params] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
  channels: {
    all: ['channels'] as const,
    lists: () => [...queryKeys.channels.all, 'list'] as const,
    list: () => [...queryKeys.channels.lists()] as const,
    details: () => [...queryKeys.channels.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.channels.details(), id] as const,
  },
  workspaces: {
    all: ['workspaces'] as const,
    lists: () => [...queryKeys.workspaces.all, 'list'] as const,
    list: () => [...queryKeys.workspaces.lists()] as const,
    details: () => [...queryKeys.workspaces.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workspaces.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
  },
} as const;

// 포스트 관련 훅
export function usePosts(params?: PostsQueryParams) {
  return useQuery<PaginatedResponse<Post>, Error>({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => api.posts.getAll(params) as Promise<PaginatedResponse<Post>>,
  });
}

export function usePost(id: string) {
  return useQuery<ApiResponse<Post>, Error>({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => api.posts.get(id) as Promise<ApiResponse<Post>>,
    enabled: !!id,
  });
}

export function usePostTimeline(id: string) {
  return useQuery<ApiResponse<TimelineEvent[]>, Error>({
    queryKey: [...queryKeys.posts.detail(id), 'timeline'],
    queryFn: () => api.posts.getTimeline(id) as Promise<ApiResponse<TimelineEvent[]>>,
    enabled: !!id,
    refetchInterval: 5000, // 5초마다 자동 갱신
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.posts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) =>
      api.posts.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.posts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
}

export function useRetryPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.posts.retry,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
}

// 채널 관련 훅
export function useChannels() {
  return useQuery({
    queryKey: queryKeys.channels.list(),
    queryFn: api.channels.list,
  });
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: queryKeys.channels.detail(id),
    queryFn: () => api.channels.get(id),
    enabled: !!id,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.channels.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.lists() });
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Channel> }) =>
      api.channels.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.lists() });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.channels.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.lists() });
    },
  });
}

// 워크스페이스 관련 훅
export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.list(),
    queryFn: api.workspaces.list,
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id),
    queryFn: () => api.workspaces.get(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.workspaces.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.lists() });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workspace> }) =>
      api.workspaces.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.lists() });
    },
  });
}

// 사용자 관련 훅
export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: api.users.me,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.users.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
