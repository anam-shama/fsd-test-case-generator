# FSD Test Case Generator Agent

A reusable **Senior QA Engineer** agent that reads any Functional Specification Document (FSD) and generates comprehensive, traceable test cases with full requirement coverage.

## What It Does

```
Upload FSD  →  Read complete FSD  →  Extract requirements  →  Generate test cases  →  Check coverage  →  Excel-ready output
```

- Works with **any RT (Release Ticket)** — just provide the FSD
- Covers **all scenarios**: positive, negative, boundary, API, DB, regression
- Maps every test case to an FSD requirement
- Flags gaps under **Open Questions** (no invented behavior)

## Quick Start

### 1. Add Your FSD

Place your FSD file in the `fsd/` directory:

```
fsd/RT-1234-user-login.pdf
```

Or paste the FSD content / share a document link in the agent chat.

### 2. Run the Agent

Open a **Cursor Agent** chat in this repo and say:

```
Generate test cases from the FSD in fsd/RT-1234-user-login.pdf
```

Or simply:

```
Generate test cases from the FSD
```

### 3. Get Your Output

Deliverables are saved to `output/<project>/`:

| File | Description |
|------|-------------|
| `test-cases.csv` | Functional/UI test cases (Excel-ready) |
| `api-test-cases.csv` | API/backend test cases |
| `db-test-cases.csv` | Database validation test cases |
| `regression-test-cases.csv` | Regression test cases |
| `coverage-summary.md` | Requirement coverage summary |
| `full-report.md` | Complete 10-section QA report |

## Supported FSD Formats

PDF, Word, Excel, Markdown, plain text, pasted content, or document links.

## Test Case Format

| Test Case ID | Requirement ID | Module | Test Scenario | Preconditions | Test Data | Test Steps | Expected Result | Test Type | Priority | Platform |
|--------------|----------------|--------|---------------|---------------|-----------|------------|-----------------|-----------|----------|----------|

- IDs start at `TC_001` (unique, sequential)
- One primary scenario per test case
- Expected results are specific and measurable

## Final Report (10 Sections)

1. FSD Summary
2. Identified Requirements
3. Assumptions
4. Detailed Test Cases
5. API/Backend Test Cases
6. Database Test Cases
7. Negative & Edge Case Coverage
8. Regression Coverage
9. Requirement Coverage Summary
10. Open Questions

## Agent Rules

| Rule | Detail |
|------|--------|
| Read entire FSD | All sections before generating test cases |
| FSD = source of truth | No invented functionality or assumptions |
| Full coverage | Every testable requirement gets ≥ 1 test case |
| No invented APIs/DB | Endpoints, tables, columns only from FSD |
| Contradictions | Flagged in Open Questions |

## Project Structure

```
/agent/
├── AGENTS.md                              # Agent instructions
├── .cursor/
│   ├── rules/fsd-qa-agent.mdc             # Cursor rule (auto-activates on fsd/)
│   └── skills/fsd-test-case-generator/
│       └── SKILL.md                        # Full agent workflow & standards
├── fsd/                                    # ← Upload your FSD here
├── output/                                 # ← Generated test cases appear here
├── templates/                              # CSV templates (Excel-ready)
│   ├── test-case-template.csv
│   ├── api-test-case-template.csv
│   ├── db-test-case-template.csv
│   └── regression-test-case-template.csv
└── README.md
```

## Example Prompts

```
Generate test cases from the FSD in fsd/RT-5678-checkout.pdf
```

```
Here is the FSD for RT-9012. Generate full test coverage including API and regression cases.
[paste FSD content]
```

```
Read fsd/payment-module.docx and create Excel-ready test cases with requirement coverage summary.
```

## Requirement Coverage Summary

Every run ends with:

```
Total Requirements:
Total Test Cases:
Positive Test Cases:
Negative Test Cases:
Boundary/Edge Cases:
API Test Cases:
DB Test Cases:
Regression Test Cases:
Uncovered Requirements:
```
