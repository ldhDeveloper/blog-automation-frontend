# UI 디버깅 가이드

## 1. 브라우저 개발자 도구 사용법

### 콘솔 탭
- **F12** 또는 **우클릭 → 검사**로 개발자 도구 열기
- **Console** 탭에서 로그 확인
- 필터링: `🔍`, `📝`, `🚀`, `❌` 등 이모지로 필터링 가능

### 네트워크 탭
- **Network** 탭에서 API 호출 확인
- 실패한 요청은 빨간색으로 표시
- 요청/응답 상세 정보 확인 가능

### React Developer Tools
- Chrome/Firefox 확장 프로그램 설치
- **Components** 탭에서 React 컴포넌트 상태 확인
- **Profiler** 탭에서 성능 분석

## 2. 개발 환경 디버깅 패널

개발 환경(`NODE_ENV=development`)에서만 표시되는 디버깅 패널:

- **현재 단계**: 현재 폼 단계와 전체 단계 수
- **현재 단계 유효성**: 현재 단계의 필드 유효성 상태
- **전체 폼 유효성**: 전체 폼의 유효성 상태
- **에러**: 폼 검증 에러 상세 정보
- **폼 값**: 현재 폼의 모든 값

## 3. 콘솔 로그 종류

### 🔍 현재 단계 유효성 검사
```javascript
{
  step: 1,
  fieldsToValidate: ['title', 'topic', 'keywords'],
  isStepValid: true,
  formValues: { title: 'test', topic: 'test', ... }
}
```

### 📝 필드 변경 감지
```javascript
{
  name: 'title',
  type: 'change',
  value: '새로운 제목'
}
```

### 🚀 폼 제출 시작
```javascript
{
  title: '제목',
  topic: '주제',
  // ... 모든 폼 데이터
}
```

### 📡 API 응답 상태
```javascript
200 OK
```

### ❌ API 에러
```javascript
{
  message: '에러 메시지',
  code: 'ERROR_CODE'
}
```

### 💥 포스트 생성 오류
```javascript
{
  error: '에러 메시지',
  stack: '스택 트레이스',
  data: { /* 폼 데이터 */ }
}
```

## 4. 일반적인 디버깅 시나리오

### 시나리오 1: "다음" 버튼이 활성화되지 않음
1. 디버깅 패널에서 "현재 단계 유효성" 확인
2. "에러" 섹션에서 어떤 필드에 문제가 있는지 확인
3. 콘솔에서 `🔍` 로그 확인

### 시나리오 2: 폼 제출이 실패함
1. 콘솔에서 `💥` 로그 확인
2. Network 탭에서 API 요청 상태 확인
3. `❌` 로그에서 API 에러 메시지 확인

### 시나리오 3: 필드 값이 저장되지 않음
1. `📝` 로그에서 필드 변경이 감지되는지 확인
2. "폼 값" 섹션에서 실제 저장된 값 확인
3. React Developer Tools에서 컴포넌트 상태 확인

## 5. 고급 디버깅 기법

### 브레이크포인트 설정
```javascript
// 코드에 직접 브레이크포인트 추가
debugger;

// 조건부 브레이크포인트
if (currentStep === 2) {
  debugger;
}
```

### React DevTools 사용
1. Components 탭에서 PostCreateForm 컴포넌트 선택
2. Props와 State 확인
3. Hooks 섹션에서 useForm 상태 확인

### 네트워크 요청 디버깅
1. Network 탭에서 XHR/Fetch 필터 적용
2. 실패한 요청 클릭하여 상세 정보 확인
3. Request/Response 헤더와 본문 확인

## 6. 프로덕션 환경 디버깅

프로덕션에서는 디버깅 패널이 표시되지 않으므로:

1. **Sentry** 같은 에러 모니터링 도구 사용
2. **로그 서비스** (예: LogRocket, Bugsnag) 연동
3. **사용자 피드백** 수집 시스템 구축

## 7. 성능 디버깅

### React Profiler 사용
1. React DevTools의 Profiler 탭
2. 녹화 시작 후 사용자 액션 수행
3. 성능 병목 지점 식별

### 메모리 사용량 확인
1. Chrome DevTools의 Memory 탭
2. 메모리 누수 확인
3. 컴포넌트 언마운트 시 정리 작업 확인
