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
| Blockers (P0) | 2 |
| High Priority (P1) | 5 |
| Medium Priority (P2) | 2 |

### By Category

| Category | Count | Description |
|----------|-------|-------------|
| Contradiction | 2 | Conflicting statements in FSD |
| Missing Detail | 2 | Required information not documented |
| Ambiguous Requirement | 1 | Multiple valid interpretations |
| Missing Reference | 2 | External doc/link referenced but not provided |
| Acceptance Criteria Gap | 1 | No measurable pass/fail criteria |
| Out of FSD Scope | 1 | Needs clarification from another source |

---

## Queries for BA

| Query ID | FSD Section / Requirement | Category | Priority | Query for BA | Why QA Cannot Proceed | Impacted Test Cases | BA Response | Status |
|----------|----------------------------|----------|----------|--------------|----------------------|---------------------|-------------|--------|
| BAQ-001 | Scope vs Assumptions — Backgrounding | Contradiction | P0 | **Scope** states "Auto-play triggers only once per app session; backgrounding does NOT re-trigger it." **Assumptions** state "Icon animation will replay when user come back to App from background to foreground." Which behaviour is correct for: (a) animation in progress when app minimized, (b) animation completed then backgrounded, (c) tap-navigate-background-return sequence? | Conflicting FSD statements produce opposite expected results for background/resume tests | TC_004, TC_029, TC_031, TC_032 | | Open |
| BAQ-002 | Scenario 4 vs Scope — Background resume | Contradiction | P0 | **Scenario 4** says "If user minimizes app (does NOT force-kill) then auto-play will continue replay when app returns." **Scope** says backgrounding does NOT re-trigger auto-play. Does "continue replay" mean resume in-progress animation only, or restart full auto-play sequence including session flag reset? | Cannot finalize pass/fail criteria for background/resume scenarios | TC_031, TC_032, TC_039 | | Open |
| BAQ-003 | Questions — Guest Users | Ambiguous Requirement | P1 | FSD Questions table (S.No 1): Product recommends not enabling animation for guest users (hardcoded nav) but also asks to explore if animation can act as hook (e.g. Shots). **Should guest users see bottom nav icon auto-play animation?** If yes, what is the CMS/API source for guest nav animation config? | Guest user test cases blocked without confirmed scope | TC_041, TC_048 | | Open |
| BAQ-004 | Animation Assets | Missing Reference | P1 | FSD references **"Assets Link: Bottom Nav icon Animations Outlines"** but the link/document is not attached to the FSD. Please provide the Lottie asset specification (file names, dimensions, loop behaviour, selected vs unselected variants). | Cannot validate animation asset compliance without reference files | TC_017, TC_018, TC_019, TC_020, TC_045 | | Open |
| BAQ-005 | FR-014 — CMS Configuration | Missing Detail | P1 | What are the **exact CMS field names/API response keys** for: (a) which icon animates, (b) loop count, (c) Lottie asset URLs? What are valid enum values for icon selection (Live TV, On Demand, Favourites, My Account)? | API test cases need documented field names and valid values | TC_043, TC_044, TC_045, TC_046 | | Open |
| BAQ-006 | FR-016 — Fallback Behaviour | Missing Detail | P1 | When CMS animation config is missing or Lottie assets unavailable, what is the **exact fallback behaviour**? Skip animation only, or fall back to a specific default icon/static asset? Any user-visible error or silent skip? | Fallback negative tests need precise expected behaviour | TC_022, TC_023, TC_046 | | Open |
| BAQ-007 | FR-013 — Multiple CMS Entries | Acceptance Criteria Gap | P1 | FSD states CMS may configure multiple animated icons (no FE restriction) but only 1 should display at a time. **If multiple icons are configured, which one takes precedence?** First in list, priority field, or random? | Cannot verify multi-entry CMS behaviour without selection rule | TC_042, TC_038 | | Open |
| BAQ-008 | Scenario 3 — Other Icon Tap | Missing Detail | P2 | Scenario 3: "If user taps a non-animating icon then the animation configured will continue to play until it is selected." Does tapping a non-animating icon **select** that tab AND leave animation running on the configured icon simultaneously? Confirm expected visual state of both icons. | Edge case UI state validation needs confirmation | TC_009, TC_010, TC_034 | | Open |
| BAQ-009 | Assumptions — Tap-Navigate-Background | Missing Reference | P2 | Assumption describes specific flow: tap animated icon before completion → navigate to another tab → background → foreground → animation replayed. Is this the **only** background-replay trigger, or does any background return replay animation? Please provide definitive acceptance criteria. | Background replay test scope unclear beyond documented assumption flow | TC_032 | | Open |

---

## Items Not Appropriate to Leave in FSD

| Item | Issue | Recommendation |
|------|-------|----------------|
| Scope vs Assumptions on backgrounding | Direct contradiction between sections | Resolve in one authoritative section with explicit scenarios |
| Animation Assets link | External reference without attachment | Attach Lottie assets or embed URLs in FSD |
| Guest user behaviour | Open product question left in Questions table | Confirm in-scope/out-of-scope with signed-off decision |
| CMS field names | Implementation detail referenced but not specified | Add API/CMS contract appendix |

---

## Instructions for BA

1. Review each query and provide response in the **BA Response** column.
2. Update **Status** to `Answered`, `Deferred`, or `Out of Scope`.
3. If FSD is updated, share revised FSD version with QA.

---

## QA Follow-up Actions (After BA Response)

- [ ] Update affected test cases with clarified expected results
- [ ] Remove blocked status from test cases
- [ ] Regenerate QA pack: `npm run export RT-1266`
- [ ] Update Requirement Coverage Summary
