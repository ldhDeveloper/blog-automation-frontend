# 블로그 자동화 서버 - Frontend

AI를 활용한 블로그 콘텐츠 자동 생성 시스템의 프론트엔드 웹 애플리케이션

## 🚀 기술 스택

- **Next.js 15** - React 기반 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Supabase** - 인증 및 실시간 데이터

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 홈페이지
├── components/         # React 컴포넌트
│   └── ui/            # shadcn/ui 컴포넌트
└── lib/               # 유틸리티 & 설정
    ├── api.ts         # API 클라이언트
    ├── supabase.ts    # Supabase 설정
    └── utils.ts       # 공통 유틸리티
```

## 🔧 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example`을 복사하여 `.env.local` 파일을 생성하고 환경 변수를 설정하세요:

```bash
cp .env.example .env.local
```

### 3. 개발 서버 실행
```bash
npm run dev
```

웹 애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📦 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 검사
- `npm run type-check` - TypeScript 타입 체크

## 🌐 배포

### Vercel 배포 (권장)
```bash
npm install -g vercel
vercel
```

### 기타 플랫폼
- **Netlify**: `npm run build` 후 `out` 폴더 배포
- **AWS S3**: Static export 후 S3 + CloudFront 배포
- **Docker**: 포함된 Dockerfile 사용

## 🔗 API 연동

백엔드 API와의 연동은 `src/lib/api.ts`에서 관리됩니다:

```typescript
// 환경 변수로 API URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API 클라이언트 사용 예시
import { apiClient } from '@/lib/api';

const data = await apiClient.get('/api/content');
```

## 🔐 인증

Supabase Auth를 사용한 인증 시스템:

```typescript
import { supabase } from '@/lib/supabase';

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// 로그아웃
await supabase.auth.signOut();
```

## 🎨 UI 컴포넌트

shadcn/ui 컴포넌트 사용:

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">클릭하세요</Button>
    </Card>
  );
}
```

## 📝 코딩 가이드라인

- **컴포넌트**: PascalCase (예: `UserProfile.tsx`)
- **함수형 컴포넌트** 우선 사용
- **TypeScript** 타입 정의 필수
- **Tailwind CSS** 스타일링 사용
- **ESLint** 규칙 준수

## 🔧 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:3001` |

## 🐛 문제 해결

### 일반적인 이슈

1. **빌드 실패**: `npm run type-check`로 타입 오류 확인
2. **환경 변수 오류**: `.env.local` 파일 확인
3. **API 연결 실패**: 백엔드 서버 실행 상태 확인

### 로그 확인
```bash
# 개발 환경 로그
npm run dev

# 프로덕션 빌드 로그
npm run build
```

## 🤝 기여하기

1. 이슈 또는 기능 요청 생성
2. 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이센스

MIT License - 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🔗 관련 링크

- [백엔드 저장소](../blog-automation-backend)
- [API 문서](./docs/api.md)
- [디자인 시스템](./docs/design-system.md)
- [배포 가이드](./docs/deployment.md)