/**
 * 보안 관련 유틸리티
 * CSRF 보호, 쿠키 보안, 입력 검증 등
 */

import { NextRequest } from 'next/server';

// CSRF 토큰 생성
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// CSRF 토큰 검증
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
}

// Origin 검증
export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    
    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2);
        return hostname === domain || hostname.endsWith('.' + domain);
      }
      return hostname === allowed;
    });
  } catch {
    return false;
  }
}

// Referer 검증
export function isValidReferer(referer: string | null, allowedHosts: string[]): boolean {
  if (!referer) return false;
  
  try {
    const url = new URL(referer);
    const hostname = url.hostname;
    
    return allowedHosts.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2);
        return hostname === domain || hostname.endsWith('.' + domain);
      }
      return hostname === allowed;
    });
  } catch {
    return false;
  }
}

// 요청 검증 (CSRF, Origin, Referer)
export function validateRequest(
  request: NextRequest,
  options: {
    allowedOrigins?: string[];
    allowedHosts?: string[];
    requireCSRF?: boolean;
    csrfToken?: string;
  } = {}
): {
  isValid: boolean;
  error?: string;
} {
  const {
    allowedOrigins = ['*'],
    allowedHosts = ['*'],
    requireCSRF = false,
    csrfToken,
  } = options;

  // Origin 검증
  const origin = request.headers.get('origin');
  if (origin && !isValidOrigin(origin, allowedOrigins)) {
    return {
      isValid: false,
      error: 'Invalid origin',
    };
  }

  // Referer 검증
  const referer = request.headers.get('referer');
  if (referer && !isValidReferer(referer, allowedHosts)) {
    return {
      isValid: false,
      error: 'Invalid referer',
    };
  }

  // CSRF 토큰 검증
  if (requireCSRF && csrfToken) {
    const requestCSRFToken = request.headers.get('x-csrf-token');
    if (!requestCSRFToken || !verifyCSRFToken(requestCSRFToken, csrfToken)) {
      return {
        isValid: false,
        error: 'Invalid CSRF token',
      };
    }
  }

  return { isValid: true };
}

// 쿠키 보안 설정
export const SECURE_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// 민감한 데이터 마스킹
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const middle = '*'.repeat(data.length - visibleChars * 2);
  
  return `${start}${middle}${end}`;
}

// 로그에서 민감한 정보 제거
export function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = maskSensitiveData(String(sanitized[key]));
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}

// Rate Limiting을 위한 간단한 메모리 캐시
class RateLimitCache {
  private cache = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.cache.get(key);

    if (!record || now > record.resetTime) {
      this.cache.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (now > record.resetTime) {
        this.cache.delete(key);
      }
    }
  }
}

// 전역 Rate Limiting 캐시
const rateLimitCache = new RateLimitCache(60000, 100); // 1분에 100회

// Rate Limiting 검증
export function checkRateLimit(
  identifier: string,
  windowMs: number = 60000,
  maxRequests: number = 100
): boolean {
  const key = `${identifier}:${Math.floor(Date.now() / windowMs)}`;
  return rateLimitCache.isAllowed(key);
}

// IP 주소 추출
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return request.ip || 'unknown';
}

// User Agent 검증
export function isValidUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  // 기본적인 봇 감지
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
  ];
  
  return !botPatterns.some(pattern => pattern.test(userAgent));
}

// 요청 크기 제한 검증
export function validateRequestSize(
  contentLength: string | null,
  maxSize: number = 10 * 1024 * 1024 // 10MB
): boolean {
  if (!contentLength) return true;
  
  const size = parseInt(contentLength, 10);
  return !isNaN(size) && size <= maxSize;
}
