#!/usr/bin/env tsx

/**
 * Generate Dashboard Script
 *
 * This script generates the test results dashboard HTML from a template.
 * It's used in the GitHub Actions workflow to create the index.html for GitHub Pages.
 *
 * Usage: tsx scripts/generate-dashboard.ts
 *        or: npm run dashboard:generate
 *
 * Environment Variables:
 *   None required
 *
 * Output:
 *   - index.html in the current working directory
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DashboardMetadata {
  timestamp: string;
  generator: string;
  template: string;
}

/**
 * Generate metadata comment for the HTML
 */
function generateMetadata(): string {
  const metadata: DashboardMetadata = {
    timestamp: new Date().toISOString(),
    generator: "scripts/generate-dashboard.ts",
    template: "scripts/dashboard-template.html",
  };

  return `
    <!-- 
      Dashboard Generated: ${metadata.timestamp}
      Generator: ${metadata.generator}
      Template: ${metadata.template}
    -->`;
}

/**
 * Process template with optional variable substitution
 */
function processTemplate(template: string): string {
  let html = template;

  // Add generation metadata as HTML comment
  const metadata = generateMetadata();
  html = html.replace("</head>", `${metadata}\n</head>`);

  // Optional: Template variable substitution
  // You can add custom replacements here in the future
  // Example:
  // const version = process.env.APP_VERSION || '1.0.0';
  // const buildId = process.env.GITHUB_RUN_ID || 'local';
  // html = html.replace('{{VERSION}}', version);
  // html = html.replace('{{BUILD_ID}}', buildId);

  return html;
}

/**
 * Format file size in KB
 */
function formatSize(bytes: number): string {
  return (bytes / 1024).toFixed(2);
}

/**
 * Main function to generate the dashboard
 */
function generateDashboard(): number {
  console.log("🎨 Generating test results dashboard...");

  try {
    // Determine the template path
    const templatePath = path.join(__dirname, "dashboard-template.html");

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at ${templatePath}`);
    }

    // Read the template file
    const template = fs.readFileSync(templatePath, "utf8");
    console.log("✅ Template loaded successfully");
    console.log(`   Size: ${formatSize(template.length)} KB`);

    // Process the template
    const html = processTemplate(template);

    // Determine output path
    const outputPath = path.join(process.cwd(), "index.html");

    // Write the output file
    fs.writeFileSync(outputPath, html, "utf8");

    console.log(`✅ Dashboard generated successfully`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   Size: ${formatSize(html.length)} KB`);
    console.log("📊 Dashboard ready for deployment");

    return 0;
  } catch (error) {
    console.error("❌ Error generating dashboard:");
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    } else {
      console.error(`   ${String(error)}`);
    }
    return 1;
  }
}

// Execute the generator
const exitCode = generateDashboard();
process.exit(exitCode);
