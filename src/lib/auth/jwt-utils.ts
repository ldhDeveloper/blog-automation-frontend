/**
 * JWT 토큰 처리 유틸리티
 * JWT 토큰의 디코딩, 검증, 만료 확인 등을 담당
 */

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  aud: string;
  exp: number;
  iat: number;
  app_metadata?: any;
  user_metadata?: any;
  [key: string]: any;
}

/**
 * JWT 토큰을 Base64URL 디코딩하여 페이로드 추출
 */
export function decodeJwtPayload(accessToken: string): JwtPayload | null {
  try {
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Invalid JWT token format - expected 3 parts, got:', tokenParts.length);
      return null;
    }
    
    // Base64 URL 디코딩 (JWT는 Base64URL 인코딩 사용)
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    const payload = JSON.parse(atob(padded));
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error decoding JWT payload:', error);
    return null;
  }
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
export function extractUserInfoFromJwt(accessToken: string) {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    return null;
  }
  
  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    aud: payload.aud,
    exp: payload.exp,
    iat: payload.iat,
    app_metadata: payload.app_metadata,
    user_metadata: payload.user_metadata,
  };
}

/**
 * JWT 토큰 만료 여부 확인
 */
export function isJwtExpired(accessToken: string): boolean {
  const payload = decodeJwtPayload(accessToken);
  if (!payload || !payload.exp) {
    console.warn('Token validation failed - missing payload or exp');
    return true;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp < now;
  
  if (isExpired) {
    console.warn('Token expired:', {
      exp: payload.exp,
      now: now,
      timeUntilExpiry: payload.exp - now
    });
  }
  
  return isExpired;
}

/**
 * JWT 토큰이 곧 만료될 예정인지 확인 (기본 5분)
 */
export function shouldRefreshJwt(accessToken: string, refreshThresholdMinutes: number = 5): boolean {
  const payload = decodeJwtPayload(accessToken);
  if (!payload || !payload.exp) {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;
  const thresholdSeconds = refreshThresholdMinutes * 60;
  
  return timeUntilExpiry < thresholdSeconds;
}
