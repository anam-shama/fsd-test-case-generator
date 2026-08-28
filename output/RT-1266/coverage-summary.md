# Requirement Coverage Summary — RT-1266

## FSD: Bottom Navigation Icon Animation handling (v0.3)

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
DB Test Cases:              0 (N/A — no DB behaviour defined in FSD)
Regression Test Cases:      4
Uncovered Requirements:     0 (2 areas pending BA clarification on backgrounding contradiction)
```

## Requirement Traceability

| Requirement ID | Description | Test Case IDs | Covered |
|----------------|-------------|---------------|---------|
| FR-001 | Auto-play single CMS-configured icon on app launch | TC_001, TC_039 | Yes |
| FR-002 | Animation plays configurable loop count (default 2) | TC_002 | Yes |
| FR-003 | Icon returns to static unselected after animation | TC_003 | Yes |
| FR-004 | Session flag prevents replay within same session | TC_004, TC_029 | Yes |
| FR-005 | Tap during animation stops Lottie immediately | TC_005, TC_033 | Yes |
| FR-006 | Navigate to tab when tapping animating icon | TC_007, TC_040 | Yes |
| FR-007 | Tap non-animating icon — animation continues | TC_009, TC_010 | Yes |
| FR-008 | Backgrounding behaviour (minimize without force-kill) | TC_031 | Yes (pending BA clarification) |
| FR-009 | Force-kill relaunch resets session and triggers auto-play | TC_030 | Yes |
| FR-010 | Navigate to auto-play icon makes it selected | TC_011 | Yes |
| FR-011 | Return to auto-play icon — unselected, no re-animation | TC_012 | Yes |
| FR-012 | Home icon never animates (hardcoded selected) | TC_013, TC_028, TC_050 | Yes |
| FR-013 | Only one icon animates at a time | TC_014, TC_042, TC_038 | Yes |
| FR-014 | CMS field specifies animating icon | TC_015, TC_043 | Yes |
| FR-015 | CMS loop count configurable | TC_016, TC_035, TC_044 | Yes |
| FR-016 | Graceful skip when CMS config missing | TC_022, TC_023, TC_046 | Yes |
| FR-017 | prefers-reduced-motion skips auto-play | TC_021, TC_036 | Yes |
| FR-018 | Lottie assets for Live TV, On Demand, Favourites, My Account | TC_017–TC_020, TC_045 | Yes |
| FR-019 | Selected state Lottie on tap during animation | TC_006 | Yes |
| FR-020 | Cold start triggers auto-play | TC_001, TC_030 | Yes |
| FR-021 | Mobile only (Android/iOS) | TC_024, TC_025 | Yes |
| FR-022 | Backward compatibility — older app versions | TC_026, TC_027 | Yes |
| FR-023 | No hot-reload CMS during session | TC_037 | Yes |
| FR-024 | No rotating multi-icon animation | TC_038 | Yes |
| FR-025 | Animation continues until animating icon selected | TC_009, TC_010, TC_034 | Yes |
| Q-001 | Guest user animation behaviour (FSD Questions) | TC_041, TC_048 | Pending BA |
| A-002 | Tap-navigate-background animation replay assumption | TC_032 | Pending BA |
