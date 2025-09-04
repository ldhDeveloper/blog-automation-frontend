import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateRequired } from './validation';

// 🔴 RED: 먼저 실패하는 테스트 작성
describe('validateEmail', () => {
  it('should return true for valid email format', () => {
    // Given
    const validEmail = 'test@example.com';
    
    // When
    const result = validateEmail(validEmail);
    
    // Then
    expect(result).toBe(true);
  });

  it('should return false for invalid email format', () => {
    // Given
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@example.com',
      'test.example.com',
      '',
    ];
    
    // When & Then
    invalidEmails.forEach(email => {
      expect(validateEmail(email)).toBe(false);
    });
  });

  it('should return false for null or undefined', () => {
    // Given & When & Then
    expect(validateEmail(null as any)).toBe(false);
    expect(validateEmail(undefined as any)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should return true for valid password (8+ characters)', () => {
    // Given
    const validPassword = 'password123';
    
    // When
    const result = validatePassword(validPassword);
    
    // Then
    expect(result).toBe(true);
  });

  it('should return false for password less than 8 characters', () => {
    // Given
    const shortPassword = '1234567';
    
    // When
    const result = validatePassword(shortPassword);
    
    // Then
    expect(result).toBe(false);
  });

  it('should return false for empty password', () => {
    // Given & When & Then
    expect(validatePassword('')).toBe(false);
    expect(validatePassword(null as any)).toBe(false);
    expect(validatePassword(undefined as any)).toBe(false);
  });
});

describe('validateRequired', () => {
  it('should return true for non-empty string', () => {
    // Given
    const nonEmptyString = 'test';
    
    // When
    const result = validateRequired(nonEmptyString);
    
    // Then
    expect(result).toBe(true);
  });

  it('should return false for empty string', () => {
    // Given
    const emptyString = '';
    
    // When
    const result = validateRequired(emptyString);
    
    // Then
    expect(result).toBe(false);
  });

  it('should return false for whitespace only string', () => {
    // Given
    const whitespaceString = '   ';
    
    // When
    const result = validateRequired(whitespaceString);
    
    // Then
    expect(result).toBe(false);
  });

  it('should return false for null or undefined', () => {
    // Given & When & Then
    expect(validateRequired(null as any)).toBe(false);
    expect(validateRequired(undefined as any)).toBe(false);
  });
});
