# FSD Test Case Generator

Upload any FSD → get comprehensive, Excel-ready test cases.

## What's Different from ChatGPT / Perplexity

| Feature | This Agent | ChatGPT / Perplexity |
|---------|------------|----------------------|
| FSD upload + RT auto-detect | Yes | No |
| Requirement-mapped test cases | Yes | Inconsistent |
| ZIP QA pack export | Yes | No |
| TestRail / Jira import files | Yes | No |
| QA validation (duplicates, vague results) | Yes | No |
| Coverage dashboard | Yes | No |
| Frontend / Backend layer split | Yes | No |
| Repeatable per RT | Yes | No |

## New in v1.2

### BA Open Queries Section
Generates `ba-open-queries.md` — a formal document for the Business Analyst with:
- Structured queries for missing, unclear, or contradictory FSD items
- Priority (P0 blockers, P1, P2)
- Category (Missing Detail, Ambiguous, Contradiction, Incomplete Spec, Missing Reference)
- Impacted test cases per query
- "Items Not Appropriate to Leave in FSD" section
- BA response tracking (Open / Answered / Deferred)

### Frontend / Backend Layer Classification
Every test case now includes a **Layer** column: `Frontend`, `Backend`, or `Integration`.

| Layer | What It Covers |
|-------|----------------|
| **Frontend** | UI rendering, navigation, visual states, client interactions, toasts, badges, scroll, toggle |
| **Backend** | API request/response, data contracts, server logic, analytics event firing |
| **Integration** | E2E flows spanning UI + API together |

Export automatically splits test cases into:
- `frontend-test-cases.csv` — Frontend-layer cases
- `backend-test-cases.csv` — Backend-layer cases

Layer counts appear in `qa-pack-manifest.json` and the web UI coverage dashboard.

## New in v1.1

### 1. RT ID Auto-Detection
Upload `RT-1277_FSD.docx` → agent auto-detects `RT-1277` as project name.

### 2. One-Click QA Pack ZIP Export
Bundles all deliverables into a single ZIP:
```bash
npm run export RT-1277
```
Or click **Export QA Pack** in the web UI.

### 3. TestRail Import Export
Generates `testrail-import.csv` with Title, Steps, Expected Result, Priority, References.

### 4. Jira Import Export
Generates `jira-import.csv` with Summary, Description, Priority, Labels, Components.

### 5. QA Validator
Checks for duplicate IDs, missing requirement mapping, vague expected results:
```bash
npm run validate RT-1277
```

### 6. Coverage Dashboard (Web UI)
Shows test case count, requirement count, validation pass/fail, and download buttons at http://localhost:3000

### 7. QA Pack Manifest
`qa-pack-manifest.json` — machine-readable summary with counts by layer, type, priority, and module.

### 8. Frontend / Backend Layer Split
Test cases are classified by layer and exported as separate CSVs:
```bash
npm run export RT-1277
# → frontend-test-cases.csv, backend-test-cases.csv
```
The web UI coverage dashboard shows Frontend, Backend, and Integration counts.

## Quick Start (3 Steps)

### 1. Start the app

```bash
npm install
npm start
```

Open **http://localhost:3000**

### 2. Upload your FSD

Drag and drop your Functional Specification Document (PDF, Word, Excel, Markdown, or Text).

### 3. Generate test cases

Open **Cursor Agent** chat and say:

```
Generate test cases from the uploaded FSD
```

The agent will read the complete FSD and save output to `output/<project>/`.

## What You Get

| File | Description |
|------|-------------|
| `test-cases.csv` | Functional/UI test cases with Layer column (Excel-ready) |
| `frontend-test-cases.csv` | Frontend-layer cases (generated on export) |
| `backend-test-cases.csv` | Backend-layer cases (generated on export) |
| `api-test-cases.csv` | API test cases (if in FSD) |
| `db-test-cases.csv` | DB validation (if in FSD) |
| `regression-test-cases.csv` | Regression cases |
| `coverage-summary.md` | Requirement coverage summary |
| `full-report.md` | Complete 10-section QA report |

## Coverage

- Positive, negative, boundary, and edge cases
- API and DB test cases (only when defined in FSD)
- Regression for impacted functionality
- Every test case mapped to FSD Requirement ID (`TC_001` → `FR-001`)
- Layer classification: Frontend, Backend, or Integration
- Open Questions for anything unclear (no invented behavior)

## Alternative: No Web UI

Place your FSD in `fsd/` manually, then ask the agent:

```
Generate test cases from fsd/your-file.pdf
```

## Project Structure

```
/agent/
├── public/index.html          # Upload UI
├── server.js                  # Upload server
├── fsd/                       # Uploaded FSD files
├── output/                    # Generated test cases
├── templates/                 # CSV templates
├── AGENTS.md                  # Agent instructions
└── .cursor/skills/fsd-test-case-generator/SKILL.md
```

## Example Prompts

```
Generate test cases from the uploaded FSD
```

```
Generate test cases from fsd/RT-5678-checkout.pdf
```

```
[paste FSD content] — generate full test coverage for RT-9012
```

## Publish to GitHub

The repository is ready to push. Authenticate and run:

```bash
export GITHUB_TOKEN=your_github_token   # needs repo scope
./scripts/push-to-github.sh fsd-test-case-generator
```

Or manually:

```bash
gh auth login
gh repo create fsd-test-case-generator --public --source=. --remote=origin --push
```
