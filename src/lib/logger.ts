import path from 'path';
import winston from 'winston';

// 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 로그 레벨에 따른 색상 정의
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 로그 포맷 정의 (사용하지 않음)
// const format = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
//   winston.format.colorize({ all: true }),
//   winston.format.printf(
//     (info) => `${info.timestamp} ${info.level}: ${info.message}`
//   )
// );

// 콘솔용 포맷 (개발 환경)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// 파일용 포맷 (프로덕션 환경)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 전송할 로그 레벨 결정
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// 로그 파일 저장 경로
const logDir = path.join(process.cwd(), 'logs');

// Winston 로거 생성
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 로그 레벨별 헬퍼 함수들
export const log = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  http: (message: string, meta?: any) => {
    logger.http(message, meta);
  },
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },
};

// API 요청 로깅을 위한 미들웨어
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };
    
    if (res.statusCode >= 400) {
      log.error(`HTTP ${res.statusCode}`, logData);
    } else {
      log.http(`${req.method} ${req.url}`, logData);
    }
  });
  
  next();
};

// 에러 로깅 헬퍼
export const logError = (error: Error, context?: string, meta?: any) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    ...meta,
  };
  
  log.error(`Error in ${context || 'unknown context'}`, errorData);
};

// 성능 로깅 헬퍼
export const logPerformance = (operation: string, duration: number, meta?: any) => {
  const performanceData = {
    operation,
    duration: `${duration}ms`,
    ...meta,
  };
  
  if (duration > 1000) {
    log.warn(`Slow operation: ${operation}`, performanceData);
  } else {
    log.info(`Performance: ${operation}`, performanceData);
  }
};

// 사용자 액션 로깅 헬퍼
export const logUserAction = (action: string, userId?: string, meta?: any) => {
  const userActionData = {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  
  log.info(`User action: ${action}`, userActionData);
};

export default logger;
