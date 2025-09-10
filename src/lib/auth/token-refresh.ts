/**
 * 토큰 갱신 유틸리티
 * 백그라운드에서 자동으로 토큰 갱신 처리
 */

import { getTokenExpiration } from './cookie-session';

// 토큰 갱신 설정
const REFRESH_CONFIG = {
  // 토큰이 만료 5분 전에 갱신
  REFRESH_BEFORE_EXPIRY: 5 * 60 * 1000, // 5분
  // 갱신 실패 시 재시도 간격
  RETRY_INTERVAL: 30 * 1000, // 30초
  // 최대 재시도 횟수
  MAX_RETRIES: 3,
};

/**
 * 토큰 갱신이 필요한지 확인
 */
export function shouldRefreshToken(accessToken: string): boolean {
  if (!accessToken) return false;
  
  const expiration = getTokenExpiration(accessToken);
  if (!expiration) return true;
  
  const timeUntilExpiry = expiration - Date.now();
  return timeUntilExpiry < REFRESH_CONFIG.REFRESH_BEFORE_EXPIRY;
}

/**
 * 토큰 갱신 요청
 */
export async function refreshToken(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || 'Token refresh failed',
      };
    }

    const data = await response.json();
    return {
      success: data.success || false,
      error: data.error,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * 자동 토큰 갱신 스케줄러
 */
export class TokenRefreshScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private isRefreshing = false;

  constructor(private onRefreshSuccess?: () => void, private onRefreshFailure?: () => void) {}

  /**
   * 토큰 갱신 스케줄러 시작
   */
  start(accessToken: string) {
    this.stop(); // 기존 스케줄러 정리

    if (!accessToken) return;

    // 즉시 체크
    this.checkAndRefresh(accessToken);

    // 1분마다 체크
    this.intervalId = setInterval(() => {
      this.checkAndRefresh(accessToken);
    }, 60000);
  }

  /**
   * 토큰 갱신 스케줄러 중지
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.retryCount = 0;
    this.isRefreshing = false;
  }

  /**
   * 토큰 갱신 필요 여부 확인 및 갱신
   */
  private async checkAndRefresh(accessToken: string) {
    if (this.isRefreshing) return;

    if (!shouldRefreshToken(accessToken)) {
      this.retryCount = 0; // 갱신이 필요하지 않으면 재시도 카운트 리셋
      return;
    }

    this.isRefreshing = true;

    try {
      const result = await refreshToken();

      if (result.success) {
        this.retryCount = 0;
        this.onRefreshSuccess?.();
      } else {
        this.handleRefreshFailure(result.error);
      }
    } catch (error) {
      console.error('Token refresh check error:', error);
      this.handleRefreshFailure(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 갱신 실패 처리
   */
  private handleRefreshFailure(error?: string) {
    this.retryCount++;

    console.warn(`Token refresh failed (attempt ${this.retryCount}):`, error);

    if (this.retryCount >= REFRESH_CONFIG.MAX_RETRIES) {
      console.error('Max token refresh retries reached, logging out');
      this.stop();
      this.onRefreshFailure?.();
    } else {
      // 재시도 스케줄링
      setTimeout(() => {
        this.isRefreshing = false;
      }, REFRESH_CONFIG.RETRY_INTERVAL);
    }
  }
}

/**
 * 전역 토큰 갱신 스케줄러 인스턴스
 */
let globalScheduler: TokenRefreshScheduler | null = null;

/**
 * 전역 토큰 갱신 스케줄러 시작
 */
export function startGlobalTokenRefresh(
  accessToken: string,
  onRefreshSuccess?: () => void,
  onRefreshFailure?: () => void
) {
  stopGlobalTokenRefresh();

  globalScheduler = new TokenRefreshScheduler(onRefreshSuccess, onRefreshFailure);
  globalScheduler.start(accessToken);
}

/**
 * 전역 토큰 갱신 스케줄러 중지
 */
export function stopGlobalTokenRefresh() {
  if (globalScheduler) {
    globalScheduler.stop();
    globalScheduler = null;
  }
}

/**
 * 수동 토큰 갱신 (사용자 액션에 의한)
 */
export async function manualTokenRefresh(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await refreshToken();
    
    if (result.success) {
      // 성공 시 페이지 새로고침으로 최신 세션 정보 가져오기
      window.location.reload();
    }
    
    return result;
  } catch (error) {
    console.error('Manual token refresh error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
