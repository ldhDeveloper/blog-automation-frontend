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

// 포스트 생성 폼 스키마
export const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(10, '내용은 최소 10자 이상 입력해주세요'),
  channelId: z.string().min(1, '채널을 선택해주세요'),
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
