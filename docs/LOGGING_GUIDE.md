# 로깅 시스템 가이드

## 🎯 개요

이 프로젝트는 체계적인 로깅 시스템을 구축하여 개발, 디버깅, 모니터링을 지원합니다.

## 📁 로깅 구조

```
src/
├── lib/
│   ├── logger.ts          # 서버사이드 로깅 (Winston)
│   └── client-logger.ts   # 클라이언트사이드 로깅
├── hooks/
│   └── use-logger.ts      # React 로깅 훅
└── app/api/logs/
    └── route.ts           # 로그 수집 API

logs/                      # 로그 파일 저장소
├── error.log             # 에러 로그
├── combined.log          # 모든 로그
├── exceptions.log        # 예외 로그
└── rejections.log        # Promise 거부 로그
```

## 🔧 사용 방법

### 1. 서버사이드 로깅

```typescript
import { log } from '@/lib/logger';

// 기본 로깅
log.info('사용자가 로그인했습니다', { userId: '123' });
log.error('데이터베이스 연결 실패', { error: 'Connection timeout' });
log.warn('메모리 사용량이 높습니다', { usage: '85%' });
log.debug('디버그 정보', { data: someData });

// 성능 로깅
logPerformance('데이터베이스 쿼리', 150, { query: 'SELECT * FROM users' });

// 사용자 액션 로깅
logUserAction('포스트 생성', { postId: '456', userId: '123' });
```

### 2. 클라이언트사이드 로깅

```typescript
import { log } from '@/lib/client-logger';

// 기본 로깅
log.info('페이지 로드 완료', 'PAGE_LOAD');
log.error('API 요청 실패', 'API_ERROR', { status: 500 });

// API 요청 로깅
log.api('GET', '/api/posts', 200, 150, { success: true });

// 사용자 액션 로깅
log.userAction('버튼 클릭', { buttonId: 'submit' });

// 폼 유효성 검사 로깅
log.formValidation('login-form', true, {});
```

### 3. React Hook 사용

```typescript
import { useLogger, useFormLogger, useApiLogger } from '@/hooks/use-logger';

function MyComponent() {
  const logger = useLogger('MY_COMPONENT');
  const formLogger = useFormLogger('my-form');
  const apiLogger = useApiLogger();

  const handleSubmit = async (data) => {
    logger.info('폼 제출 시작', { data });
    
    try {
      const result = await apiLogger.logRequest(
        () => fetch('/api/data', { method: 'POST', body: JSON.stringify(data) }),
        'POST',
        '/api/data'
      );
      
      formLogger.logSubmit(data);
      logger.info('폼 제출 성공', { result });
    } catch (error) {
      logger.error('폼 제출 실패', { error });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 📊 로그 레벨

### 서버사이드 (Winston)
- **error**: 시스템 에러, 예외 상황
- **warn**: 경고, 잠재적 문제
- **info**: 일반적인 정보, 사용자 액션
- **http**: HTTP 요청/응답
- **debug**: 디버깅 정보

### 클라이언트사이드
- **error**: 클라이언트 에러, API 실패
- **warn**: 경고, 성능 문제
- **info**: 일반적인 정보, 사용자 액션
- **debug**: 디버깅 정보

## 🎨 로그 포맷

### 개발 환경
```
[14:30:25] INFO: 사용자가 로그인했습니다 {"userId":"123"}
[14:30:26] ERROR: API 요청 실패 {"status":500,"url":"/api/posts"}
```

### 프로덕션 환경 (JSON)
```json
{
  "timestamp": "2024-01-15T14:30:25.123Z",
  "level": "info",
  "message": "사용자가 로그인했습니다",
  "context": "AUTH",
  "userId": "123",
  "sessionId": "abc123"
}
```

## 🔍 로그 모니터링

### 1. 로컬 개발
```bash
# 실시간 로그 모니터링
tail -f logs/combined.log

# 에러 로그만 모니터링
tail -f logs/error.log

