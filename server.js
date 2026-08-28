const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exportProject, extractRtId } = require("./scripts/export-qa-pack");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const FSD_DIR = path.join(ROOT, "fsd");
const OUTPUT_DIR = path.join(ROOT, "output");

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xlsx",
  ".xls",
  ".md",
  ".txt",
]);

if (!fs.existsSync(FSD_DIR)) fs.mkdirSync(FSD_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, FSD_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  },
});

app.use(express.static(path.join(ROOT, "public")));
app.use(express.json());

function listFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => {
      if (name.startsWith(".")) return false;
      if (name === "README.md") return false;
      const ext = path.extname(name).toLowerCase();
      return extensions.has(ext) || extensions.size === 0;
    })
    .map((name) => {
      const filePath = path.join(dir, name);
      const stat = fs.statSync(filePath);
      const rtId = extractRtId(name);
      return {
        name,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
        rtId,
        suggestedProject: rtId || name.replace(/\.[^.]+$/, ""),
      };
    })
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

function getProjectSummary(name) {
  const projectDir = path.join(OUTPUT_DIR, name);
  if (!fs.existsSync(projectDir)) return null;

  const manifestPath = path.join(projectDir, "qa-pack-manifest.json");
  const validationPath = path.join(projectDir, "validation-report.json");
  const files = fs.readdirSync(projectDir).filter((f) => !f.startsWith("."));

  const summary = {
    name,
    files,
    updatedAt: fs.statSync(projectDir).mtime.toISOString(),
    hasZip: files.some((f) => f.endsWith("-qa-pack.zip")),
    hasTestRail: files.includes("testrail-import.csv"),
    hasJira: files.includes("jira-import.csv"),
  };

  if (fs.existsSync(manifestPath)) {
    summary.manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }
  if (fs.existsSync(validationPath)) {
    summary.validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));
  }

  return summary;
}

function listOutputProjects() {
  if (!fs.existsSync(OUTPUT_DIR)) return [];
  return fs
    .readdirSync(OUTPUT_DIR)
    .filter((name) => fs.statSync(path.join(OUTPUT_DIR, name)).isDirectory())
    .map((name) => getProjectSummary(name))
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function parseTableRow(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function stripMarkdown(text) {
  return text.replace(/\*\*/g, "").replace(/__/g, "").trim();
}

function parseBaQueriesFile(projectDir) {
  const filePath = path.join(projectDir, "ba-open-queries.md");
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const meta = {};
  const projectMatch = content.match(/\*\*Project:\*\*\s*(.+)/);
  const fsdMatch = content.match(/\*\*FSD:\*\*\s*(.+)/);
  const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/);
  if (projectMatch) meta.project = projectMatch[1].trim();
  if (fsdMatch) meta.fsd = fsdMatch[1].trim();
  if (dateMatch) meta.date = dateMatch[1].trim();

  const summary = { total: 0, blockers: 0, p1: 0, p2: 0, open: 0 };
  const totalMatch = content.match(/\|\s*Total Queries\s*\|\s*(\d+)\s*\|/);
  const p0Match = content.match(/\|\s*Blockers \(P0\)\s*\|\s*(\d+)\s*\|/);
  const p1Match = content.match(/\|\s*High Priority \(P1\)\s*\|\s*(\d+)\s*\|/);
  const p2Match = content.match(/\|\s*Medium Priority \(P2\)\s*\|\s*(\d+)\s*\|/);
  if (totalMatch) summary.total = parseInt(totalMatch[1], 10);
  if (p0Match) summary.blockers = parseInt(p0Match[1], 10);
  if (p1Match) summary.p1 = parseInt(p1Match[1], 10);
  if (p2Match) summary.p2 = parseInt(p2Match[1], 10);

  const queries = [];
  let inQueriesTable = false;

  for (const line of lines) {
    if (line.startsWith("## Queries for BA")) {
      inQueriesTable = false;
      continue;
    }
    if (!line.startsWith("|")) continue;

    if (line.includes("Query ID") && line.includes("Priority")) continue;

    if (/^\|\s*[-:]+/.test(line)) {
      inQueriesTable = true;
      continue;
    }

    if (!inQueriesTable) continue;

    const cols = parseTableRow(line);
    if (!cols[0] || !/^BAQ-\d+/.test(cols[0])) continue;

    const status = cols[8] || "Open";
    queries.push({
      queryId: cols[0],
      fsdSection: cols[1],
      category: cols[2],
      priority: cols[3],
      query: stripMarkdown(cols[4]),
      whyCannotProceed: stripMarkdown(cols[5]),
      impactedTestCases: cols[6],
      baResponse: cols[7],
      status,
    });
  }

  summary.open = queries.filter((q) => q.status.toLowerCase() === "open").length;
  if (!summary.total) summary.total = queries.length;

  return {
    file: "ba-open-queries.md",
    meta,
    summary,
    queries,
    updatedAt: fs.statSync(filePath).mtime.toISOString(),
    downloadUrl: `/api/download/${path.basename(projectDir)}/ba-open-queries.md`,
  };
}

function getBaQueriesForProject(project) {
  const projectDir = path.join(OUTPUT_DIR, project);
  if (!fs.existsSync(projectDir)) return null;
  const data = parseBaQueriesFile(projectDir);
  if (!data) return null;
  return { project, ...data };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "fsd-test-case-generator", version: "1.2.0" });
});

