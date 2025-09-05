# 블로그 자동화 시스템 API 명세서

## 개요
블로그 자동화 시스템의 REST API 명세서입니다. 이 API는 Next.js App Router를 기반으로 구축되었으며, Supabase를 백엔드로 사용합니다.

## 기본 정보
- **Base URL**: `https://your-domain.com/api`
- **인증 방식**: JWT (Supabase Auth)
- **데이터 형식**: JSON
- **문자 인코딩**: UTF-8

## 공통 응답 형식

### 성공 응답
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
```

### 에러 응답
```typescript
interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

### 페이지네이션 응답
```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 인증

모든 API 엔드포인트는 JWT 토큰을 통한 인증이 필요합니다.

### 헤더
```
Authorization: Bearer <jwt_token>
```

### 인증 실패 응답
```json
{
  "success": false,
  "message": "인증이 필요합니다"
}
```

## API 엔드포인트

### 1. 포스트 관리

#### 1.1 포스트 생성
**POST** `/api/posts`

새로운 포스트를 생성합니다.

**요청 본문:**
```typescript
interface CreatePostRequest {
  title: string;           // 제목 (1-200자)
  topic: string;           // 주제 (1-100자)
  keywords?: string;       // 키워드 (최대 500자)
  channelIds: string[];    // 채널 ID 배열 (최소 1개)
  isPublic: boolean;       // 공개 여부
  tags: string[];          // 태그 배열
  scheduledAt?: string;    // 예약 발행 시간 (ISO 8601)
  allowComments: boolean;  // 댓글 허용 여부
  notifyFollowers: boolean; // 팔로워 알림 여부
  content?: string;        // 포스트 내용
  excerpt?: string;        // 요약 (최대 300자)
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "포스트 제목",
    "topic": "주제",
    "keywords": "키워드",
    "content": "포스트 내용",
    "excerpt": "요약",
    "is_public": true,
    "allow_comments": true,
    "notify_followers": true,
    "scheduled_at": "2024-01-01T00:00:00Z",
    "author_id": "user_id",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "포스트가 성공적으로 생성되었습니다"
}
```

**에러 응답:**
- `400`: 입력 데이터 유효성 검사 실패
- `401`: 인증 실패
- `500`: 서버 오류

#### 1.2 포스트 목록 조회
**GET** `/api/posts`

사용자의 포스트 목록을 조회합니다.

**쿼리 파라미터:**
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 10)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "포스트 제목",
      "status": "draft",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### 1.3 포스트 상세 조회
**GET** `/api/posts/{id}`

특정 포스트의 상세 정보를 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "포스트 제목",
    "content": "포스트 내용",
    "status": "draft",
    "channelId": "channel_id",
    "workspaceId": "workspace_id",
    "authorId": "author_id",
    "publishedAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "metadata": {
      "readTime": 5,
      "wordCount": 1000,
      "tags": ["tag1", "tag2"],
      "seoScore": 85
    }
  }
}
```

#### 1.4 포스트 수정
**PUT** `/api/posts/{id}`

기존 포스트를 수정합니다.

**요청 본문:** `CreatePostRequest`와 동일

**응답:** 수정된 포스트 데이터

#### 1.5 포스트 삭제
**DELETE** `/api/posts/{id}`

포스트를 삭제합니다.

**응답:**
```json
{
  "success": true,
  "message": "포스트가 성공적으로 삭제되었습니다"
}
```

### 2. 채널 관리

#### 2.1 채널 목록 조회
**GET** `/api/channels`

사용자의 채널 목록을 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "채널명",
      "description": "채널 설명",
      "platform": "youtube",
      "settings": {},
      "workspaceId": "workspace_id",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2.2 채널 생성
**POST** `/api/channels`

새로운 채널을 생성합니다.

**요청 본문:**
```typescript
interface CreateChannelRequest {
  name: string;                    // 채널명 (1-100자)
  description?: string;            // 설명 (최대 500자)
  platform: string;               // 플랫폼
  settings: Record<string, unknown>; // 설정
}
```

**응답:** 생성된 채널 데이터

#### 2.3 채널 수정
**PUT** `/api/channels/{id}`

채널 정보를 수정합니다.

#### 2.4 채널 삭제
**DELETE** `/api/channels/{id}`

채널을 삭제합니다.

### 3. 워크스페이스 관리

#### 3.1 워크스페이스 목록 조회
**GET** `/api/workspaces`

사용자가 속한 워크스페이스 목록을 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "워크스페이스명",
      "description": "워크스페이스 설명",
      "ownerId": "owner_id",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 3.2 워크스페이스 생성
