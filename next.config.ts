import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode 활성화
  reactStrictMode: true,
  
  // 개발 환경에서 더 자세한 에러 정보 표시
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // 개발 서버에서 더 나은 에러 핸들링
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // 환경 변수 설정
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
};

export default nextConfig;
