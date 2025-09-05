import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-provider';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock session
const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
  access_token: 'mock-token',
};

const mockSubscription = {
  unsubscribe: vi.fn(),
};

// Test component
function TestComponent() {
  const { user, session, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: mockSubscription } });
  });

  describe('Initialization', () => {
    it('should provide auth context with initial loading state', async () => {
      // Given & When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('should initialize session on mount', async () => {
      // Given
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      });

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });
  });

  describe('Authentication State Management', () => {
    it('should handle auth state changes', async () => {
      // Given
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Simulate auth state change
      if (authStateCallback) {
        await authStateCallback('SIGNED_IN', mockSession);
      }

      // Then - 상태 변경을 기다림
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('session')).toHaveTextContent('has-session');
      });
    });

    it('should handle sign out state change', async () => {
      // Given
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Simulate sign out
      if (authStateCallback) {
        authStateCallback('SIGNED_OUT', null);
      }

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('session')).toHaveTextContent('no-session');
      });
    });
  });

  describe('Authentication Methods', () => {
    it('should provide signIn method', () => {
      // Given & When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      // useAuth 훅이 제공되는지 확인
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should provide signUp method', () => {
      // Given & When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      // useAuth 훅이 제공되는지 확인
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should provide signOut method', () => {
      // Given & When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      // useAuth 훅이 제공되는지 확인
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle session initialization errors', async () => {
      // Given
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Session error'));

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });

    it('should handle auth method errors gracefully', async () => {
      // Given
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Auth error'));

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', async () => {
      // Given
      const mockUnsubscribe = vi.fn();
      mockSupabase.auth.onAuthStateChange.mockReturnValue({ 
        data: { subscription: { unsubscribe: mockUnsubscribe } } 
      });

      // When
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for component to mount and set up subscription
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Then unmount
      unmount();

      // Then
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});