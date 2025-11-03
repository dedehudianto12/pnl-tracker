// jest.config.js
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],

  maxWorkers: 1,

  // Global setup/teardown
  globalSetup: "<rootDir>/__tests__/globalSetup.ts",
  globalTeardown: "<rootDir>/__tests__/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],

  // ESM configuration
  extensionsToTreatAsEsm: [".ts"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "NodeNext",
          esModuleInterop: true,
        },
      },
    ],
  },

  transformIgnorePatterns: ["node_modules/(?!(@faker-js)/)"],

  // Coverage
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Increase timeout for database operations
  testTimeout: 30000,
};
