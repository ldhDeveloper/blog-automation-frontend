#!/usr/bin/env node

/**
 * 사용하지 않는 코드 정리 스크립트
 * ESLint와 TypeScript 컴파일러를 사용하여 사용하지 않는 코드를 감지하고 정리
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 출력을 위한 유틸리티
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'bold');
  console.log('='.repeat(50));
}

// ESLint 실행
function runESLint() {
  logSection('ESLint 실행 중...');
  
  try {
    const result = execSync('npm run lint', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    log('✅ ESLint 통과', 'green');
    return { success: true, output: result };
  } catch (error) {
    log('❌ ESLint 오류 발견', 'red');
    log(error.stdout || error.message, 'yellow');
    return { success: false, output: error.stdout || error.message };
  }
}

// TypeScript 컴파일러 실행
function runTypeScript() {
  logSection('TypeScript 컴파일러 실행 중...');
  
  try {
    const result = execSync('npx tsc --noEmit', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    log('✅ TypeScript 컴파일 통과', 'green');
    return { success: true, output: result };
  } catch (error) {
    log('❌ TypeScript 오류 발견', 'red');
    log(error.stdout || error.message, 'yellow');
    return { success: false, output: error.stdout || error.message };
  }
}

// 사용하지 않는 파일 감지
function findUnusedFiles() {
  logSection('사용하지 않는 파일 감지 중...');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = [];
  
  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(srcDir);
  
  const unusedFiles = [];
  
  for (const file of files) {
    // 파일이 다른 파일에서 import되는지 확인
    const isUsed = files.some(otherFile => {
      if (otherFile === file) return false;
      
      try {
        const content = fs.readFileSync(otherFile, 'utf8');
        const relativePath = path.relative(path.dirname(otherFile), file);
        const importPath = relativePath.replace(/\\/g, '/').replace(/\.(ts|tsx)$/, '');
        
        return content.includes(`from '${importPath}'`) || 
               content.includes(`from "./${importPath}"`) ||
               content.includes(`from "../${importPath}"`);
      } catch {
        return false;
      }
    });
    
    if (!isUsed && !file.includes('index.') && !file.includes('types.')) {
      unusedFiles.push(file);
    }
  }
  
  if (unusedFiles.length > 0) {
    log('⚠️ 사용하지 않는 파일 발견:', 'yellow');
    unusedFiles.forEach(file => {
      log(`  - ${path.relative(process.cwd(), file)}`, 'yellow');
    });
  } else {
    log('✅ 사용하지 않는 파일 없음', 'green');
  }
  
  return unusedFiles;
}

// 사용하지 않는 의존성 감지
function findUnusedDependencies() {
  logSection('사용하지 않는 의존성 감지 중...');
  
  try {
    const result = execSync('npx depcheck', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    log('✅ 의존성 검사 완료', 'green');
    log(result, 'cyan');
    return { success: true, output: result };
  } catch (error) {
    log('⚠️ depcheck 실행 실패 (설치되지 않음)', 'yellow');
    log('설치하려면: npm install -g depcheck', 'cyan');
    return { success: false, output: error.message };
  }
}

// 코드 정리 제안
function suggestCleanup(eslintResult, tsResult, unusedFiles) {
  logSection('코드 정리 제안');
  
  const suggestions = [];
  
  if (!eslintResult.success) {
    suggestions.push('ESLint 오류 수정');
  }
  
  if (!tsResult.success) {
    suggestions.push('TypeScript 오류 수정');
  }
  
  if (unusedFiles.length > 0) {
    suggestions.push('사용하지 않는 파일 제거');
  }
  
  if (suggestions.length === 0) {
    log('✅ 정리할 코드 없음', 'green');
    return;
  }
  
  log('다음 작업을 수행하세요:', 'yellow');
  suggestions.forEach((suggestion, index) => {
    log(`${index + 1}. ${suggestion}`, 'cyan');
  });
}

// 메인 실행 함수
function main() {
  log('🧹 사용하지 않는 코드 정리 스크립트 시작', 'bold');
  
  const eslintResult = runESLint();
  const tsResult = runTypeScript();
  const unusedFiles = findUnusedFiles();
  const depResult = findUnusedDependencies();
  
  suggestCleanup(eslintResult, tsResult, unusedFiles);
  
  logSection('정리 완료');
  
  if (eslintResult.success && tsResult.success && unusedFiles.length === 0) {
    log('🎉 모든 코드가 깔끔합니다!', 'green');
  } else {
    log('⚠️ 일부 정리가 필요합니다.', 'yellow');
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  runESLint,
  runTypeScript,
  findUnusedFiles,
  findUnusedDependencies,
  suggestCleanup,
};
