import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
        document: "readonly",
        window: "readonly",
        confirm: "readonly",
      },
    },
    rules: {},
  },
  eslintConfigPrettier,
];
