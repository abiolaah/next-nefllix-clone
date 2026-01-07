import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Timeout configuration */
  timeout: 30000, // 30 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for each expect assertion
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* Reporter configuration */
  reporter: process.env.CI
    ? [
        ["html", { outputFolder: "playwright-report" }], // HTML report
        ["json", { outputFile: "test-results/e2e-results.json" }], // 🎯 JSON report for CI
        ["github"], // GitHub Actions annotations
        ["list"], // Console output
      ]
    : [
        ["html"], // HTML report
        ["list"], // Console output
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    /* 🎯 SCREENSHOT CONFIGURATION */
    // Options: 'off', 'on', 'only-on-failure', 'retain-on-failure'
    screenshot: "only-on-failure", // ✅ Takes screenshot on test failure

    /* 🎯 VIDEO CONFIGURATION (optional) */
    // Options: 'off', 'on', 'retain-on-failure', 'on-first-retry'
    video: "retain-on-failure", // ✅ Records video on failure

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.Ci ? "on-first-retry" : "on-first-retry",

    /* Action timeout */
    actionTimeout: 10000,

    /* Navigation timeout */
    navigationTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs FIRST to create auth state
    {
      name: "setup",
      testMatch: /.*\.setup\.ts$/,
      testDir: "./tests/e2e",
    },

    // ============================================
    // Authenticated Tests (require login)
    // ============================================
    {
      name: "chromium:authenticated",
      testDir: "./tests/e2e/authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
        screenshot: "only-on-failure", // Can override per project
        video: "retain-on-failure", // Can override per project
      },
      dependencies: ["setup"],
    },

    {
      name: "firefox:authenticated",
      testDir: "./tests/e2e/authenticated",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "playwright/.auth/user.json",
        screenshot: "only-on-failure", // Can override per project
        video: "retain-on-failure", // Can override per project
      },
      dependencies: ["setup"],
    },

    {
      name: "webkit:authenticated",
      testDir: "./tests/e2e/authenticated",
      use: {
        ...devices["Desktop Safari"],
        storageState: "playwright/.auth/user.json",
        screenshot: "only-on-failure", // Can override per project
        video: "retain-on-failure", // Can override per project
      },
      dependencies: ["setup"],
    },

    // ============================================
    // Public Tests (no authentication needed)
    // ============================================
    {
      name: "chromium:public",
      testDir: "./tests/e2e/public",
      use: {
        ...devices["Desktop Chrome"], // No storageState - tests run without authentication
        screenshot: "only-on-failure", // Can override per project
        video: "retain-on-failure", // Can override per project
      },
    },

    {
      name: "firefox:public",
      testDir: "./tests/e2e/public",
      use: {
        ...devices["Desktop Firefox"],
        screenshot: "only-on-failure", // Can override per project
        video: "retain-on-failure", // Can override per project
      },
    },

    {
      name: "webkit:public",
      testDir: "./tests/e2e/public",
      use: {
        ...devices["Desktop Safari"],
        screenshot: "only-on-failure", // Can override per project
        video: "retain-on-failure", // Can override per project
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome:authenticated',
    //   testDir: './tests/e2e/authenticated',
    //   use: {
    //     ...devices['Pixel 5'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Mobile Chrome:public',
    //   testDir: './tests/e2e/public',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari:authenticated',
    //   testDir: './tests/e2e/authenticated',
    //   use: {
    //     ...devices['iPhone 12'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Mobile Safari:public',
    //   testDir: './tests/e2e/public',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge:authenticated',
    //   testDir: './tests/e2e/authenticated',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Microsoft Edge:public',
    //   testDir: './tests/e2e/public',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome:authenticated',
    //   testDir: './tests/e2e/authenticated',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'chrome',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Google Chrome:public',
    //   testDir: './tests/e2e/public',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
