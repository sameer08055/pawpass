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
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      // Catch blocks and Express's (err, req, res, next) error-handler
      // signature both require a parameter name to exist even when it's
      // not used in the body — this is a language/framework requirement,
      // not a mistake, so we don't want ESLint flagging it.
      "no-unused-vars": [
        "error",
        {
          caughtErrors: "none",
          argsIgnorePattern: "^_|^next$",
        },
      ],
    },
  },
  eslintConfigPrettier,
];