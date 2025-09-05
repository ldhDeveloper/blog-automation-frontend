# API 문서

이 디렉토리는 블로그 자동화 시스템의 API 문서를 포함합니다.

## 문서 구조

- `API_SPECIFICATION.md` - 상세한 API 명세서 (한국어)
- `openapi.yaml` - OpenAPI 3.0 스펙 파일
- `README.md` - 이 파일

## API 개요

블로그 자동화 시스템은 Next.js App Router와 Supabase를 기반으로 구축된 REST API를 제공합니다.

### 주요 기능

- **포스트 관리**: 포스트 생성, 조회, 수정, 삭제
- **채널 관리**: 다양한 플랫폼 채널 관리
- **워크스페이스 관리**: 팀 협업을 위한 워크스페이스
- **사용자 관리**: 프로필 및 권한 관리
- **작업 관리**: 백그라운드 작업 추적
- **타임라인**: 포스트 생성 과정 추적

### 인증

모든 API 엔드포인트는 JWT 토큰을 통한 인증이 필요합니다.

```http
Authorization: Bearer <jwt_token>
```

### 기본 URL

- **개발**: `http://localhost:3000/api`
- **프로덕션**: `https://your-domain.com/api`

## 빠른 시작

### 1. 포스트 생성

```typescript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: '새 포스트',
    topic: '기술',
    channelIds: ['channel-id'],
    isPublic: true,
    tags: ['블로그'],
    allowComments: true,
    notifyFollowers: true
  })
});

const data = await response.json();
```

### 2. 포스트 목록 조회

```typescript
const response = await fetch('/api/posts?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

### 3. 채널 목록 조회

```typescript
const response = await fetch('/api/channels', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

## 에러 처리

API는 표준 HTTP 상태 코드와 함께 JSON 형식의 에러 응답을 반환합니다.

```typescript
interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

### 일반적인 에러 코드

- `400` - 잘못된 요청 (유효성 검사 실패)
- `401` - 인증 실패
- `403` - 권한 없음
- `404` - 리소스를 찾을 수 없음
- `500` - 서버 내부 오류

## 페이지네이션

목록 조회 API는 페이지네이션을 지원합니다.

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 타입 안전성

TypeScript를 사용하는 경우, `src/types/api-client.ts`에서 제공하는 타입 정의를 사용하세요.

```typescript
import { CreatePostRequest, ApiResponse, Post } from '@/types/api-client';

const createPost = async (data: CreatePostRequest): Promise<ApiResponse<Post>> => {
  // API 호출 로직
};
```

## OpenAPI 스펙

OpenAPI 3.0 스펙 파일(`openapi.yaml`)을 사용하여 API 문서를 생성하거나 클라이언트 코드를 생성할 수 있습니다.

### Swagger UI로 문서 보기

```bash
# Swagger UI 설치
npm install -g swagger-ui-serve

# 문서 서빙
swagger-ui-serve docs/openapi.yaml
```

### 클라이언트 코드 생성

```bash
# OpenAPI Generator 설치
npm install -g @openapitools/openapi-generator-cli

# TypeScript 클라이언트 생성
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-fetch \
  -o src/generated/api-client
```

## 개발 가이드

### 새로운 엔드포인트 추가

1. `src/app/api/` 디렉토리에 새로운 라우트 파일 생성
2. `src/types/api-client.ts`에 타입 정의 추가
3. `docs/openapi.yaml`에 엔드포인트 스펙 추가
4. `docs/API_SPECIFICATION.md`에 문서 업데이트

### API 테스트

```bash
# 개발 서버 실행
npm run dev

# API 테스트 (예시)
curl -X GET http://localhost:3000/api/posts \
  -H "Authorization: Bearer your-token"
```

## 버전 관리

API 버전은 URL 경로에 포함됩니다:

- `v1`: 현재 버전
- `v2`: 향후 버전 (계획됨)

## 지원

API 관련 문의사항이나 버그 리포트는 다음으로 연락해주세요:

- 이메일: support@example.com
- 문서: https://docs.example.com
- GitHub Issues: https://github.com/your-repo/issues

