# FSD Test Case Generator

Upload any FSD → get comprehensive, Excel-ready test cases.

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
| `test-cases.csv` | Functional/UI test cases (Excel-ready) |
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
