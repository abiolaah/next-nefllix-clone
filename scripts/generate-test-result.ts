import * as fs from "fs";
import * as path from "path";

interface TestResult {
  node_version: string;
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  note?: string;
}

interface JestTestResults {
  success?: boolean;
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  numPendingTests?: number;
}

interface TestData {
  timestamp: string;
  run_id: string;
  run_number: string;
  commit_sha: string;
  unit: TestResult[];
  integration: TestResult[];
  e2e: TestResult[];
}

interface PlaywrightSpec {
  ok: boolean;
}

interface PlaywrightSuite {
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

interface PlaywrightResults {
  suites?: PlaywrightSuite[];
}

// Helper function to safely read JSON
function safeReadJSON(filePath: string): unknown {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      console.log(`✅ Reading ${filePath}...`);
      return JSON.parse(content);
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.log(`⚠️ Error reading ${filePath}:`, (error as Error).message);
  }
  return null;
}

// Helper function to count Playwright tests
function countTests(suite: PlaywrightSuite): {
  total: number;
  passed: number;
  failed: number;
} {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  if (suite.specs) {
    suite.specs.forEach((spec) => {
      totalTests++;
      if (spec.ok) passedTests++;
      else failedTests++;
    });
  }

  if (suite.suites) {
    suite.suites.forEach((s) => {
      const counts = countTests(s);
      totalTests += counts.total;
      passedTests += counts.passed;
      failedTests += counts.failed;
    });
  }

  return { total: totalTests, passed: passedTests, failed: failedTests };
}

function main() {
  // Create results directory if it doesn't exist
  const resultsDir = "test-results";
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Generate timestamp
  const timestamp = new Date().toISOString();
  const runId = process.env.GITHUB_RUN_ID || "unknown";
  const runNumber = process.env.GITHUB_RUN_NUMBER || "unknown";
  const commitSha = (process.env.GITHUB_SHA || "unknown").substring(0, 7);

  // Collect test results
  const testData: TestData = {
    timestamp,
    run_id: runId,
    run_number: runNumber,
    commit_sha: commitSha,
    unit: [],
    integration: [],
    e2e: [],
  };

  console.log("🔍 Looking for test results in artifacts directory...");

  // Process unit tests
  ["18.x", "20.x"].forEach((nodeVersion) => {
    const unitPath = `artifacts/unit-test-results-${nodeVersion}/test-results/unit-results.json`;
    console.log(`Checking for unit tests: ${unitPath}`);
    const data = safeReadJSON(unitPath) as JestTestResults | null;
    if (data) {
      testData.unit.push({
        node_version: nodeVersion,
        success: data.success || false,
        numTotalTests: data.numTotalTests || 0,
        numPassedTests: data.numPassedTests || 0,
        numFailedTests: data.numFailedTests || 0,
        numPendingTests: data.numPendingTests || 0,
      });
    }
  });

  // Process integration tests
  ["18.x", "20.x"].forEach((nodeVersion) => {
    const intPath = `artifacts/integration-test-results-${nodeVersion}/test-results/integration-results.json`;
    const data = safeReadJSON(intPath) as JestTestResults | null;
    if (data) {
      console.log(`Found integration test data for ${nodeVersion}:`, data);
      testData.integration.push({
        node_version: nodeVersion,
        success: data.success || false,
        numTotalTests: data.numTotalTests || 0,
        numPassedTests: data.numPassedTests || 0,
        numFailedTests: data.numFailedTests || 0,
        numPendingTests: data.numPendingTests || 0,
      });
    }
  });

  // Process E2E tests (Playwright)
  console.log("🎭 Checking for E2E tests...");

  // Try different possible paths for e2e results
  const e2ePaths = [
    "artifacts/e2e-test-results-20.x/e2e-results.json",
    "artifacts/e2e-test-results-20.x/test-results/e2e-results.json",
  ];

  let e2eData: PlaywrightResults | null = null;

  for (const tryPath of e2ePaths) {
    console.log(`   Trying: ${tryPath}`);
    e2eData = safeReadJSON(tryPath) as PlaywrightResults | null;
    if (e2eData) {
      console.log(`   ✅ Found E2E data at: ${tryPath}`);
      break;
    }
  }

  if (e2eData && e2eData.suites) {
    console.log("📊 Processing E2E test data...");

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    e2eData.suites.forEach((suite) => {
      const counts = countTests(suite);
      totalTests += counts.total;
      passedTests += counts.passed;
      failedTests += counts.failed;
    });

    console.log(
      `   Total: ${totalTests}, Passed: ${passedTests}, Failed: ${failedTests}`
    );

    testData.e2e.push({
      node_version: "20.x",
      success: failedTests === 0 && totalTests > 0,
      numTotalTests: totalTests,
      numPassedTests: passedTests,
      numFailedTests: failedTests,
      numPendingTests: 0,
    });
  } else {
    // Fallback: check if playwright report exists
    console.log("⚠️  No E2E JSON found, checking for Playwright report...");
    const playwrightDir = "artifacts/playwright-report-20.x";
    if (fs.existsSync(playwrightDir)) {
      console.log("📁 Found Playwright report directory (but no JSON data)");
      testData.e2e.push({
        node_version: "20.x",
        success: true,
        numTotalTests: 0,
        numPassedTests: 0,
        numFailedTests: 0,
        numPendingTests: 0,
        note: "See Playwright report for details",
      });
    } else {
      console.log("❌ No E2E test results found");
    }
  }

  console.log("\n📈 Final test data:", JSON.stringify(testData, null, 2));

  // Load existing results
  const historyFile = path.join(resultsDir, "history.json");
  let history: TestData[] = [];
  if (fs.existsSync(historyFile)) {
    try {
      const content = fs.readFileSync(historyFile, "utf8");
      history = JSON.parse(content);
    } catch (error) {
      console.log(
        "Error reading history, starting fresh:",
        (error as Error).message
      );
      history = [];
    }
  }

  // Append new results
  history.push(testData);

  // Keep only last 100 runs
  if (history.length > 100) {
    history = history.slice(-100);
  }

  // Save history
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  console.log(`\n✅ Saved test results for run #${runNumber}`);
  console.log(`📊 Total runs in history: ${history.length}`);
  console.log(`📋 Unit tests: ${testData.unit.length} node versions`);
  console.log(
    `🔗 Integration tests: ${testData.integration.length} node versions`
  );
  console.log(`🎭 E2E tests: ${testData.e2e.length} suite(s)`);

  // Summary
  const unitTotal = testData.unit.reduce((sum, t) => sum + t.numTotalTests, 0);
  const unitPassed = testData.unit.reduce(
    (sum, t) => sum + t.numPassedTests,
    0
  );
  const intTotal = testData.integration.reduce(
    (sum, t) => sum + t.numTotalTests,
    0
  );
  const intPassed = testData.integration.reduce(
    (sum, t) => sum + t.numPassedTests,
    0
  );
  const e2eTotal = testData.e2e.reduce((sum, t) => sum + t.numTotalTests, 0);
  const e2ePassed = testData.e2e.reduce((sum, t) => sum + t.numPassedTests, 0);

  console.log("\n📊 Test Summary:");
  console.log(`   Unit: ${unitPassed}/${unitTotal} passed`);
  console.log(`   Integration: ${intPassed}/${intTotal} passed`);
  console.log(`   E2E: ${e2ePassed}/${e2eTotal} passed`);
}

// Run the script
main();
