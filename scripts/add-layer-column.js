const fs = require("fs");
const path = require("path");
const { parseCsv, toCsv } = require("./export-qa-pack");

// Layer classification for RT-1277 functional cases (TC_001–TC_066)
const LAYER_MAP = {
  TC_001: "Frontend",
  TC_002: "Frontend",
  TC_003: "Frontend",
  TC_004: "Frontend",
  TC_005: "Frontend",
  TC_006: "Frontend",
  TC_007: "Frontend",
  TC_008: "Frontend",
  TC_009: "Frontend",
  TC_010: "Frontend",
  TC_011: "Frontend",
  TC_012: "Frontend",
  TC_013: "Backend",
  TC_014: "Frontend",
  TC_015: "Frontend",
  TC_016: "Frontend",
  TC_017: "Frontend",
  TC_018: "Frontend",
  TC_019: "Frontend",
  TC_020: "Frontend",
  TC_021: "Frontend",
  TC_022: "Frontend",
  TC_023: "Frontend",
  TC_024: "Frontend",
  TC_025: "Frontend",
  TC_026: "Integration",
  TC_027: "Frontend",
  TC_028: "Frontend",
  TC_029: "Frontend",
  TC_030: "Frontend",
  TC_031: "Backend",
  TC_032: "Backend",
  TC_033: "Backend",
  TC_034: "Backend",
  TC_035: "Backend",
  TC_036: "Backend",
  TC_037: "Backend",
  TC_038: "Backend",
  TC_039: "Frontend",
  TC_040: "Frontend",
  TC_041: "Frontend",
  TC_042: "Frontend",
  TC_043: "Backend",
  TC_044: "Frontend",
  TC_045: "Frontend",
  TC_046: "Frontend",
  TC_047: "Frontend",
  TC_048: "Frontend",
  TC_049: "Frontend",
  TC_050: "Frontend",
  TC_051: "Frontend",
  TC_052: "Frontend",
  TC_053: "Frontend",
  TC_054: "Frontend",
  TC_055: "Frontend",
  TC_056: "Frontend",
  TC_057: "Frontend",
  TC_058: "Frontend",
  TC_059: "Frontend",
  TC_060: "Frontend",
  TC_061: "Frontend",
  TC_062: "Frontend",
  TC_063: "Integration",
  TC_064: "Integration",
  TC_065: "Backend",
  TC_066: "Frontend",
};

function addLayerColumn(filePath, layerMap, defaultLayer) {
  const content = fs.readFileSync(filePath, "utf8");
  const rows = parseCsv(content);
  const headers = rows[0];
  const testTypeIdx = headers.indexOf("Test Type");
  const idIdx = headers.indexOf("Test Case ID");

  if (headers.includes("Layer")) {
    console.log(`Layer column already present in ${filePath}`);
    return;
  }

  const newHeaders = [
    ...headers.slice(0, testTypeIdx + 1),
    "Layer",
    ...headers.slice(testTypeIdx + 1),
  ];

  const newRows = rows.slice(1).map((row) => {
    const id = row[idIdx];
    const layer = layerMap[id] || defaultLayer;
    return [
      ...row.slice(0, testTypeIdx + 1),
      layer,
      ...row.slice(testTypeIdx + 1),
    ];
  });

  fs.writeFileSync(filePath, toCsv([newHeaders, ...newRows]));
  console.log(`Updated ${filePath} with Layer column (${newRows.length} rows)`);
}

// Re-export parseCsv/toCsv from export-qa-pack - they're not exported, use inline
// Actually parseCsv and toCsv aren't exported from export-qa-pack. Let me fix the script.