**POST** `/api/workspaces`

새로운 워크스페이스를 생성합니다.

**요청 본문:**
```typescript
interface CreateWorkspaceRequest {
  name: string;        // 워크스페이스명 (1자 이상)
  description?: string; // 설명
}
```

#### 3.3 워크스페이스 멤버 관리
**POST** `/api/workspaces/{id}/members`

워크스페이스에 멤버를 초대합니다.

**요청 본문:**
```typescript
interface InviteMemberRequest {
  email: string;  // 초대할 사용자 이메일
  role: 'admin' | 'member';  // 역할
}
```

### 4. 사용자 관리

#### 4.1 사용자 프로필 조회
**GET** `/api/user/profile`

현재 사용자의 프로필 정보를 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "사용자명",
    "avatar": "https://example.com/avatar.jpg",
    "role": "owner",
    "workspaceId": "workspace_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.2 사용자 프로필 수정
**PUT** `/api/user/profile`

사용자 프로필을 수정합니다.

**요청 본문:**
```typescript
interface UpdateProfileRequest {
  name?: string;     // 이름
  avatar?: string;   // 아바타 URL
}
```

### 5. 작업 관리

#### 5.1 작업 목록 조회
**GET** `/api/jobs`

포스트 관련 작업 목록을 조회합니다.

**쿼리 파라미터:**
- `postId` (optional): 특정 포스트의 작업만 조회
- `status` (optional): 작업 상태로 필터링
- `page`, `limit`: 페이지네이션

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "postId": "post_id",
      "type": "image_generation",
      "status": "completed",
      "result": {},
      "error": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### 5.2 작업 상태 조회
**GET** `/api/jobs/{id}`

특정 작업의 상세 정보를 조회합니다.

### 6. 타임라인 이벤트

#### 6.1 포스트 타임라인 조회
**GET** `/api/posts/{id}/timeline`

포스트의 타임라인 이벤트를 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "postId": "post_id",
      "type": "draft",
      "status": "completed",
      "timestamp": "2024-01-01T00:00:00Z",
      "message": "포스트 초안이 완성되었습니다",
      "duration": 120,
      "error": null,
      "metadata": {}
    }
  ]
}
```

## 에러 코드

| 코드 | 설명 |
|------|------|
| 400 | 잘못된 요청 (유효성 검사 실패) |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 409 | 충돌 (중복된 리소스) |
| 422 | 처리할 수 없는 엔티티 |
| 500 | 서버 내부 오류 |

## 데이터 모델

### Post
```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  status: 'ideate' | 'draft' | 'image' | 'seo' | 'publish' | 'published' | 'failed' | 'generating' | 'ready';
  channelId: string;
  workspaceId: string;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    readTime?: number;
    wordCount?: number;
    tags?: string[];
    seoScore?: number;
  };
}
```

### Channel
```typescript
interface Channel {
  id: string;
  name: string;
  description?: string;
  platform: string;
  settings: Record<string, unknown>;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Workspace
```typescript
interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Job
```typescript
interface Job {
  id: string;
  postId: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
```

### TimelineEvent
```typescript
interface TimelineEvent {
  id: string;
  postId: string;
  type: 'ideate' | 'draft' | 'image' | 'seo' | 'publish';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: string;
  message: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}
```

## 인증 및 권한

### 역할 기반 접근 제어 (RBAC)

- **Owner**: 워크스페이스 소유자, 모든 권한
- **Admin**: 관리자, 사용자 관리 및 설정 변경 권한
- **Member**: 일반 멤버, 포스트 생성 및 수정 권한

### 권한 매트릭스

| 리소스 | Owner | Admin | Member |
|--------|-------|-------|--------|
| 워크스페이스 | CRUD | R | R |
| 채널 | CRUD | CRUD | R |
| 포스트 | CRUD | CRUD | CRUD (자신의 것만) |
| 사용자 | CRUD | CRUD | R (자신의 것만) |

## Rate Limiting

- **일반 API**: 분당 100회 요청
- **파일 업로드**: 분당 10회 요청
- **인증 API**: 분당 20회 요청

## 버전 관리

현재 API 버전: **v1**

버전은 URL 경로에 포함됩니다:
- `https://api.example.com/v1/posts`

## 변경 이력

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| v1.0 | 2024-01-01 | 초기 API 릴리스 |

## 지원

API 관련 문의사항이나 버그 리포트는 다음으로 연락해주세요:
- 이메일: support@example.com
- 문서: https://docs.example.com
