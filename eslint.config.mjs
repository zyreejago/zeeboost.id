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
      // Downgrade any to warning instead of error
      "@typescript-eslint/no-explicit-any": "warn",
      // Turn off unescaped entities errors
      "react/no-unescaped-entities": "off",
      // Turn off img element warnings
      "@next/next/no-img-element": "warn",
      // Make unused vars warnings instead of errors
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Make react hooks exhaustive deps a warning
      "react-hooks/exhaustive-deps": "warn"
    },
  },
];

export default eslintConfig;
