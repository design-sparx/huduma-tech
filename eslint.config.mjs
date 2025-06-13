import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  ...compat.plugins("simple-import-sort", "unused-imports", "import"),
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": "off", // Turn off base rule
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      // React specific rules
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": ["error", "never"],

      // General rules
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",

      // Import and sorting rules
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effect imports first
            ["^\\u0000"],
            // Node.js builtins
            ["^node:"],
            // React related packages
            ["^react", "^next"],
            // Other external packages
            ["^@?\\w"],
            // Internal packages (adjust path aliases as needed)
            ["^@/"],
            // Relative imports
            ["^\\."],
            // Type imports (should be last)
            ["^.+\\u0000$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",

      // Unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Import rules for better practices
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off", // TypeScript handles this
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "off", // Disabled duplicate
      "import/no-deprecated": "warn",
      "import/namespace": "off", // TypeScript handles this
      "import/default": "off", // TypeScript handles this
      "import/named": "off", // TypeScript handles this

      // Additional helpful rules
      "prefer-destructuring": [
        "error",
        {
          array: false,
          object: true,
        },
      ],
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "spaced-comment": ["error", "always", { exceptions: ["-", "+"] }],
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },
  },
];

export default eslintConfig;
