/**
 * Supabase 토큰 추출 유틸리티
 * @supabase/ssr를 사용하여 서버사이드에서 토큰을 추출
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { extractUserInfoFromJwt, isJwtExpired } from './jwt-utils';

export interface SupabaseTokenInfo {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
  session: any | null;
}

/**
 * NextRequest에서 Supabase 토큰 정보를 추출
 */
export async function getSupabaseTokensFromRequest(_request: NextRequest): Promise<SupabaseTokenInfo> {
  try {
    const supabase = await createClient();
    
    // Supabase 세션 가져오기
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('🔍 Supabase Token Debug:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      hasRefreshToken: !!session?.refresh_token,
      hasUser: !!session?.user,
      error: error?.message || null
    });
    
    if (error) {
      console.warn('Failed to get Supabase session:', error);
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
        session: null,
      };
    }
    
    if (!session) {
      console.warn('No Supabase session found');
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
        session: null,
      };
    }
    
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: session.user,
      session: session,
    };
  } catch (error) {
    console.error('Error extracting Supabase tokens:', error);
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      session: null,
    };
  }
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
export function extractUserInfoFromToken(accessToken: string) {
  return extractUserInfoFromJwt(accessToken);
}

/**
 * 토큰 만료 여부 확인
 */
export function isTokenExpired(accessToken: string): boolean {
  return isJwtExpired(accessToken);
}
