/**
 * PKCE (Proof Key for Code Exchange) 유틸리티
 * OAuth 2.0 PKCE 플로우를 위한 코드 생성 및 검증 함수들
 */

// PKCE 코드 생성 함수
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// PKCE 코드 챌린지 생성
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return base64URLEncode(new Uint8Array(digest));
}

// Base64 URL 인코딩
function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// PKCE 상태 저장 (쿠키 사용)
export function storePKCEState(state: string, verifier: string): void {
  if (typeof window === 'undefined') return;
  
  // 쿠키로 저장 (HttpOnly가 아닌 쿠키)
  document.cookie = `pkce_state=${state}; path=/; max-age=600; SameSite=Lax`;
  document.cookie = `pkce_verifier=${verifier}; path=/; max-age=600; SameSite=Lax`;
}

// PKCE 상태 검증 및 정리 (클라이언트 사이드)
export function validateAndClearPKCEState(state: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const storedState = getCookie('pkce_state');
  const verifier = getCookie('pkce_verifier');
  
  if (storedState !== state) {
    console.error('PKCE state mismatch');
    return null;
  }
  
  // 상태 정리
  document.cookie = 'pkce_state=; path=/; max-age=0';
  document.cookie = 'pkce_verifier=; path=/; max-age=0';
  
  return verifier;
}

// 쿠키에서 값 가져오기
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Supabase OAuth URL 생성 (PKCE 활성화된 클라이언트 사용)
export async function createSupabaseOAuthURL(
  provider: 'google' | 'github' | 'discord',
  redirectTo: string
): Promise<string> {
  console.log('PKCE URL 생성 시작:', { provider, redirectTo });
  
  try {
    // Supabase 클라이언트 생성 (PKCE 활성화됨)
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    
    // Supabase 클라이언트의 signInWithOAuth 사용 (PKCE 자동 처리)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // PKCE는 클라이언트에서 자동으로 처리됨
      },
    });
    
    if (error) {
      console.error('OAuth URL 생성 실패:', error);
      throw new Error(`OAuth URL 생성 실패: ${error.message}`);
    }
    
    console.log('Supabase OAuth URL (PKCE):', data.url);
    return data.url;
  } catch (error) {
    console.error('OAuth URL 생성 중 오류:', error);
    throw new Error('OAuth URL 생성에 실패했습니다.');
  }
}
