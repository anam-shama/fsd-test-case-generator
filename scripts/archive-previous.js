const fs = require("fs");
const path = require("path");
const { extractRtId } = require("./export-qa-pack");

const FSD_KEEP = new Set(["README.md", ".gitkeep"]);

function archiveTimestamp(date = new Date()) {
  return date.toISOString().slice(0, 19).replace(/:/g, "-");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listFsdFiles(fsdDir) {
  if (!fs.existsSync(fsdDir)) return [];
  return fs
    .readdirSync(fsdDir)
    .filter((name) => !FSD_KEEP.has(name) && !name.startsWith("."));
}

function listOutputProjects(outputDir) {
  if (!fs.existsSync(outputDir)) return [];
  return fs
    .readdirSync(outputDir)
    .filter((name) => {
      if (name.startsWith(".") || name === ".gitkeep") return false;
      return fs.statSync(path.join(outputDir, name)).isDirectory();
    });
}

function moveEntry(src, dest) {
  ensureDir(path.dirname(dest));
  if (fs.existsSync(dest)) {
    throw new Error(`Archive destination already exists: ${dest}`);
  }
  fs.renameSync(src, dest);
}

function appendArchiveLog(archiveDir, entry) {
  const logPath = path.join(archiveDir, "archive-log.json");
  let log = [];
  if (fs.existsSync(logPath)) {
    try {
      log = JSON.parse(fs.readFileSync(logPath, "utf8"));
      if (!Array.isArray(log)) log = [];
    } catch {
      log = [];
    }
  }
  log.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");
}

/**
 * Archive all existing FSD files and output projects before a new upload.
 * Never deletes — always moves to archive/.
 *
 * @param {object} options
 * @param {string} [options.root] - Project root directory
 * @param {string} [options.newRtId] - RT ID of the incoming upload (for logging)
 * @param {string} [options.trigger] - What triggered the archive
 * @returns {{ archived: boolean, timestamp: string|null, fsd: string[], output: string[], paths: object }}
 */
function archivePreviousData({ root = path.join(__dirname, ".."), newRtId = null, trigger = "new-fsd-upload" } = {}) {
  const fsdDir = path.join(root, "fsd");
  const outputDir = path.join(root, "output");
  const archiveDir = path.join(root, "archive");

  const fsdFiles = listFsdFiles(fsdDir);
  const outputProjects = listOutputProjects(outputDir);

  if (!fsdFiles.length && !outputProjects.length) {
    return {
      archived: false,
      timestamp: null,
      fsd: [],
      output: [],
      paths: {},
      message: "No previous data to archive",
    };
  }

  const timestamp = archiveTimestamp();
  const fsdArchiveDir = path.join(archiveDir, "fsd", timestamp);
  const outputPaths = {};

  ensureDir(fsdArchiveDir);

  for (const name of fsdFiles) {
    const src = path.join(fsdDir, name);
    const dest = path.join(fsdArchiveDir, name);
    moveEntry(src, dest);
  }

  for (const project of outputProjects) {
    const src = path.join(outputDir, project);
    const dest = path.join(archiveDir, "output", `${project}-${timestamp}`);
    moveEntry(src, dest);
    outputPaths[project] = path.relative(root, dest);
  }

  const entry = {
    timestamp,
    trigger,
    newRtId,
    archivedAt: new Date().toISOString(),
    archived: {
      fsd: fsdFiles,
      output: outputProjects,
    },
    paths: {
      fsd: fsdFiles.length ? path.relative(root, fsdArchiveDir) : null,
      output: outputPaths,
    },
  };

  appendArchiveLog(archiveDir, entry);

  const parts = [];
  if (fsdFiles.length) parts.push(`${fsdFiles.length} FSD file(s)`);
  if (outputProjects.length) parts.push(`${outputProjects.length} output project(s)`);

  return {
    archived: true,
    timestamp,
    fsd: fsdFiles,
    output: outputProjects,
    paths: entry.paths,
    message: `Archived ${parts.join(" and ")} to archive/`,
  };
}

function getLatestArchiveEntry(root = path.join(__dirname, "..")) {
  const logPath = path.join(root, "archive", "archive-log.json");
  if (!fs.existsSync(logPath)) return null;
  try {
    const log = JSON.parse(fs.readFileSync(logPath, "utf8"));
    return Array.isArray(log) && log.length ? log[log.length - 1] : null;
  } catch {
    return null;
  }
}

module.exports = {
  archivePreviousData,
  archiveTimestamp,
  getLatestArchiveEntry,
  listFsdFiles,
  listOutputProjects,
  extractRtId,
};

if (require.main === module) {
  const result = archivePreviousData({
    newRtId: process.argv[2] || null,
    trigger: process.argv[3] || "manual",
  });
  console.log(JSON.stringify(result, null, 2));
}
