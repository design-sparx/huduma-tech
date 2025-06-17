/** @type {import("prettier").Config} */
const config = {
  // Core formatting
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "es5",
  tabWidth: 2,
  useTabs: false,

  // Line formatting
  printWidth: 80,
  endOfLine: "lf",

  // Bracket formatting
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "avoid",

  // Plugin configurations
  plugins: ["prettier-plugin-tailwindcss"],

  // File-specific overrides
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 120,
      },
    },
    {
      files: "*.md",
      options: {
        proseWrap: "always",
      },
    },
  ],
};

export default config;
