# RT-1266 — Full QA Test Case Report

**FSD:** Bottom Navigation Icon Animation handling (v0.3)  
**Source:** `fsd/1787905757201-RT-1266___Bottom_Navigation_Icon_Animation_handling_v0.3__1_.docx`  
**Generated:** 2026-08-28

---

## 1. FSD Summary

RT-1266 introduces **auto-play Lottie animations** on a single CMS-configured bottom navigation icon in the **TataPlay Mobile Apps (TPMA)** on cold start / app relaunch. The animation draws user attention to a promoted feature (e.g., Favourites, Live TV, On Demand, My Account).

### Scope
- Auto-play one CMS-configured bottom nav icon on app launch
- Default 2 animation loops (CMS configurable)
- Tap during animation → stop animation, show selected state, navigate to tab
- Auto-play once per session; cold start / force-kill resets session
- Respects prefers-reduced-motion accessibility setting
- Graceful fallback when CMS config missing

### Key Scenarios
1. App Launch (Cold Start)
2. User Taps Icon During Animation
3. User Taps Other Icons
4. App Backgrounding
5. Navigation Away & Return

### Out of Scope
- Rotating animations across multiple icons per session
- Hot-reload CMS during active session
- Web/desktop (mobile only)

### Platforms
- Android and iOS mobile apps only

---

## 2. Identified Requirements

24 requirements (FR-001 to FR-024, BR-001 to BR-025) — see `coverage-summary.md`.

---

## 3. Assumptions

| # | Assumption | Basis |
|---|------------|-------|
| A-001 | Bottom nav list API is the CMS source for animation config for logged-in users | FSD Questions section |
| A-002 | Default loop count is 2 when CMS value absent | FSD states first release = 2 loops |
| A-003 | Home tab is default landing with hardcoded selected state | FSD Assumptions on Home icon |

---

## 4. Detailed Test Cases (Positive Functional/UI)

52 test cases in `test-cases.csv` covering all 5 FSD scenarios, CMS configuration, accessibility, backward compatibility, and out-of-scope validation.

---

## 5. API/Backend Test Cases

5 API cases in `api-test-cases.csv` for bottom nav list API animation fields (endpoint schema pending BA — see BAQ-004).

---

## 6. Database Test Cases

N/A — FSD does not define database behavior.

---

## 7. Negative & Edge Case Coverage

Negative cases: TC_023, TC_024, TC_027, TC_028, TC_029, TC_035, TC_037, TC_039–TC_041, TC_043, TC_046  
Boundary cases: TC_034, TC_035, TC_026

---

## 8. Regression Coverage

4 regression cases (TC_049–TC_052) in `regression-test-cases.csv` — bottom nav navigation, static display, performance, unrelated features.

---

## 9. Requirement Coverage Summary

See `coverage-summary.md`.

---

## 10. Open Questions (Internal QA Notes)

- **Scope vs Assumptions contradiction** on backgrounding replay behavior — raised as BAQ-001
- **Guest user animation** — product open question in FSD Questions table — raised as BAQ-003
- **Multiple CMS animated icons** — no FE restriction but business requests single icon — raised as BAQ-002
- **API contract** not in FSD — raised as BAQ-004

---

## 11. Open Queries for BA

See `ba-open-queries.md` — 9 queries (3 P0 blockers) pending BA response.
