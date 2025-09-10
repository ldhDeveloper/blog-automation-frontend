# 백엔드 JWT 통합 가이드

## 1. NestJS에서 Supabase JWT 처리

### A. JWT 검증 가드 생성

```typescript
// src/auth/supabase-jwt.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    try {
      // Supabase JWT 검증
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SUPABASE_JWT_SECRET, // Supabase JWT Secret
        issuer: process.env.SUPABASE_URL + '/auth/v1',
        audience: 'authenticated',
      });

      // 사용자 정보를 request에 추가
      request['user'] = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        metadata: payload.user_metadata,
        app_metadata: payload.app_metadata,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### B. 사용자 정보 데코레이터

```typescript
// src/auth/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### C. 컨트롤러에서 사용

```typescript
// src/workspaces/workspaces.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('workspaces')
@UseGuards(SupabaseJwtGuard)
export class WorkspacesController {
  @Get('current')
  getCurrentWorkspace(@CurrentUser() user: any) {
    return {
      message: '현재 워크스페이스',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    };
  }
}
```

## 2. 헤더에서 추가 정보 활용

프론트엔드에서 전달하는 헤더들을 활용:

```typescript
// src/auth/request-with-user.interface.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    metadata: any;
    app_metadata: any;
  };
}

// 헤더에서 추가 정보 추출
export function extractUserFromHeaders(request: RequestWithUser) {
  return {
    id: request.headers['x-user-id'] as string,
    email: request.headers['x-user-email'] as string,
    role: request.headers['x-user-role'] as string,
    metadata: request.headers['x-user-metadata'] 
      ? JSON.parse(request.headers['x-user-metadata'] as string)
      : null,
    app_metadata: request.headers['x-app-metadata']
      ? JSON.parse(request.headers['x-app-metadata'] as string)
      : null,
    session_id: request.headers['x-session-id'] as string,
    provider_token: request.headers['x-provider-token'] as string,
  };
}
```

## 3. 환경 변수 설정

```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. JWT 모듈 설정

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SUPABASE_JWT_SECRET,
      verifyOptions: {
        issuer: process.env.SUPABASE_URL + '/auth/v1',
        audience: 'authenticated',
      },
    }),
  ],
  providers: [SupabaseJwtGuard],
  exports: [SupabaseJwtGuard],
})
export class AuthModule {}
```

## 5. 에러 처리

```typescript
// src/filters/supabase-auth.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class SupabaseAuthFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 6. 테스트

```typescript
// src/workspaces/workspaces.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: SupabaseJwtGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## 7. 주요 포인트

1. **JWT Secret**: Supabase 대시보드에서 JWT Secret을 가져와야 함
2. **Issuer/Audience**: Supabase JWT의 issuer와 audience를 정확히 설정
3. **토큰 만료**: 프론트엔드에서 토큰 만료 시 자동 갱신 처리
4. **에러 처리**: 401 에러 시 프론트엔드에서 로그인 페이지로 리다이렉트
5. **보안**: 민감한 정보는 헤더가 아닌 JWT 페이로드에서 추출
