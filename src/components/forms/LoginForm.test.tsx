import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/utils';
import { LoginForm } from './LoginForm';

// 🔴 RED: 먼저 실패하는 테스트 작성
describe('LoginForm', () => {
  it('should render email and password input fields', () => {
    // Given & When
    render(<LoginForm onSubmit={vi.fn()} />);
    
    // Then
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data when form is submitted with valid data', async () => {
    // Given
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    // When
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    // Then
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation errors for invalid email format', async () => {
    // Given
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    // When
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123'); // 비밀번호는 유효하게
    await user.click(submitButton);
    
    // Then
    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일 형식을 입력해주세요/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for short password', async () => {
    // Given
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    // When
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.click(submitButton);
    
    // Then
    await waitFor(() => {
      expect(screen.getByText(/비밀번호는 8자 이상이어야 합니다/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('should show loading state when isLoading prop is true', () => {
    // Given & When
    render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);
    
    // Then
    expect(screen.getByRole('button', { name: /로그인 중.../i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    // Given
    const errorMessage = '로그인에 실패했습니다';
    
    // When
    render(<LoginForm onSubmit={vi.fn()} error={errorMessage} />);
    
    // Then
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should clear form after successful submission', async () => {
    // Given
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    // When
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    // Then
    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });
});
