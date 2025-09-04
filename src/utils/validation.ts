// 🟢 GREEN: 테스트를 통과하는 최소한의 코드 작성

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 검증 (8자 이상)
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  return password.length >= 8;
}

/**
 * 필수 입력 검증
 */
export function validateRequired(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  return value.trim().length > 0;
}