# 특정 레벨 필터링
grep "ERROR" logs/combined.log
```

### 2. 프로덕션 모니터링

#### Sentry 연동
```typescript
import * as Sentry from '@sentry/nextjs';

// 에러 로깅 시 Sentry로 전송
log.error('Critical error', { 
  context: 'PAYMENT',
  userId: '123',
  // Sentry에 추가 컨텍스트 전달
  extra: { paymentId: 'pay_456' }
});
```

#### LogRocket 연동
```typescript
import LogRocket from 'logrocket';

// 사용자 세션 추적
LogRocket.identify('user-123', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

## 📈 성능 로깅

### API 응답 시간 모니터링
```typescript
const startTime = Date.now();
const response = await fetch('/api/posts');
const duration = Date.now() - startTime;

log.performance('API 요청', duration, {
  endpoint: '/api/posts',
  method: 'GET',
  status: response.status
});
```

### 컴포넌트 렌더링 시간
```typescript
import { usePerformanceLogger } from '@/hooks/use-logger';

function ExpensiveComponent() {
  const { measure } = usePerformanceLogger('ExpensiveComponent');
  
  const expensiveOperation = async () => {
    // 무거운 작업
    return await processLargeData();
  };
  
  const handleClick = () => {
    measure(expensiveOperation);
  };
}
```

## 🚨 에러 추적

### 전역 에러 핸들러
```typescript
// app/error.tsx
import { logError } from '@/lib/logger';

export default function Error({ error, reset }) {
  useEffect(() => {
    logError(error, 'GLOBAL_ERROR_BOUNDARY', {
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }, [error]);
}
```

### API 에러 로깅
```typescript
// lib/api.ts
hooks: {
  beforeError: [
    (error) => {
      if (error instanceof HTTPError) {
        log.error('HTTP 에러', {
          status: error.response.status,
          url: error.response.url,
          message: error.message
        });
      }
      return error;
    }
  ]
}
```

## 🔒 보안 고려사항

### 민감한 정보 제외
```typescript
// ❌ 잘못된 예시
log.info('사용자 로그인', { 
  password: 'secret123',  // 민감한 정보
  token: 'jwt_token'      // 민감한 정보
});

// ✅ 올바른 예시
log.info('사용자 로그인', { 
  userId: '123',
  email: 'user@example.com',
  loginMethod: 'email'
});
```

### 로그 필터링
```typescript
// 민감한 필드 제거
const sanitizeData = (data: any) => {
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};
```

## 📋 로깅 체크리스트

### 개발 단계
- [ ] 컴포넌트별 로깅 컨텍스트 설정
- [ ] API 요청/응답 로깅 구현
- [ ] 사용자 액션 로깅 추가
- [ ] 에러 바운더리 로깅 설정

### 테스트 단계
- [ ] 로그 레벨별 출력 확인
- [ ] 민감한 정보 필터링 검증
- [ ] 성능 로깅 정확성 확인

### 배포 단계
- [ ] 프로덕션 로그 수집 서비스 연동
- [ ] 로그 보존 정책 설정
- [ ] 모니터링 대시보드 구성

## 🛠️ 유지보수

### 로그 로테이션
- 파일 크기: 5MB
- 보존 기간: 30일
- 압축: 자동 압축

### 로그 분석
```bash
# 에러 발생 빈도 분석
grep "ERROR" logs/combined.log | cut -d' ' -f4 | sort | uniq -c

# 사용자 액션 분석
grep "User action" logs/combined.log | jq '.meta.action' | sort | uniq -c

# 성능 문제 분석
grep "Performance" logs/combined.log | jq 'select(.meta.duration > 1000)'
```

## 🚀 향후 개선 계획

1. **구조화된 로깅**: JSON 스키마 기반 로그 검증
2. **실시간 모니터링**: WebSocket 기반 실시간 로그 스트리밍
3. **머신러닝 기반 분석**: 로그 패턴 분석 및 이상 탐지
4. **자동 알림**: 임계값 기반 자동 알림 시스템
