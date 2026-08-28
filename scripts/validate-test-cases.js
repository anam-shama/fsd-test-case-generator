const fs = require("fs");
const path = require("path");
const { exportProject, validateTestCases, readTestCases } = require("./export-qa-pack");

const ROOT = path.join(__dirname, "..");
const project = process.argv[2];

if (!project) {
  console.error("Usage: node scripts/validate-test-cases.js <project-name>");
  process.exit(1);
}

const projectDir = path.join(ROOT, "output", project);
const { headers, rows } = readTestCases(projectDir);
const result = validateTestCases(headers, rows);

console.log(`\nValidation Report — ${project}`);
console.log("=".repeat(40));
console.log(`Status: ${result.valid ? "PASS" : "FAIL"}`);
console.log(`Issues: ${result.issueCount}`);

for (const issue of result.issues) {
  console.log(`  [${issue.severity.toUpperCase()}] Line ${issue.line}: ${issue.message}`);
}

const outPath = path.join(projectDir, "validation-report.json");
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`\nSaved: ${outPath}`);
process.exit(result.valid ? 0 : 1);
