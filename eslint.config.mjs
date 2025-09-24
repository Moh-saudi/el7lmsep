import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // إلغاء قواعد صارمة قد تسبب مشاكل
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "no-console": "off",
      "prefer-const": "warn",
      "no-var": "error",
      // إلغاء قواعد HTML التي تسبب مشاكل
      "@next/next/no-head-element": "off",
      "jsx-a11y/anchor-is-valid": "off",
    }
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "dist/",
      "public/sw.js",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "backup/**/*"
    ]
  }
];

export default eslintConfig;