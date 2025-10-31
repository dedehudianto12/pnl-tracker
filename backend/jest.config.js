// jest.config.js
export default {
  // Use the ts-jest preset configured for ES Modules
  preset: "ts-jest/presets/default-esm",

  // Use the Node environment for running tests
  testEnvironment: "node",

  // Jest's main entry point for running tests
  testMatch: ["**/__tests__/**/*.test.ts"],

  // 1. GLOBAL SETUP/TEARDOWN: Runs ONCE for resource setup/cleanup (e.g., DB schema)
  globalSetup: "<rootDir>/__tests__/globalSetup.ts",
  globalTeardown: "<rootDir>/__tests__/globalTeardown.ts",

  // 2. PER-ENVIRONMENT SETUP: Runs BEFORE EACH test file (for Jest hooks like beforeEach)
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],

  // **TS-JEST / ESM SPECIFIC CONFIGURATION**

  // Explicitly treat .ts files as ESM
  extensionsToTreatAsEsm: [".ts"],

  // Essential for allowing ESM imports like 'import X from "file"' without file extensions,
  // and mapping .js imports (required by Node ESM) back to .ts source files.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Transform configuration for ts-jest
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        // Tell ts-jest to output ES modules
        useESM: true,
        // Recommended for faster performance by skipping some type checking
        isolatedModules: true,
        tsconfig: {
          // Use modern module resolution that supports ESM features
          module: "ESNext",
          moduleResolution: "NodeNext",
          esModuleInterop: true,
        },
      },
    ],
  },

  // Ignore node_modules except for specific ESM packages that need transformation
  transformIgnorePatterns: ["node_modules/(?!(@faker-js)/)"],

  // Coverage configuration (inherited from your previous setup)
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
