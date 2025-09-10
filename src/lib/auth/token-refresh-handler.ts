/**
 * 토큰 갱신 처리 유틸리티
 * Supabase 토큰이 만료되었을 때 자동으로 갱신
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { shouldRefreshJwt } from './jwt-utils';

export interface TokenRefreshResult {
  success: boolean;
  newAccessToken?: string;
  newRefreshToken?: string;
  error?: string;
}

/**
 * 토큰 갱신 시도
 */
export async function refreshSupabaseToken(_request: NextRequest): Promise<TokenRefreshResult> {
  try {
    const supabase = await createClient();
    
    // 현재 세션 가져오기
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        success: false,
        error: 'No active session found',
      };
    }
    
    // 토큰 갱신 시도
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: session.refresh_token,
    });
    
    if (error) {
      console.error('Token refresh failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
    
    if (!data.session) {
      return {
        success: false,
        error: 'No session returned from refresh',
      };
    }
    
    return {
      success: true,
      newAccessToken: data.session.access_token,
      newRefreshToken: data.session.refresh_token,
    };
  } catch (error) {
    console.error('Token refresh exception:', error);
    return {
      success: false,
      error: 'Token refresh failed',
    };
  }
}

/**
 * API 프록시에서 토큰 갱신이 필요한지 확인
 */
export function shouldRefreshToken(accessToken: string): boolean {
  return shouldRefreshJwt(accessToken, 5); // 5분
}
