# Open Queries for Business Analyst (BA)

**Project:** {{PROJECT_ID}}  
**FSD:** {{FSD_NAME}}  
**Version:** {{FSD_VERSION}}  
**Prepared by:** QA (FSD Test Case Generator Agent)  
**Date:** {{DATE}}  
**Status:** Pending BA Response

---

## Purpose

This document lists questions for the **Business Analyst (BA)** to clarify requirements that are:

- Missing from the FSD
- Unclear or ambiguous
- Contradictory
- Incomplete
- Referenced but not provided (Figma, API docs, localization files)
- Not appropriate to leave unspecified for QA execution

**QA will not assume answers.** Test cases marked as blocked depend on BA responses.

---

## Summary

| Metric | Count |
|--------|-------|
| Total Queries | {{TOTAL}} |
| Blockers (P0) | {{P0_COUNT}} |
| High Priority (P1) | {{P1_COUNT}} |
| Medium Priority (P2) | {{P2_COUNT}} |

### By Category

| Category | Count | Description |
|----------|-------|-------------|
| Missing Detail | | Required information not documented |
| Ambiguous Requirement | | Multiple valid interpretations |
| Contradiction | | Conflicting statements in FSD |
| Incomplete Specification | | Partial or truncated requirement |
| Missing Reference | | External doc/link referenced but not provided |
| Acceptance Criteria Gap | | No measurable pass/fail criteria |
| Out of FSD Scope | | Needs clarification from another source |

---

## Queries for BA

| Query ID | FSD Section / Requirement | Category | Priority | Query for BA | Why QA Cannot Proceed | Impacted Test Cases | BA Response | Status |
|----------|----------------------------|----------|----------|--------------|----------------------|---------------------|-------------|--------|
| BAQ-001 | | | P0 | | | | | Open |

---

## Instructions for BA

Please fill the **BA Response** column for each query and update **Status** to:

- `Answered` — requirement clarified; QA will update test cases
- `Deferred` — accepted risk; document reason
- `Out of Scope` — not applicable to this release
- `Open` — pending response

---

## QA Follow-up Actions (After BA Response)

- [ ] Update affected test cases with clarified expected results
- [ ] Remove blocked status from test cases
- [ ] Regenerate QA pack: `npm run export <project>`
- [ ] Update Requirement Coverage Summary
