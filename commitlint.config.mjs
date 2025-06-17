/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type enum - allowed commit types
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, etc)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "chore", // Maintenance tasks
        "ci", // CI/CD changes
        "build", // Build system changes
        "revert", // Reverting changes
        "release", // Release commits
      ],
    ],

    // Subject rules
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 72],

    // Type rules
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // Scope rules (optional but recommended for your service platform)
    "scope-case": [2, "always", "lower-case"],
    "scope-enum": [
      1,
      "always",
      [
        "auth", // Authentication related
        "booking", // Booking system
        "payments", // Payment processing
        "services", // Service management
        "users", // User management
        "providers", // Service provider management
        "ui", // UI components
        "api", // API related
        "db", // Database related
        "config", // Configuration
        "deps", // Dependencies
        "release", // Release related
      ],
    ],

    // Body and footer rules
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],

    // Header rules
    "header-max-length": [2, "always", 100],
  },
  ignores: [
    // Ignore release-it generated commit messages
    message => /^Release \d+\.\d+\.\d+/.test(message),
    message => /^chore: release/.test(message),
    message => /^v\d+\.\d+\.\d+/.test(message),
  ],
};

export default config;
