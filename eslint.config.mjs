import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      
      // 사용하지 않는 코드 제거 규칙
      "@typescript-eslint/no-unused-imports": "error",
      "no-unused-vars": "off", // TypeScript 버전 사용
      "import/no-unused-modules": "error",
      "import/no-unresolved": "error",
      
      // 코드 정리 관련 규칙
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": "warn",
      "no-debugger": "error",
    },
  },
];

export default eslintConfig;
