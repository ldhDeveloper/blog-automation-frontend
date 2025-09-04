// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 에러 타입 정의
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// 인증 관련 타입
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// 포스트 관련 타입
export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'ideate' | 'draft' | 'image' | 'seo' | 'publish' | 'published' | 'failed' | 'generating' | 'ready';
  channelId: string;
  workspaceId: string;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    readTime?: number;
    wordCount?: number;
    tags?: string[];
    seoScore?: number;
  };
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  platform: string;
  settings: Record<string, unknown>;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

// Job 관련 타입
export interface Job {
  id: string;
  postId: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// 타임라인 이벤트 타입
export interface TimelineEvent {
  id: string;
  postId: string;
  type: 'ideate' | 'draft' | 'image' | 'seo' | 'publish';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: string;
  message: string;
  duration?: number; // 초 단위
  error?: string;
  metadata?: Record<string, unknown>;
}
