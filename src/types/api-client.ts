// API 클라이언트를 위한 타입 정의

// 기본 API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 요청 옵션
export interface ApiRequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

// API 클라이언트 인터페이스
export interface ApiClient {
  request<T>(endpoint: string, options: ApiRequestOptions): Promise<ApiResponse<T>>;
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string): Promise<ApiResponse<T>>;
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

export interface CreatePostRequest {
  title: string;
  topic: string;
  keywords?: string;
  channelIds: string[];
  isPublic: boolean;
  tags: string[];
  scheduledAt?: string;
  allowComments: boolean;
  notifyFollowers: boolean;
  content?: string;
  excerpt?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

// 채널 관련 타입
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

export interface CreateChannelRequest {
  name: string;
  description?: string;
  platform: string;
  settings?: Record<string, unknown>;
}

export interface UpdateChannelRequest extends Partial<CreateChannelRequest> {
  id: string;
}

// 워크스페이스 관련 타입
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceRequest extends Partial<CreateWorkspaceRequest> {
  id: string;
}

// 사용자 관련 타입
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

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

// 작업 관련 타입
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

export interface JobQueryParams {
  postId?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  page?: number;
  limit?: number;
}

// 타임라인 관련 타입
export interface TimelineEvent {
  id: string;
  postId: string;
  type: 'ideate' | 'draft' | 'image' | 'seo' | 'publish';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: string;
  message: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

// API 엔드포인트 타입
export interface ApiEndpoints {
  // 포스트
  posts: {
    list: (params?: { page?: number; limit?: number }) => Promise<PaginatedResponse<Post>>;
    get: (id: string) => Promise<ApiResponse<Post>>;
    create: (data: CreatePostRequest) => Promise<ApiResponse<Post>>;
    update: (id: string, data: UpdatePostRequest) => Promise<ApiResponse<Post>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
    timeline: (id: string) => Promise<ApiResponse<TimelineEvent[]>>;
  };
  
  // 채널
  channels: {
    list: () => Promise<ApiResponse<Channel[]>>;
    get: (id: string) => Promise<ApiResponse<Channel>>;
    create: (data: CreateChannelRequest) => Promise<ApiResponse<Channel>>;
    update: (id: string, data: UpdateChannelRequest) => Promise<ApiResponse<Channel>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
  };
  
  // 워크스페이스
  workspaces: {
    list: () => Promise<ApiResponse<Workspace[]>>;
    get: (id: string) => Promise<ApiResponse<Workspace>>;
    create: (data: CreateWorkspaceRequest) => Promise<ApiResponse<Workspace>>;
    update: (id: string, data: UpdateWorkspaceRequest) => Promise<ApiResponse<Workspace>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
  };
  
  // 사용자
  user: {
    profile: () => Promise<ApiResponse<User>>;
    updateProfile: (data: UpdateProfileRequest) => Promise<ApiResponse<User>>;
  };
  
  // 작업
  jobs: {
    list: (params?: JobQueryParams) => Promise<PaginatedResponse<Job>>;
    get: (id: string) => Promise<ApiResponse<Job>>;
  };
}

// API 에러 타입
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API 클라이언트 설정
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

// API 요청 인터셉터
export type RequestInterceptor = (config: ApiRequestOptions) => ApiRequestOptions | Promise<ApiRequestOptions>;
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

export interface ApiClientInterceptors {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
  error?: ErrorInterceptor[];
}

// API 클라이언트 생성 옵션
export interface CreateApiClientOptions {
  config: ApiClientConfig;
  interceptors?: ApiClientInterceptors;
}

// API 응답 타입 가드
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as ApiError).success === false
  );
}

export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'data' in response &&
    (response as ApiResponse<T>).success === true
  );
}

// API 상태 타입
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  status: ApiStatus;
  data: T | null;
  error: ApiError | null;
  lastUpdated: number | null;
}

// API 훅을 위한 타입
export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseApiReturn<T> {
  data: T | null;
  error: ApiError | null;
  status: ApiStatus;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

