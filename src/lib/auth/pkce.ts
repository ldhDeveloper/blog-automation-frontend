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

// PKCE 상태 저장
export function storePKCEState(state: string, verifier: string): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.setItem('pkce_state', state);
  sessionStorage.setItem('pkce_verifier', verifier);
}

// PKCE 상태 검증 및 정리
export function validateAndClearPKCEState(state: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const storedState = sessionStorage.getItem('pkce_state');
  const verifier = sessionStorage.getItem('pkce_verifier');
  
  if (storedState !== state) {
    console.error('PKCE state mismatch');
    return null;
  }
  
  // 상태 정리
  sessionStorage.removeItem('pkce_state');
  sessionStorage.removeItem('pkce_verifier');
  
  return verifier;
}

// Supabase OAuth URL 생성
export function createSupabaseOAuthURL(
  provider: 'google' | 'github' | 'discord',
  redirectTo: string
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  // PKCE 상태 및 코드 생성
  const state = generateCodeVerifier();
  const codeVerifier = generateCodeVerifier();
  
  // 상태 저장
  storePKCEState(state, codeVerifier);
  
  // OAuth URL 생성
  const params = new URLSearchParams({
    provider,
    redirect_to: redirectTo,
    state,
  });
  
  return `${supabaseUrl}/auth/v1/authorize?${params.toString()}`;
}