app.get("/api/fsd", (_req, res) => {
  const files = listFiles(FSD_DIR, ALLOWED_EXTENSIONS);
  res.json({ files, latest: files[0] || null });
});

app.get("/api/ba-queries", (_req, res) => {
  const projects = listOutputProjects()
    .map((p) => getBaQueriesForProject(p.name))
    .filter(Boolean);

  const allQueries = projects.flatMap((p) =>
    p.queries.map((q) => ({ ...q, project: p.project }))
  );

  res.json({
    projects,
    summary: {
      total: allQueries.length,
      blockers: allQueries.filter((q) => q.priority === "P0").length,
      open: allQueries.filter((q) => q.status.toLowerCase() === "open").length,
      projectCount: projects.length,
    },
  });
});

app.get("/api/ba-queries/:project", (req, res) => {
  const data = getBaQueriesForProject(req.params.project);
  if (!data) {
    return res.status(404).json({ error: "BA queries not found for project" });
  }
  res.json(data);
});

app.get("/api/output", (_req, res) => {
  res.json({ projects: listOutputProjects() });
});

app.get("/api/output/:project", (req, res) => {
  const summary = getProjectSummary(req.params.project);
  if (!summary) return res.status(404).json({ error: "Project not found" });
  res.json(summary);
});

app.post("/api/upload", upload.single("fsd"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const rtId = extractRtId(req.file.originalname) || extractRtId(req.file.filename);

  res.json({
    message: "FSD uploaded successfully",
    file: {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `fsd/${req.file.filename}`,
      rtId,
      suggestedProject: rtId || req.file.originalname.replace(/\.[^.]+$/, ""),
    },
    nextStep: rtId
      ? `Open Cursor Agent and say: "Generate test cases from the uploaded FSD for ${rtId}"`
      : 'Open Cursor Agent and say: "Generate test cases from the uploaded FSD"',
  });
});

app.post("/api/export/:project", (req, res) => {
  try {
    const result = exportProject(req.params.project);
    res.json({
      message: "QA pack exported successfully",
      project: req.params.project,
      zip: result.zipName,
      validation: result.validation,
      manifest: result.manifest,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/download/:project/:file", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.project, req.params.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.download(filePath);
});

app.get("/api/download-zip/:project", (req, res) => {
  const zipName = `${req.params.project}-qa-pack.zip`;
  const zipPath = path.join(OUTPUT_DIR, req.params.project, zipName);
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: "ZIP not found. Run export first." });
  }
  res.download(zipPath, zipName);
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || "Request failed" });
});

const server = app.listen(PORT, () => {
  console.log(`FSD Test Case Agent running at http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`
    );
    process.exit(1);
  }
  throw err;
});
