import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-provider';
import { createClient } from '@/lib/supabase';

// Supabase 모킹
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(),
}));

// 테스트용 컴포넌트
function TestComponent() {
  const { user, session, loading, signIn, signUp, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => signUp('test@example.com', 'password')}>
        Sign Up
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe('AuthProvider', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  };

  const mockSubscription = {
    unsubscribe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should provide auth context with initial loading state', async () => {
      // Given
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    });

    it('should initialize session on mount', async () => {
      // Given
      const mockSession = {
        user: { id: '1', email: 'test@example.com' },
        access_token: 'token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
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

      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    });
  });

  describe('Authentication State Management', () => {
    it('should handle auth state changes', async () => {
      // Given
      const mockSession = {
        user: { id: '1', email: 'test@example.com' },
        access_token: 'token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

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

      // Simulate auth state change using act wrapper
      await act(async () => {
        authStateCallback('SIGNED_IN', mockSession);
      });

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('session')).toHaveTextContent('has-session');
      });
    });

    it('should handle sign out state change', async () => {
      // Given
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

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

      // Simulate sign out
      authStateCallback('SIGNED_OUT', null);

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('session')).toHaveTextContent('no-session');
      });
    });
  });

  describe('Authentication Methods', () => {
    it('should provide signIn method', async () => {
      // Given
      const mockResponse = {
        data: { user: { email: 'test@example.com' } },
        error: null,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockResponse);
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should provide signUp method', async () => {
      // Given
      const mockResponse = {
        data: { user: { email: 'test@example.com' } },
        error: null,
      };

      mockSupabase.auth.signUp.mockResolvedValue(mockResponse);
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should provide signOut method', async () => {
      // Given
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle session initialization errors', async () => {
      // Given
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
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

    it('should handle auth method errors gracefully', async () => {
      // Given
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      // Given
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // When
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      // Then
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
