import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 개발 환경에서 더 자세한 에러 정보 표시
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // 개발 서버에서 더 나은 에러 핸들링
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  // React Strict Mode 비활성화 (일시적으로)
  reactStrictMode: false,
};

export default nextConfig;
