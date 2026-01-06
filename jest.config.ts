/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "babel",

  // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node",
  ],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },

  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // Options that will be passed to the testEnvironment
  testEnvironmentOptions: {
    customExportConditions: [""],
    // Add URL for jsdom
    url: "http://localhost:3000",
  },

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],

  // Specify different environments for different tests

  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  // Configure HTML reporter
  // Configure HTML reporter - dynamically set based on which tests are running
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath:
          process.env.JEST_HTML_REPORTERS_PUBLIC_PATH ||
          "./test-results/all-tests",
        filename: "report.html",
        openReport: "onFailure",
        expand: true,
        pageTitle: process.env.JEST_HTML_REPORTERS_TITLE || "Test Report",
        hideIcon: false,
        includeFailureMsg: true,
        includeConsoleLog: true,
        enableMergeData: true,
        dataMergeLevel: 1,
      },
    ],
  ],

  projects: [
    {
      displayName: "dom",
      testEnvironment: "jsdom",
      testMatch: [
        "**/__test__/units/**/*.test.ts",
        "**/__test__/units/**/*.test.tsx",
      ],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: [
        "**/__test__/integration/**/*.test.ts", // API routes
        "**/__test__/integration/**/*.test.tsx",
      ],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        useESM: true,
      },
    ],
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    "/node_modules/(?!(jose|@panva|next-auth)/)",
    "\\.pnp\\.[^\\/]+$",
  ],

  // Add this to handle ESM modules
  extensionsToTreatAsEsm: [".ts", ".tsx"],

  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
};

export default config;
