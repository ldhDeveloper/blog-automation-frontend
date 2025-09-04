import { vi } from 'vitest';

// Supabase 클라이언트 모킹
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-access-token',
          user: {
            id: 'mock-user-id',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
};

// createClient 함수 모킹
export const createClient = vi.fn(() => mockSupabaseClient);

// 기본 모킹 설정
vi.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabaseClient,
  supabase: mockSupabaseClient,
}));
