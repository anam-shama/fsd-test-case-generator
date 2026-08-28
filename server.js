const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
      return {
        name,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

function listOutputProjects() {
  if (!fs.existsSync(OUTPUT_DIR)) return [];
  return fs
    .readdirSync(OUTPUT_DIR)
    .filter((name) => {
      const projectPath = path.join(OUTPUT_DIR, name);
      return fs.statSync(projectPath).isDirectory();
    })
    .map((name) => {
      const projectPath = path.join(OUTPUT_DIR, name);
      const files = fs.readdirSync(projectPath).filter((f) => !f.startsWith("."));
      return { name, files, updatedAt: fs.statSync(projectPath).mtime.toISOString() };
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "fsd-test-case-agent" });
});

app.get("/api/fsd", (_req, res) => {
  const files = listFiles(FSD_DIR, ALLOWED_EXTENSIONS);
  res.json({ files, latest: files[0] || null });
});

app.get("/api/output", (_req, res) => {
  res.json({ projects: listOutputProjects() });
});

app.post("/api/upload", upload.single("fsd"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "FSD uploaded successfully",
    file: {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `fsd/${req.file.filename}`,
    },
    nextStep:
      'Open Cursor Agent and say: "Generate test cases from the uploaded FSD"',
  });
});

app.get("/api/download/:project/:file", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.project, req.params.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.download(filePath);
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || "Upload failed" });
});

app.listen(PORT, () => {
  console.log(`FSD Test Case Agent running at http://localhost:${PORT}`);
});
