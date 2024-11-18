const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

// Renamed unused variables with a leading underscore to avoid ESLint warnings
const _HTTP_OK = 200;
const _HTTP_CREATED = 201;
const _HTTP_SERVER_ERROR = 500;

module.exports = [
  // Base configuration
  {
    ignores: ['*.html', '*.css', '*.svg', '*.jpg', '*.jpeg'], // Ignore irrelevant frontend files (frontend assets)
  },
  {
    files: ['**/*.{js,ts}'], // Apply to JavaScript and TypeScript files
    languageOptions: {
      parser: tsParser, // Use the TypeScript parser
      ecmaVersion: 2021, // ECMAScript version for modern JS features
      sourceType: 'module', // Enable ES module support
      globals: {
        // Declare global variables for Node.js (require, console, __dirname, process, module)
        require: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        module: 'readonly', // Add module as readonly
      },
    },
    plugins: {
      '@typescript-eslint': ts, // Use the TypeScript ESLint plugin
    },
    rules: {
      // General Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error, but warn on console.log
      quotes: ['error', 'single'], // Enforce single quotes
      semi: ['error', 'always'], // Enforce semicolons
      indent: ['error', 2], // Enforce 2-space indentation
      'no-unused-vars': 'off', // Disable default rule in favor of TypeScript rule
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }, // Ignore unused args/vars prefixed with "_"
      ],

      // Node.js/Express-Specific Rules
      'no-process-env': 'warn', // Warn when process.env is accessed directly
      'no-undef': 'error', // Disallow usage of undefined variables
      'no-shadow': 'error', // Disallow variable declarations from shadowing outer variables
      'no-duplicate-imports': 'error', // Disallow duplicate imports in the same file (cleaner code)

      // Allow specific magic numbers exceptions
      'no-magic-numbers': [
        'warn',
        {
          ignore: [3001, 2], // Ignore common magic numbers like port 3001 and indentation number 2
        },
      ],

      // TypeScript-Specific Rules
      '@typescript-eslint/no-explicit-any': 'warn', // Warn on 'any' usage
      '@typescript-eslint/no-var-requires': 'off', // Allow CommonJS require syntax (as typically used in Node.js)

      // Optional (can be useful for Node.js-specific checks):
      'no-new': 'warn', // Warn if a constructor function is used without an assignment
      'consistent-return': 'warn', // Ensure consistent return behavior in functions
    },
  },
  // TypeScript-specific configuration (for better TypeScript support)
  {
    files: ['**/*.ts'], // Apply only to TypeScript files
    parserOptions: {
      project: './tsconfig.json', // Use the TypeScript configuration
    },
  },
];
