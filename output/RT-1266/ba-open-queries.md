# Open Queries for Business Analyst (BA)

**Project:** RT-1266  
**FSD:** Bottom Navigation Icon Animation handling (v0.3)  
**Prepared by:** QA (FSD Test Case Generator Agent)  
**Date:** 2026-08-28  
**Status:** Pending BA Response

---

## Summary

| Metric | Count |
|--------|-------|
| Total Queries | 9 |
| Blockers (P0) | 3 |
| High Priority (P1) | 4 |
| Medium Priority (P2) | 2 |

---

## Queries for BA

| Query ID | FSD Section / Requirement | Category | Priority | Query for BA | Why QA Cannot Proceed | Impacted Test Cases | BA Response | Status |
|----------|----------------------------|----------|----------|--------------|----------------------|---------------------|-------------|--------|
| BAQ-001 | Scope vs Scenario 4 vs Assumptions | Contradiction | P0 | **Scope** states auto-play triggers only once per session and backgrounding does NOT re-trigger it. **Assumptions** state animation replays on background-to-foreground return. **Scenario 4** says auto-play will continue replay when app returns. Which behavior is correct for: (a) animation in progress when backgrounded, (b) animation completed then backgrounded? | Conflicting documented behaviors — cannot finalize expected results | TC_016, TC_017, TC_036 | | Open |
| BAQ-002 | FR-012 / Assumptions | Ambiguous Requirement | P0 | CMS is requested to configure only 1 animated icon, but FSD states **no FE restriction** for multiple animations. If CMS configures 2+ animated icons, should all animate, only the first, or first per priority order? | Multi-icon CMS behavior undefined | TC_025, TC_026, TC_039 | | Open |
| BAQ-003 | Questions S.No 1 — Guest Users | Missing Detail | P0 | Should bottom nav icon auto-play animation apply to **guest users**? FSD notes guest nav is hardcoded on FE. Product comment suggests exploring Shots-style promotion hook for guests. Please confirm: enable for guests, logged-in only, or defer? | Guest user expected behavior blocks P0 test finalization | TC_042, TC_043, TC_047 | | Open |
| BAQ-004 | FR-024 — Bottom Nav API | Missing Detail | P1 | FSD references FE calling bottom nav list API with animation Lottie but does not document **endpoint path, response schema, field names** for animated icon, Lottie URL, and loop count. Please provide API contract or link. | API test cases need exact field names and response structure | TC_044, TC_045, TC_046, TC_048 | | Open |
| BAQ-005 | BR-002 — Assumption | Ambiguous Requirement | P1 | Assumption states animation replays after: tap animated icon mid-animation → navigate away → background → foreground. Does this override the once-per-session rule? Is replay limited to this specific sequence only? | Sequence-specific replay rule needs confirmation | TC_019 | | Open |
| BAQ-006 | FR-014 — Loop Count | Acceptance Criteria Gap | P1 | What is the **valid range** for CMS loop count (min/max)? What should FE do for loopCount=0, negative, or missing value — skip animation, default to 2, or error? | Boundary/negative test expected results need pass/fail criteria | TC_034, TC_035 | | Open |
| BAQ-007 | Animation Assets | Missing Reference | P2 | FSD references **Bottom Nav icon Animations Outlines** asset link but asset is not attached. Please provide finalized Lottie files or accessible link for QA visual validation. | Visual/asset validation tests need reference files | TC_031, TC_032, TC_033 | | Open |
| BAQ-008 | FR-017 — Accessibility | Missing Detail | P2 | When prefers-reduced-motion is enabled, should the icon show **static unselected** state or skip only Lottie motion while keeping selected state on tap? Any platform-specific differences (iOS vs Android)? | Accessibility edge cases need specified UI state | TC_029, TC_030 | | Open |
| BAQ-009 | FR-011 — Home Icon | Out of FSD Scope | P2 | Home icon is hardcoded selected on FE. On cold start, is Home always the **default landing tab** while another icon animates unselected? Confirm expected visual when Home is selected and Favourites (e.g.) is animating. | Combined Home-selected + other-icon-animating UI state unclear | TC_023, TC_024 | | Open |

---

## Items Not Appropriate to Leave in FSD

| Item | Issue | Recommendation |
|------|-------|----------------|
| Scope vs Assumptions on backgrounding | Contradictory statements in same document | Resolve in one authoritative section with explicit scenarios |
| Bottom Nav API | Referenced in Questions but no API schema in FSD | Attach API contract or move to technical spec |
| Guest user behavior | Open product question left in Questions table | Add confirmed requirement after product decision |
| Animation asset link | External reference without attachment | Attach assets or provide stable internal link |

---

## Instructions for BA

1. Review each query and provide response in the **BA Response** column.
2. Update **Status** to `Answered`, `Deferred`, or `Out of Scope`.
3. If FSD is updated, share revised FSD version with QA.
