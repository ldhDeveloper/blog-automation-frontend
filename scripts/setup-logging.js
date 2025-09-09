#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 로그 디렉토리 생성
const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log('✅ 로그 디렉토리가 생성되었습니다:', logDir);
} else {
  console.log('📁 로그 디렉토리가 이미 존재합니다:', logDir);
}

// .gitignore에 로그 파일 추가
const gitignorePath = path.join(process.cwd(), '.gitignore');
const gitignoreContent = fs.existsSync(gitignorePath) 
  ? fs.readFileSync(gitignorePath, 'utf8') 
  : '';

if (!gitignoreContent.includes('logs/')) {
  const updatedContent = gitignoreContent + '\n# 로그 파일\nlogs/\n*.log\n';
  fs.writeFileSync(gitignorePath, updatedContent);
  console.log('✅ .gitignore에 로그 파일이 추가되었습니다');
} else {
  console.log('📝 .gitignore에 로그 파일이 이미 포함되어 있습니다');
}

// 환경 변수 예시 파일 생성
const envExamplePath = path.join(process.cwd(), '.env.example');
const envExampleContent = `# API 설정
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 로깅 설정
NODE_ENV=development
LOG_LEVEL=debug

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
`;

if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, envExampleContent);
  console.log('✅ .env.example 파일이 생성되었습니다');
} else {
  console.log('📝 .env.example 파일이 이미 존재합니다');
}

console.log('\n🎉 로깅 설정이 완료되었습니다!');
console.log('\n📋 다음 단계:');
console.log('1. .env 파일을 생성하고 필요한 환경 변수를 설정하세요');
console.log('2. 개발 서버를 시작하면 로그가 logs/ 디렉토리에 저장됩니다');
console.log('3. 프로덕션에서는 로그 수집 서비스(예: Sentry, LogRocket)를 연동하세요');
