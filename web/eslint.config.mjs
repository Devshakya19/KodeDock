import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
  {
    ignores: ["node_modules/", ".next/", "dist/"],
  },
];
