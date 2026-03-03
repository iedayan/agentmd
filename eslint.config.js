import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
    {
        ignores: ["**/node_modules/", "**/dist/", "**/.next/", "**/build/", "**/*.json"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.es2021,
                React: "writable",
                NodeJS: "readonly",
                Thenable: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", {
                "args": "all",
                "argsIgnorePattern": "^_",
                "vars": "all",
                "varsIgnorePattern": "^_",
                "caughtErrors": "all",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "no-unused-vars": "off",
            "no-undef": "off",
            "no-console": "off",
            "@typescript-eslint/no-require-imports": "off",
            "no-useless-escape": "warn",
        },
    },
    {
        files: ["**/*.js", "**/*.mjs"],
        rules: {
            "no-undef": "error",
        }
    },
    {
        files: ["apps/dashboard/**/*.{ts,tsx,js,jsx}"],
        plugins: {
            "@next/next": nextPlugin,
            "react-hooks": reactHooksPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            "@next/next/no-html-link-for-pages": ["error", "apps/dashboard/src/app"],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    }
);
