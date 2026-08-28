const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "output");
const VALID_LAYERS = new Set(["Frontend", "Backend", "Integration"]);

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (ch === "\r") i++;
    } else {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (/[",\n\r]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    )
    .join("\n");
}

function readTestCases(projectDir) {
  const file = path.join(projectDir, "test-cases.csv");
  if (!fs.existsSync(file)) return { headers: [], rows: [] };
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  return { headers: rows[0] || [], rows: rows.slice(1).filter((r) => r.some(Boolean)) };
}

function indexMap(headers) {
  return Object.fromEntries(headers.map((h, i) => [h, i]));
}

function convertToTestRail(headers, rows) {
  const idx = indexMap(headers);
  const out = [
    [
      "Title",
      "Section",
      "Template",
      "Type",
      "Priority",
      "Steps",
      "Expected Result",
      "References",
      "Preconditions",
      "Layer",
    ],
  ];

  for (const row of rows) {
    const id = row[idx["Test Case ID"]] || "";
    const scenario = row[idx["Test Scenario"]] || "";
    const module = row[idx["Module"]] || "General";
    const steps = row[idx["Test Steps"]] || "";
    const expected = row[idx["Expected Result"]] || "";
    const req = row[idx["Requirement ID"]] || "";
    const priority = row[idx["Priority"]] || "P2";
    const type = row[idx["Test Type"]] || "Functional";
    const pre = row[idx["Preconditions"]] || "";
    const layer = row[idx["Layer"]] || "";

    out.push([
      `${id}: ${scenario}`,
      module,
      "Test Case (Steps)",
      type,
      priority,
      steps,
      expected,
      req,
      pre,
      layer,
    ]);
  }

  return out;
}

function convertToJira(headers, rows) {
  const idx = indexMap(headers);
  const out = [
    [
      "Summary",
      "Issue Type",
      "Priority",
      "Description",
      "Labels",
      "Components",
    ],
  ];

  for (const row of rows) {
    const id = row[idx["Test Case ID"]] || "";
    const scenario = row[idx["Test Scenario"]] || "";
    const module = row[idx["Module"]] || "General";
    const steps = row[idx["Test Steps"]] || "";
    const expected = row[idx["Expected Result"]] || "";
    const req = row[idx["Requirement ID"]] || "";
    const priority = row[idx["Priority"]] || "P2";
    const type = row[idx["Test Type"]] || "Functional";
    const pre = row[idx["Preconditions"]] || "";
    const data = row[idx["Test Data"]] || "";
    const layer = row[idx["Layer"]] || "";

    const description = [
      `*Test Case ID:* ${id}`,
      `*Requirement ID:* ${req}`,
      `*Test Type:* ${type}`,
      `*Layer:* ${layer}`,
      "",
      "*Preconditions:*",
      pre,
      "",
      "*Test Data:*",
      data,
      "",
      "*Test Steps:*",
      steps,
      "",
      "*Expected Result:*",
      expected,
    ].join("\n");

    const layerLabel = layer ? layer.toLowerCase() : "unknown";

    out.push([
      `[${id}] ${scenario}`,
      "Test",
      priority,
      description,
      `qa,fsd,${type.toLowerCase().replace(/\s+/g, "-")},${layerLabel}`,
      module,
    ]);
  }

  return out;
}

function splitByLayer(headers, rows) {
  const idx = indexMap(headers);
  const frontend = rows.filter((row) => row[idx["Layer"]] === "Frontend");
  const backend = rows.filter((row) => row[idx["Layer"]] === "Backend");
  const integration = rows.filter((row) => row[idx["Layer"]] === "Integration");

  return {
    frontend: [headers, ...frontend],
    backend: [headers, ...backend],
    integration: [headers, ...integration],
  };
}

function countBaQueries(projectDir) {
  const file = path.join(projectDir, "ba-open-queries.md");
  if (!fs.existsSync(file)) return null;
  const content = fs.readFileSync(file, "utf8");
  const totalMatch = content.match(/\|\s*Total Queries\s*\|\s*(\d+)\s*\|/);
  const p0Match = content.match(/\|\s*Blockers \(P0\)\s*\|\s*(\d+)\s*\|/);
  const openMatches = content.match(/\|\s*Open\s*\|/g);
  return {
    total: totalMatch ? parseInt(totalMatch[1], 10) : openMatches?.length || 0,
    blockers: p0Match ? parseInt(p0Match[1], 10) : 0,
    open: openMatches?.length || 0,
    file: "ba-open-queries.md",
  };
}

function buildManifest(project, projectDir) {
  const { headers, rows } = readTestCases(projectDir);
  const idx = indexMap(headers);

  const requirements = new Set();
  const types = {};
  const priorities = {};
  const modules = {};
  const layers = {};

  for (const row of rows) {
    const req = row[idx["Requirement ID"]];
    const type = row[idx["Test Type"]] || "Unknown";
    const priority = row[idx["Priority"]] || "Unknown";
    const module = row[idx["Module"]] || "Unknown";
    const layer = row[idx["Layer"]] || "Unknown";

    if (req) requirements.add(req);
    types[type] = (types[type] || 0) + 1;
    priorities[priority] = (priorities[priority] || 0) + 1;
    modules[module] = (modules[module] || 0) + 1;
    layers[layer] = (layers[layer] || 0) + 1;
  }

  const files = fs
    .readdirSync(projectDir)
    .filter((f) => !f.startsWith(".") && fs.statSync(path.join(projectDir, f)).isFile());

  const baQueries = countBaQueries(projectDir);

  return {
    project,
    generatedAt: new Date().toISOString(),
    agent: "fsd-test-case-generator",
    version: "1.2.0",
    summary: {
      totalTestCases: rows.length,
      totalRequirements: requirements.size,
      byLayer: layers,
      byType: types,
      byPriority: priorities,
      byModule: modules,
      baQueries: baQueries || { total: 0, blockers: 0, open: 0 },
    },
    files,
    exports: {
      standard: "test-cases.csv",
      frontend: "frontend-test-cases.csv",
      backend: "backend-test-cases.csv",
      testrail: "testrail-import.csv",
      jira: "jira-import.csv",
      baOpenQueries: "ba-open-queries.md",
      zip: `${project}-qa-pack.zip`,
    },
  };
}

function validateTestCases(headers, rows) {
  const idx = indexMap(headers);
  const issues = [];
  const ids = new Set();
  const scenarios = new Set();
  const vaguePatterns = [
    /works correctly/i,
    /should work/i,
    /as expected$/i,
    /system behaves/i,
  ];

  if (!headers.includes("Layer")) {
    issues.push({
      line: 1,
      severity: "error",
      message: "Missing required column: Layer",
    });
  }

  rows.forEach((row, i) => {
    const line = i + 2;
    const id = row[idx["Test Case ID"]];
    const scenario = row[idx["Test Scenario"]];
    const expected = row[idx["Expected Result"]] || "";
    const req = row[idx["Requirement ID"]];
    const steps = row[idx["Test Steps"]] || "";
    const layer = row[idx["Layer"]];

    if (!id) issues.push({ line, severity: "error", message: "Missing Test Case ID" });
    if (id && ids.has(id)) issues.push({ line, severity: "error", message: `Duplicate Test Case ID: ${id}` });
    if (id) ids.add(id);

    if (!req) issues.push({ line, severity: "error", message: "Missing Requirement ID" });
    if (!scenario) issues.push({ line, severity: "warning", message: "Missing Test Scenario" });
    if (!steps) issues.push({ line, severity: "warning", message: "Missing Test Steps" });
    if (!expected) issues.push({ line, severity: "error", message: "Missing Expected Result" });

    if (!layer) {
      issues.push({ line, severity: "error", message: "Missing Layer value" });
    } else if (!VALID_LAYERS.has(layer)) {
      issues.push({
        line,
        severity: "error",
        message: `Invalid Layer "${layer}" — must be Frontend, Backend, or Integration`,
      });
    }

    if (scenario && scenarios.has(scenario)) {
      issues.push({ line, severity: "warning", message: `Possible duplicate scenario: ${scenario}` });
    }
    if (scenario) scenarios.add(scenario);

    for (const pattern of vaguePatterns) {
      if (pattern.test(expected)) {
        issues.push({ line, severity: "warning", message: `Vague expected result: "${expected}"` });
        break;
      }
    }
  });

  return {
    valid: !issues.some((i) => i.severity === "error"),
    issueCount: issues.length,
    issues,
  };
}

function exportProject(project) {
  const projectDir = path.join(OUTPUT_DIR, project);
  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project not found: ${project}`);
  }

  const { headers, rows } = readTestCases(projectDir);
  if (!rows.length) {
    throw new Error(`No test cases found in ${project}/test-cases.csv`);
  }

  const validation = validateTestCases(headers, rows);
  const testrail = convertToTestRail(headers, rows);
  const jira = convertToJira(headers, rows);
  const { frontend, backend } = splitByLayer(headers, rows);
  const manifest = buildManifest(project, projectDir);

  fs.writeFileSync(path.join(projectDir, "testrail-import.csv"), toCsv(testrail));
  fs.writeFileSync(path.join(projectDir, "jira-import.csv"), toCsv(jira));
  fs.writeFileSync(path.join(projectDir, "frontend-test-cases.csv"), toCsv(frontend));
  fs.writeFileSync(path.join(projectDir, "backend-test-cases.csv"), toCsv(backend));
  fs.writeFileSync(
    path.join(projectDir, "validation-report.json"),
    JSON.stringify(validation, null, 2)
  );
  fs.writeFileSync(
    path.join(projectDir, "qa-pack-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  const zipName = `${project}-qa-pack.zip`;
  const zipPath = path.join(projectDir, zipName);

  const fileList = fs
    .readdirSync(projectDir)
    .filter((f) => !f.startsWith(".") && !f.endsWith(".zip"))
    .map((f) => path.join(projectDir, f));

  try {
    execSync(`zip -j "${zipPath}" ${fileList.map((f) => `"${f}"`).join(" ")}`, {
      stdio: "pipe",
    });
  } catch {
    fs.copyFileSync(path.join(projectDir, "qa-pack-manifest.json"), zipPath.replace(".zip", "-manifest-only.json"));
  }

  return { manifest, validation, zipName };
}

function extractRtId(filename) {
  const match = String(filename).match(/RT[-_]?(\d+)/i);
  return match ? `RT-${match[1]}` : null;
}

module.exports = {
  exportProject,
  validateTestCases,
  extractRtId,
  readTestCases,
  buildManifest,
  splitByLayer,
  VALID_LAYERS,
  parseCsv,
  toCsv,
};

if (require.main === module) {
  const project = process.argv[2];
  if (!project) {
    console.error("Usage: node scripts/export-qa-pack.js <project-name>");
    process.exit(1);
  }
  const result = exportProject(project);
  console.log(JSON.stringify(result, null, 2));
}
