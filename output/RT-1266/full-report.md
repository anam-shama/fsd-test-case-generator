# RT-1266 — Full QA Test Case Report

**FSD:** Bottom Navigation Icon Animation handling (v0.3)  
**Source:** `fsd/1787905757201-RT-1266___Bottom_Navigation_Icon_Animation_handling_v0.3__1_.docx`  
**Generated:** 2026-08-28

---

## 1. FSD Summary

RT-1266 introduces **CMS-configurable Lottie auto-play animation** on a single bottom navigation icon in the **TPMA Mobile App** (Android/iOS) at app launch (cold start). Animation draws user attention to a CMS-selected feature icon, plays for a configurable number of loops (default 2), and respects session, accessibility, and navigation rules.

### Key Features
- Auto-play one bottom nav icon on cold start / force-kill relaunch
- CMS-configurable animating icon and loop count
- Tap-during-animation: stop auto-play, show selected Lottie, navigate, remain selected
- Tap other icons: animation continues until animating icon is selected
- Session flag: auto-play once per session (Scope)
- prefers-reduced-motion: skip auto-play
- Missing CMS config: graceful fallback

### Animatable Icons
Live TV, On Demand, Favourites, My Account (Home excluded — hardcoded selected)

### Out of Scope
- Rotating animations across multiple icons per session
- Hot-reload CMS config during active session
- WEB and desktop platforms

---

## 2. Identified Requirements

25 functional requirements (FR-001 to FR-025) plus guest user question (Q-001) and assumption A-002 — see `coverage-summary.md`.

---

## 3. Assumptions

| # | Assumption | Basis |
|---|------------|-------|
| A-001 | Lottie library is already integrated and functional | FSD Pre-Requisites |
| A-002 | Animation replays on background-to-foreground return in specific flows | FSD Assumptions (contradicts Scope — flagged as BAQ-001) |
| A-003 | Bottom nav list API is the CMS source for animation config for logged-in users | FSD Questions table references FE API call |

---

## 4–9. Test Case Deliverables

- **test-cases.csv** — 42 functional/UI/integration cases
- **api-test-cases.csv** — 6 API/CMS cases
- **regression-test-cases.csv** — 4 regression cases
- **ba-open-queries.md** — 9 BA queries (2 P0 blockers on backgrounding contradiction)

---

## 10. Coverage Summary

See `coverage-summary.md`.

```
Total Requirements:        25
Total Test Cases:          42
Frontend Test Cases:       31
Backend Test Cases:        0
Integration Test Cases:    11
Positive Test Cases:       30
Negative Test Cases:       10
Boundary/Edge Cases:        3
API Test Cases:             6
DB Test Cases:              0 (N/A)
Regression Test Cases:      4
Uncovered Requirements:     0 (pending BA clarifications)
```

---

## 11. Open Queries for BA

See `ba-open-queries.md` — 9 queries pending BA response (2 P0 blockers: backgrounding contradiction).
