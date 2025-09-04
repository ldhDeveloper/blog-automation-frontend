# 블로그 자동화 서버 - Cursor Rules

이 디렉토리는 블로그 자동화 서버 프로젝트의 개발 가이드라인과 모범 사례를 정의한 Cursor rules를 포함합니다.

## 📋 규칙 목록

### 🚨 최우선 규칙
- **[context7-mcp.mdc](./context7-mcp.mdc)** - Context7 MCP를 통한 최신 라이브러리 문서 확인 및 활용 가이드라인

### 🎯 핵심 아키텍처
- **[hexagonal-architecture.mdc](./hexagonal-architecture.mdc)** - 헥사고날 아키텍처 및 CQRS 패턴 구현 가이드라인
- **[typescript.mdc](./typescript.mdc)** - TypeScript 타입 안전성 및 코드 품질 가이드라인

### 🎨 프론트엔드
- **[nextjs.mdc](./nextjs.mdc)** - Next.js 프론트엔드 개발 가이드라인 및 모범 사례

### 🔧 백엔드
- **[nestjs.mdc](./nestjs.mdc)** - NestJS 백엔드 개발 가이드라인 및 모범 사례

### 💾 데이터베이스 & 외부 서비스
- **[drizzle-orm.mdc](./drizzle-orm.mdc)** - Drizzle ORM 스키마 정의, 쿼리 작성, 마이그레이션 가이드라인
- **[supabase.mdc](./supabase.mdc)** - Supabase 인증, 데이터베이스, 보안 정책 가이드라인

### 🔒 보안 & 성능
- **[security-performance.mdc](./security-performance.mdc)** - 보안 및 성능 최적화 가이드라인

### 📝 기본 규칙
- **[cursor_rules.mdc](./cursor_rules.mdc)** - Cursor rule 작성 가이드라인

## 🚀 사용법

이 규칙들은 Cursor IDE에서 자동으로 적용되며, 다음과 같은 경우에 활성화됩니다:

- **프론트엔드 개발**: `frontend/**/*.{ts,tsx}` 파일 작업 시
- **백엔드 개발**: `backend/src/**/*.ts` 파일 작업 시
- **데이터베이스 스키마**: `backend/src/infrastructure/database/schema/*.ts` 파일 작업 시
- **설정 파일**: `drizzle.config.ts`, `*.sql` 파일 작업 시

## 📐 아키텍처 개요

### 헥사고날 아키텍처 레이어

```
┌─────────────────────────────────────┐
│          Interfaces Layer          │
│    (Controllers, GraphQL, etc.)    │
├─────────────────────────────────────┤
│         Application Layer          │
│    (CQRS Commands & Queries)       │
├─────────────────────────────────────┤
│           Domain Layer             │
│    (Entities, Value Objects)       │
├─────────────────────────────────────┤
│        Infrastructure Layer        │
│  (Database, External APIs, etc.)   │
└─────────────────────────────────────┘
```

### 기술 스택별 규칙 매핑

| 기술 스택 | 관련 규칙 파일 | 주요 내용 |
|-----------|----------------|-----------|
| **🚨 최신 문서** | `context7-mcp.mdc` | Context7 MCP 최신 문서 확인 (작업 전 필수) |
| **Next.js** | `nextjs.mdc` | App Router, shadcn/ui, 컴포넌트 패턴 |
| **NestJS** | `nestjs.mdc` | 모듈 구조, 의존성 주입, 예외 처리 |
| **TypeScript** | `typescript.mdc` | 타입 정의, 제네릭, 유틸리티 타입 |
| **Drizzle ORM** | `drizzle-orm.mdc` | 스키마 정의, 쿼리 패턴, 마이그레이션 |
| **Supabase** | `supabase.mdc` | 인증, RLS, 실시간 기능 |
| **보안/성능** | `security-performance.mdc` | 인증, 캐싱, 최적화 |

## 🎯 핵심 원칙

### 0. **🚨 최신 문서 우선 (Context7 MCP)**
- 모든 작업 전 Context7 MCP를 통한 최신 라이브러리 문서 확인 필수
- 추측이나 오래된 정보 기반 코딩 금지
- 공식 문서의 모범 사례 및 최신 API 활용

### 1. **타입 안전성**
- 모든 코드에서 명시적 타입 정의
- `any` 타입 사용 금지
- 제네릭과 유틸리티 타입 적극 활용

### 2. **아키텍처 준수**
- 헥사고날 아키텍처의 레이어 분리
- CQRS 패턴으로 Command/Query 분리
- 의존성 방향 준수 (Domain ← Application ← Infrastructure/Interfaces)

### 3. **보안 우선**
- JWT 토큰 검증
- 입력 데이터 검증 및 살균화
- Row Level Security (RLS) 정책 적용
- Rate Limiting 구현

### 4. **성능 최적화**
- 페이지네이션 구현
- 적절한 캐싱 전략
- React 최적화 (memo, useMemo, useCallback)
- 데이터베이스 인덱스 활용

### 5. **코드 품질**
- 일관된 네이밍 규칙
- 적절한 에러 처리
- 구조화된 로깅
- 테스트 가능한 코드 작성

## 🔄 규칙 업데이트

새로운 패턴이나 요구사항이 생길 때마다 해당 규칙 파일을 업데이트하세요:

1. **패턴 발견**: 반복되는 코드 패턴 식별
2. **규칙 추가**: 해당 기술 스택의 규칙 파일에 추가
3. **예제 포함**: 좋은 예제와 피해야 할 예제 모두 포함
4. **기존 코드 참조**: 실제 프로젝트 코드를 참조하여 구체적인 가이드라인 제공

## 📚 관련 문서

- [프로젝트 README](../README.md) - 전체 프로젝트 개요
- [Taskmaster 워크플로우](.taskmaster/README.md) - 개발 작업 관리
- [API 문서](./docs/api.md) - API 명세서 (추후 추가)

---

이 규칙들을 통해 일관되고 안전하며 확장 가능한 코드베이스를 유지할 수 있습니다. 궁금한 점이 있거나 새로운 규칙이 필요한 경우 언제든지 팀과 논의하세요.
