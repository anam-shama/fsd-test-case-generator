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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "fsd-test-case-generator", version: "1.1.0" });
});

app.get("/api/fsd", (_req, res) => {
  const files = listFiles(FSD_DIR, ALLOWED_EXTENSIONS);
  res.json({ files, latest: files[0] || null });
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

app.listen(PORT, () => {
  console.log(`FSD Test Case Agent running at http://localhost:${PORT}`);
});
