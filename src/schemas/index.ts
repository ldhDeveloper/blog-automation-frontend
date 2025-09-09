import { z } from 'zod';

// 사용자 관련 스키마
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  role: z.enum(['owner', 'admin', 'member']),
  workspaceId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 워크스페이스 관련 스키마
export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 워크스페이스 생성 스키마
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, '워크스페이스 이름을 입력해주세요'),
  slug: z.string().min(1, 'URL 슬러그를 입력해주세요'),
  description: z.string().optional(),
  settings: z.object({
    allowMemberInvites: z.boolean(),
    requireApprovalForPosts: z.boolean(),
    defaultPostVisibility: z.enum(['public', 'members', 'private']),
  }),
});

// 워크스페이스 생성 요청 타입
export type CreateWorkspaceRequest = {
  name: string;
  slug: string;
  description?: string;
  settings: {
    allowMemberInvites: boolean;
    requireApprovalForPosts: boolean;
    defaultPostVisibility: 'public' | 'members' | 'private';
  };
};

// 포스트 관련 스키마
export const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  status: z.enum(['ideate', 'draft', 'image', 'seo', 'publish', 'published', 'failed']),
  channelId: z.string(),
  workspaceId: z.string(),
  authorId: z.string(),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 채널 관련 스키마
export const channelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  platform: z.string(),
  settings: z.record(z.string(), z.unknown()),
  workspaceId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 로그인 폼 스키마
export const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

// 회원가입 폼 스키마
export const signupSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
});

// 포스트 생성 폼 스키마 (다단계)
export const createPostSchema = z.object({
  // 1단계: 기본 정보
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  topic: z.string().min(1, '주제를 입력해주세요').max(100, '주제는 100자 이하로 입력해주세요'),
  keywords: z.string().max(500, '키워드는 500자 이하로 입력해주세요').optional(),
  
  // 2단계: 채널 선택
  channelIds: z.array(z.string()).min(1, '최소 하나의 채널을 선택해주세요'),
  
  // 3단계: 옵션 설정
  isPublic: z.boolean(),
  tags: z.array(z.string()),
  scheduledAt: z.string().optional(),
  allowComments: z.boolean(),
  notifyFollowers: z.boolean(),
  
  // 4단계: 내용 (선택사항)
  content: z.string().optional(),
  excerpt: z.string().max(300, '요약은 300자 이하로 입력해주세요').optional(),
});

// 포스트 생성 단계별 스키마
export const postStep1Schema = createPostSchema.pick({
  title: true,
  topic: true,
  keywords: true,
});

export const postStep2Schema = createPostSchema.pick({
  channelIds: true,
});

export const postStep3Schema = createPostSchema.pick({
  isPublic: true,
  tags: true,
  scheduledAt: true,
  allowComments: true,
  notifyFollowers: true,
});

export const postStep4Schema = createPostSchema.pick({
  content: true,
  excerpt: true,
});

// 채널 생성 폼 스키마
export const createChannelSchema = z.object({
  name: z.string().min(1, '채널명을 입력해주세요').max(100, '채널명은 100자 이하로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이하로 입력해주세요').optional(),
  platform: z.string().min(1, '플랫폼을 선택해주세요'),
  settings: z.record(z.string(), z.unknown()).default({}),
});

// API 응답 스키마
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.boolean(),
    message: z.string().optional(),
  });

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    success: z.boolean(),
    message: z.string().optional(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// 폼 타입 추론
export type CreatePostForm = z.infer<typeof createPostSchema>;
export type CreateChannelForm = z.infer<typeof createChannelSchema>;

// 포스트 생성 단계별 타입
export type PostStep1Form = z.infer<typeof postStep1Schema>;
export type PostStep2Form = z.infer<typeof postStep2Schema>;
export type PostStep3Form = z.infer<typeof postStep3Schema>;
export type PostStep4Form = z.infer<typeof postStep4Schema>;
