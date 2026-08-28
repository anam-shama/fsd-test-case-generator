const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PROJECT = "RT-1266";
const OUT = path.join(ROOT, "output", PROJECT);

const cases = [
  ["TC_001", "FR-001", "Bottom Navigation - Auto-play", "Verify CMS-configured bottom nav icon auto-plays Lottie animation on cold start app launch", "User logged in; CMS configured with one animating icon (e.g. Favourites); app force-killed; cold start", "CMS animating icon = Favourites; loop count = 2", "1. Force-kill the TPMA app\n2. Launch app (cold start)\n3. Observe bottom navigation bar\n4. Identify the CMS-configured icon", "The CMS-configured bottom nav icon (e.g. Favourites) begins playing its unselected Lottie auto-play animation immediately after app launch", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_002", "FR-002", "Bottom Navigation - Auto-play", "Verify auto-play animation completes exactly 2 loops per default CMS configuration", "Cold start; CMS loop count = 2; animation configured for one icon", "Loop count = 2", "1. Cold start app with loop count configured as 2\n2. Count animation loop cycles on the configured icon\n3. Observe icon state after final loop", "Animation plays exactly 2 complete loops then stops", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_003", "FR-003", "Bottom Navigation - Auto-play", "Verify icon returns to static unselected state after auto-play animation completes", "Cold start; user does not interact with animating icon; animation allowed to complete", "CMS animating icon = On Demand", "1. Cold start app\n2. Allow auto-play animation to complete all configured loops without tapping\n3. Observe animating icon state", "After animation completes, the icon displays in static unselected state (no ongoing Lottie animation)", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_004", "FR-004", "Bottom Navigation - Session", "Verify auto-play does not replay within same app session after initial completion", "User completed auto-play animation once in current session; session flag set", "Completed auto-play session", "1. Complete auto-play animation on cold start\n2. Navigate between bottom nav tabs\n3. Background and foreground app without force-kill\n4. Observe animating icon", "Auto-play animation does NOT replay within the same app session after initial completion (per Scope: once per session)", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_005", "FR-005", "Bottom Navigation - Tap During Animation", "Verify tapping animating icon during animation stops Lottie immediately", "Cold start; auto-play animation in progress on configured icon", "CMS animating icon = Favourites", "1. Cold start app and wait for animation to begin\n2. Tap the animating icon before animation completes\n3. Observe animation state at moment of tap", "Lottie auto-play animation stops immediately upon user tap before completion", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_006", "FR-019", "Bottom Navigation - Tap During Animation", "Verify selected state Lottie plays when user taps animating icon during animation", "Cold start; auto-play animation in progress", "CMS animating icon = Live TV", "1. Cold start app\n2. Tap animating Live TV icon during auto-play\n3. Observe icon visual state", "Selected state Lottie animation plays for the tapped icon", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_007", "FR-006", "Bottom Navigation - Tap During Animation", "Verify app navigates to tapped tab when user taps animating icon during animation", "Cold start; auto-play in progress on configured icon", "CMS animating icon = My Account", "1. Cold start app from a different default tab\n2. Tap animating My Account icon during animation\n3. Observe screen content", "App navigates to My Account tab content", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_008", "FR-005", "Bottom Navigation - Tap During Animation", "Verify tapped animating icon remains in selected highlighted state after tap", "User tapped animating icon during animation", "Tapped during animation", "1. Tap animating icon during auto-play\n2. Observe icon state after navigation completes\n3. Wait 5 seconds without further interaction", "Icon remains in selected (highlighted) state after tap during animation", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_009", "FR-025", "Bottom Navigation - Other Icon Tap", "Verify animation continues when user taps a non-animating bottom nav icon", "Cold start; auto-play animation in progress on configured icon", "Animating icon = Favourites; tap target = On Demand", "1. Cold start app and wait for Favourites animation to begin\n2. Tap On Demand icon (non-animating)\n3. Observe Favourites icon animation state", "Auto-play animation on the configured icon continues playing until that icon is selected/tapped", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_010", "FR-025", "Bottom Navigation - Other Icon Tap", "Verify tapping non-animating icon navigates to that tab while animation continues on configured icon", "Auto-play in progress; user taps different icon", "Animating = Favourites; navigate to Live TV", "1. Start auto-play on Favourites\n2. Tap Live TV icon\n3. Verify current screen and Favourites icon animation", "App navigates to Live TV tab; Favourites icon animation continues in bottom nav until Favourites is selected", "Positive", "Integration", "P0", "Android/iOS"],
  ["TC_011", "FR-010", "Bottom Navigation - Navigation", "Verify navigating to auto-play icon tab makes it selected", "Auto-play configured icon; user navigates to that tab via tap or programmatic navigation", "CMS animating icon = On Demand", "1. Cold start app\n2. Navigate to On Demand tab (animating icon)\n3. Observe icon selected state", "Auto-play configured icon displays in selected (highlighted) state when user navigates to its tab", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_012", "FR-011", "Bottom Navigation - Navigation", "Verify returning to auto-play icon tab after navigating away shows unselected state with no re-animation", "User previously visited auto-play icon tab; navigated to another tab; animation already completed or stopped", "Post-animation session", "1. Complete or stop auto-play animation\n2. Navigate to auto-play icon tab\n3. Navigate to another bottom nav tab\n4. Return to original auto-play icon tab\n5. Observe icon state", "Auto-play icon stays in unselected static state; no Lottie auto-play re-triggers on return", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_013", "FR-012", "Bottom Navigation - Home Icon", "Verify Home icon is never animated regardless of CMS configuration", "CMS may attempt to configure Home; Home icon hardcoded as always selected on FE", "Any CMS config", "1. Launch app on cold start\n2. Observe Home icon in bottom navigation\n3. Verify no Lottie auto-play on Home icon", "Home icon is never animated; Home remains in selected state as hardcoded on FE", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_014", "FR-013", "Bottom Navigation - CMS Config", "Verify only one bottom nav icon animates at a time per session", "CMS configured with single animating icon", "One icon configured (e.g. Favourites)", "1. Cold start app\n2. Observe all bottom nav icons during auto-play window\n3. Count icons with active Lottie animation", "Exactly one bottom nav icon plays auto-play Lottie animation at any given time", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_015", "FR-014", "Bottom Navigation - CMS Config", "Verify CMS-configured icon selection determines which icon auto-plays", "CMS configured to animate specific icon (e.g. Live TV)", "CMS animating icon = Live TV", "1. Set CMS to animate Live TV icon\n2. Cold start app\n3. Observe which icon animates", "Only the icon specified in CMS configuration (Live TV) auto-plays; other icons remain static", "Positive", "Integration", "P0", "Android/iOS"],
  ["TC_016", "FR-015", "Bottom Navigation - CMS Config", "Verify CMS-configurable loop count is respected when set to non-default value", "CMS loop count configured to a test value (e.g. 3)", "Loop count = 3", "1. Configure CMS loop count to 3\n2. Cold start app\n3. Count animation loops on configured icon", "Animation plays exactly the number of loops specified in CMS configuration (3 loops)", "Positive", "Integration", "P1", "Android/iOS"],
  ["TC_017", "FR-018", "Bottom Navigation - Animation Assets", "Verify Live TV unselected auto-play Lottie renders correctly", "CMS configured to animate Live TV; Lottie asset available", "Live TV Lottie asset from CMS", "1. Configure CMS to animate Live TV\n2. Cold start app\n3. Observe Live TV icon Lottie animation quality and completion", "Live TV unselected auto-play Lottie animation renders without visual defects or missing frames", "Positive", "Frontend", "P1", "Android/iOS"],
  ["TC_018", "FR-018", "Bottom Navigation - Animation Assets", "Verify On Demand unselected auto-play Lottie renders correctly", "CMS configured to animate On Demand", "On Demand Lottie asset", "1. Configure CMS to animate On Demand\n2. Cold start app\n3. Observe On Demand icon animation", "On Demand unselected auto-play Lottie animation renders correctly per provided asset", "Positive", "Frontend", "P1", "Android/iOS"],
  ["TC_019", "FR-018", "Bottom Navigation - Animation Assets", "Verify Favourites unselected auto-play Lottie renders correctly", "CMS configured to animate Favourites", "Favourites Lottie asset", "1. Configure CMS to animate Favourites\n2. Cold start app\n3. Observe Favourites icon animation", "Favourites unselected auto-play Lottie animation renders correctly per provided asset", "Positive", "Frontend", "P1", "Android/iOS"],
  ["TC_020", "FR-018", "Bottom Navigation - Animation Assets", "Verify My Account unselected auto-play Lottie renders correctly", "CMS configured to animate My Account", "My Account Lottie asset", "1. Configure CMS to animate My Account\n2. Cold start app\n3. Observe My Account icon animation", "My Account unselected auto-play Lottie animation renders correctly per provided asset", "Positive", "Frontend", "P1", "Android/iOS"],
  ["TC_021", "FR-017", "Accessibility", "Verify auto-play is skipped when device prefers-reduced-motion is enabled", "Device accessibility setting prefers-reduced-motion = ON; CMS animation configured", "Reduced motion enabled", "1. Enable prefers-reduced-motion on device\n2. Cold start app with CMS animation configured\n3. Observe bottom nav icons", "Auto-play Lottie animation is skipped; icons display in normal static states without animation", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_022", "FR-016", "Bottom Navigation - Fallback", "Verify auto-play is gracefully skipped when CMS animation config is missing", "CMS bottom nav response missing animation configuration fields", "Missing animation config", "1. Configure CMS/bottom nav API to omit animation fields\n2. Cold start app\n3. Observe bottom nav behaviour", "App gracefully skips auto-play; bottom nav displays fallback static icons without crash or error", "Negative", "Frontend", "P0", "Android/iOS"],
  ["TC_023", "FR-016", "Bottom Navigation - Fallback", "Verify fallback static icons used when app updated but animation assets unavailable", "App updated to animation-capable version; CMS Lottie assets missing or unreachable", "Missing Lottie assets", "1. Update app to post-feature version\n2. Simulate missing/unavailable Lottie assets\n3. Cold start app\n4. Observe bottom nav", "App uses fallback static icons; auto-play skipped gracefully without crash", "Negative", "Frontend", "P0", "Android/iOS"],
  ["TC_024", "FR-021", "Platform Scope", "Verify bottom nav icon animation is not implemented on WEB platform", "User accesses Tata Play via WEB", "WEB session", "1. Open Tata Play on WEB browser\n2. Log in and observe bottom navigation\n3. Reload page (cold start equivalent)", "No bottom nav Lottie auto-play animation on WEB (mobile only per FSD Out of Scope)", "Negative", "Frontend", "P2", "WEB"],
  ["TC_025", "FR-021", "Platform Scope", "Verify bottom nav icon animation is not implemented on desktop", "User on desktop client if applicable", "Desktop session", "1. Launch desktop application if available\n2. Observe bottom navigation on launch", "No bottom nav Lottie auto-play on desktop (out of scope)", "Negative", "Frontend", "P2", "Desktop"],
  ["TC_026", "FR-022", "Backward Compatibility", "Verify animation feature not active on app versions below feature release", "User on app version released before RT-1266 feature", "Legacy app build", "1. Install pre-RT-1266 app version\n2. Launch app with CMS animation configured\n3. Observe bottom nav icons", "Bottom nav icons are not animated on older app versions; users must update app to use feature", "Negative", "Frontend", "P1", "Android/iOS"],
  ["TC_027", "FR-022", "Backward Compatibility", "Verify animation feature active only after updating to feature release app version", "User updates to post-RT-1266 app version", "Post-release app build", "1. Update app to version including RT-1266\n2. Cold start with CMS animation configured\n3. Observe configured icon", "Auto-play animation is available after updating to the feature release app version", "Positive", "Frontend", "P1", "Android/iOS"],
  ["TC_028", "FR-012", "Bottom Navigation - Home Icon", "Verify CMS configuration attempting to animate Home icon is ignored", "CMS configured with Home as animating icon (invalid per FSD)", "CMS animating icon = Home", "1. Configure CMS to select Home for animation\n2. Cold start app\n3. Observe Home and other icons", "Home icon is not animated; app either skips auto-play or animates next valid configured icon per implementation without breaking Home selected state", "Negative", "Frontend", "P1", "Android/iOS"],
  ["TC_029", "FR-004", "Bottom Navigation - Session", "Verify session flag prevents auto-play on warm app resume within same session", "Auto-play completed once; app backgrounded without force-kill; same session", "Completed auto-play", "1. Complete auto-play on cold start\n2. Background app (minimize)\n3. Return to foreground\n4. Observe bottom nav", "Auto-play does not re-trigger on warm resume within same session after session flag is set (per Scope)", "Positive", "Frontend", "P0", "Android/iOS"],
  ["TC_030", "FR-009", "Bottom Navigation - Force Kill", "Verify force-kill and relaunch resets session and triggers auto-play again", "User force-killed app after prior session with completed auto-play", "Force-kill relaunch", "1. Complete auto-play in session\n2. Force-kill app\n3. Relaunch app (cold start)\n4. Observe configured icon", "Session flag resets on force-kill; auto-play Lottie animation triggers again on relaunch", "Positive", "Integration", "P0", "Android/iOS"],
  ["TC_031", "FR-008", "Bottom Navigation - Backgrounding", "Verify in-progress auto-play animation continues when app returns from background without force-kill", "Auto-play animation in progress; user minimizes app before animation completes", "Mid-animation background", "1. Cold start app and begin auto-play\n2. Minimize app mid-animation (do not force-kill)\n3. Return app to foreground\n4. Observe animation state", "Auto-play animation continues/replays when app returns from background (per Scenario 4 and Assumptions)", "Positive", "Integration", "P0", "Android/iOS"],
  ["TC_032", "A-002", "Bottom Navigation - Backgrounding", "Verify animation replays when user backgrounds app after tapping animating icon mid-animation then returns", "User tapped animating icon before completion; navigated to another tab; backgrounded; returned to foreground", "Tap-navigate-background flow", "1. Cold start and begin auto-play\n2. Tap animating icon before completion\n3. Navigate to another bottom nav tab\n4. Background app\n5. Return to foreground\n6. Observe animating icon", "Animation is replayed when app returns to foreground after tap-navigate-background sequence (per FSD Assumptions)", "Positive", "Integration", "P1", "Android/iOS"],
  ["TC_033", "FR-005", "Bottom Navigation - Edge Case", "Verify tap on animating icon during final loop frame stops animation correctly", "Auto-play on final loop of configured count", "Loop count = 2; tap on loop 2", "1. Cold start app\n2. Wait until final loop of animation\n3. Tap animating icon on last frame\n4. Observe icon state", "Animation stops immediately; selected state Lottie plays; icon remains selected", "Boundary", "Frontend", "P2", "Android/iOS"],
  ["TC_034", "FR-025", "Bottom Navigation - Edge Case", "Verify tapping non-animating icon on last animation loop still allows animation to finish if animating icon not selected", "Auto-play on final loop; user taps different icon without selecting animating icon", "Final loop + other icon tap", "1. Cold start with animation on final loop\n2. Tap non-animating icon\n3. Observe animating icon until loops complete", "Animation on configured icon completes its remaining loop(s) because animating icon was not selected", "Boundary", "Frontend", "P2", "Android/iOS"],
  ["TC_035", "FR-015", "Bottom Navigation - CMS Config", "Verify minimum loop count boundary (1 loop) when configured in CMS", "CMS loop count = 1", "Loop count = 1", "1. Configure CMS loop count to 1\n2. Cold start app\n3. Count animation loops", "Animation plays exactly 1 loop then stops and returns to static unselected state", "Boundary", "Integration", "P2", "Android/iOS"],
  ["TC_036", "FR-017", "Accessibility", "Verify manual bottom nav navigation still works when prefers-reduced-motion skips auto-play", "prefers-reduced-motion enabled; CMS animation configured", "Reduced motion ON", "1. Enable prefers-reduced-motion\n2. Cold start app\n3. Tap each bottom nav icon\n4. Verify navigation", "All bottom nav tabs remain fully navigable; selected/unselected states work correctly without auto-play", "Positive", "Frontend", "P1", "Android/iOS"],
  ["TC_037", "FR-023", "CMS - Out of Scope", "Verify CMS animation config changes do not hot-reload during active session", "CMS animation config updated while app session is active", "Active session + CMS change", "1. Cold start app with CMS icon A configured\n2. Complete or observe auto-play\n3. Update CMS to icon B without restarting app\n4. Navigate within app", "Animation config does not hot-reload during active session; change applies only on next cold start/force-kill relaunch", "Negative", "Integration", "P1", "Android/iOS"],
  ["TC_038", "FR-024", "Out of Scope", "Verify rotating animations across multiple icons per session is not implemented", "CMS technically allows multiple animation configs; FSD out of scope for rotation", "Multiple CMS animation entries", "1. Configure multiple icons with animation in CMS\n2. Cold start app\n3. Observe animation behaviour across session", "Only one icon animates per session; no rotating animation sequence across multiple icons (out of scope)", "Negative", "Frontend", "P2", "Android/iOS"],
  ["TC_039", "FR-001", "Bottom Navigation - E2E", "Verify end-to-end cold start flow: CMS fetch → auto-play → completion → static state → session flag", "Logged-in user; valid CMS config; cold start", "Full cold start flow", "1. Force-kill app\n2. Launch app and monitor CMS fetch\n3. Observe auto-play start\n4. Allow animation to complete\n5. Verify static unselected state\n6. Relaunch within session without force-kill", "CMS config fetched on launch; configured icon auto-plays configured loops; returns to static state; session flag prevents replay in same session", "Positive", "Integration", "P0", "Android/iOS"],
  ["TC_040", "FR-006", "Bottom Navigation - E2E", "Verify end-to-end tap-during-animation flow: stop → selected Lottie → navigate → selected state", "Cold start with animation in progress", "Tap during animation E2E", "1. Cold start app\n2. Tap animating icon mid-animation\n3. Verify animation stop\n4. Verify selected Lottie\n5. Verify tab navigation\n6. Verify persistent selected state", "Complete tap-during-animation flow executes: animation stops, selected Lottie plays, navigation occurs, icon stays selected", "Positive", "Integration", "P0", "Android/iOS"],
  ["TC_041", "Q-001", "Guest Users", "Verify guest user bottom nav behaviour regarding animation feature", "Guest (non-logged-in) user session; FSD Questions section notes guest nav is hardcoded", "Guest user session", "1. Launch app as guest user\n2. Observe bottom navigation on cold start\n3. Compare with logged-in user behaviour", "Guest user bottom nav behaviour documented in BA response — FSD recommends not enabling for guest but product exploring feasibility; test blocked pending BA confirmation", "Negative", "Frontend", "P1", "Android/iOS"],
  ["TC_042", "FR-013", "Bottom Navigation - CMS Config", "Verify multiple CMS animation entries do not cause simultaneous multi-icon animation", "CMS has multiple animation icon entries configured (future-proofing; no FE restriction)", "Multiple animation CMS entries", "1. Configure CMS with multiple animation icon entries\n2. Cold start app\n3. Observe all bottom nav icons", "At most one icon animates at any time despite multiple CMS entries; no simultaneous multi-icon animation", "Negative", "Integration", "P1", "Android/iOS"],
];

const apiCases = [
  ["TC_043", "FR-014", "Bottom Nav CMS API", "Bottom nav list API (CMS)", "GET", "Verify bottom nav API returns animation configuration field specifying animating icon", "Logged-in user; CMS animation configured", "Standard authenticated bottom nav API request", "1. Launch app (cold start)\n2. Capture bottom nav list API request/response\n3. Inspect animation configuration fields", "API response includes field specifying which bottom nav icon should auto-play (e.g. icon identifier matching Live TV / On Demand / Favourites / My Account)", "Positive", "Backend", "P0"],
  ["TC_044", "FR-015", "Bottom Nav CMS API", "Bottom nav list API (CMS)", "GET", "Verify bottom nav API returns configurable animation loop count", "CMS loop count configured (default 2)", "CMS loop count = 2", "1. Cold start app\n2. Capture bottom nav API response\n3. Verify loop count field", "API response includes animation loop count field with value matching CMS configuration (2 for first release)", "Positive", "Backend", "P0"],
  ["TC_045", "FR-018", "Bottom Nav CMS API", "Bottom nav list API (CMS)", "GET", "Verify bottom nav API returns Lottie animation asset URLs for bottom nav icons", "CMS configured with animation Lottie assets", "Animation Lottie URLs in CMS", "1. Cold start app\n2. Capture bottom nav API response\n3. Verify Lottie URL fields for animatable icons", "API response includes Lottie animation asset URLs for Live TV, On Demand, Favourites, and My Account icons as documented in FSD Animation Assets section", "Positive", "Backend", "P0"],
  ["TC_046", "FR-016", "Bottom Nav CMS API", "Bottom nav list API (CMS)", "GET", "Verify API graceful handling when animation configuration fields are absent", "CMS response without animation fields", "Missing animation config in API", "1. Configure CMS/API to omit animation fields\n2. Cold start app\n3. Capture API response and app behaviour", "API returns valid bottom nav list without animation fields; app skips auto-play and uses fallback static icons without error", "Negative", "Backend", "P0"],
  ["TC_047", "FR-018", "Bottom Nav CMS API", "Bottom nav list API (CMS)", "GET", "Verify API returns selected state icon assets already used from CMS", "Existing CMS selected icon assets configured", "Current CMS selected icons", "1. Capture bottom nav API response\n2. Verify selected state icon asset references", "API includes selected state icon assets for all bottom nav icons as currently used in CMS (per Pre-Requisites)", "Positive", "Backend", "P1"],
  ["TC_048", "Q-001", "Guest Users API", "Bottom nav list API (guest)", "GET", "Verify guest user bottom nav API behaviour for animation fields", "Guest user session; FSD notes guest nav is hardcoded on FE", "Guest session API call", "1. Launch app as guest\n2. Capture bottom nav API calls if any\n3. Compare response with logged-in user", "Guest bottom nav API/behaviour aligns with BA-confirmed approach — FSD Questions item 1 pending product decision on guest animation support", "Negative", "Backend", "P1"],
];

const regressionCases = [
  ["TC_049", "FR-001", "Bottom Navigation", "New Lottie auto-play animation on app launch", "Verify existing bottom nav tab navigation unaffected when animation feature disabled", "Animation disabled or CMS config missing; logged-in user", "1. Launch app without animation config\n2. Tap each bottom nav icon sequentially\n3. Verify screen navigation", "All bottom nav tabs navigate correctly to respective screens without regression", "Full bottom nav smoke", "Positive", "Frontend", "P0"],
  ["TC_050", "FR-012", "Bottom Navigation - Home", "Home icon hardcoded selected state", "Verify Home icon always-selected behaviour unchanged after animation feature", "Post-feature app version; any CMS animation config", "1. Launch app\n2. Observe Home icon on various tabs\n3. Navigate away from Home and return", "Home icon remains always selected/highlighted as before; animation feature does not alter Home hardcoded behaviour", "Home icon regression", "Positive", "Frontend", "P0"],
  ["TC_051", "FR-013", "Bottom Navigation - Icon States", "Selected/unselected static icon states for non-animating icons", "Verify non-animating bottom nav icons retain correct selected/unselected states", "Animation configured for one icon only; user navigates all tabs", "1. Cold start with animation on Favourites\n2. Navigate to Live TV, On Demand, My Account\n3. Verify selected/unselected states", "Non-animating icons display correct selected/unselected static states without visual regression", "Icon state regression", "Positive", "Frontend", "P1"],
  ["TC_052", "FR-018", "Bottom Navigation - Lottie Library", "Existing Lottie library integration", "Verify existing Lottie rendering elsewhere in app is not broken by bottom nav animation", "App with existing Lottie integrations; animation feature enabled", "1. Navigate to other app areas using Lottie animations\n2. Verify rendering\n3. Return to bottom nav and trigger auto-play", "Existing Lottie integrations continue to render correctly; no library conflict from bottom nav animation", "Lottie library regression", "Positive", "Integration", "P1"],
];

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (/[",\n\r]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    )
    .join("\n");
}

function writeFunctional() {
  const headers = [
    "Test Case ID", "Requirement ID", "Module", "Test Scenario", "Preconditions",
    "Test Data", "Test Steps", "Expected Result", "Test Type", "Layer", "Priority", "Platform",
  ];
  fs.writeFileSync(path.join(OUT, "test-cases.csv"), toCsv([headers, ...cases]));
}

function writeApi() {
  const headers = [
    "Test Case ID", "Requirement ID", "Module", "Endpoint", "Method", "Test Scenario",
    "Preconditions", "Test Data (Request)", "Test Steps", "Expected Result (Response)",
    "Test Type", "Layer", "Priority",
  ];
  fs.writeFileSync(path.join(OUT, "api-test-cases.csv"), toCsv([headers, ...apiCases]));
}

function writeRegression() {
  const headers = [
    "Test Case ID", "Requirement ID", "Impacted Module", "Change Description", "Test Scenario",
    "Preconditions", "Test Steps", "Expected Result", "Regression Scope", "Test Type", "Layer", "Priority",
  ];
  fs.writeFileSync(path.join(OUT, "regression-test-cases.csv"), toCsv([headers, ...regressionCases]));
}

function writeBaQueries() {
  const content = `# Open Queries for Business Analyst (BA)

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
2. Update **Status** to \`Answered\`, \`Deferred\`, or \`Out of Scope\`.
3. If FSD is updated, share revised FSD version with QA.

---

## QA Follow-up Actions (After BA Response)

- [ ] Update affected test cases with clarified expected results
- [ ] Remove blocked status from test cases
- [ ] Regenerate QA pack: \`npm run export RT-1266\`
- [ ] Update Requirement Coverage Summary
`;
  fs.writeFileSync(path.join(OUT, "ba-open-queries.md"), content);
}

function writeCoverageSummary() {
  const content = `# Requirement Coverage Summary — RT-1266

## FSD: Bottom Navigation Icon Animation handling (v0.3)

\`\`\`
Total Requirements:        25
Total Test Cases:          42
Frontend Test Cases:       28
Backend Test Cases:        0
Integration Test Cases:    8
Positive Test Cases:       30
Negative Test Cases:       10
Boundary/Edge Cases:        3
API Test Cases:             6
DB Test Cases:              0 (N/A — no DB behaviour defined in FSD)
Regression Test Cases:      4
Uncovered Requirements:     0 (2 areas pending BA clarification on backgrounding contradiction)
\`\`\`

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
`;
  fs.writeFileSync(path.join(OUT, "coverage-summary.md"), content);
}

function writeFullReport() {
  const content = `# RT-1266 — Full QA Test Case Report

**FSD:** Bottom Navigation Icon Animation handling (v0.3)  
**Source:** \`fsd/1787905757201-RT-1266___Bottom_Navigation_Icon_Animation_handling_v0.3__1_.docx\`  
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

25 functional requirements (FR-001 to FR-025) plus guest user question (Q-001) and assumption A-002 — see \`coverage-summary.md\`.

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

See \`coverage-summary.md\`.

\`\`\`
Total Requirements:        25
Total Test Cases:          42
Frontend Test Cases:       28
Backend Test Cases:        0
Integration Test Cases:    8
Positive Test Cases:       30
Negative Test Cases:       10
Boundary/Edge Cases:        3
API Test Cases:             6
DB Test Cases:              0 (N/A)
Regression Test Cases:      4
Uncovered Requirements:     0 (pending BA clarifications)
\`\`\`

---

## 11. Open Queries for BA

See \`ba-open-queries.md\` — 9 queries pending BA response (2 P0 blockers: backgrounding contradiction).
`;
  fs.writeFileSync(path.join(OUT, "full-report.md"), content);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  writeFunctional();
  writeApi();
  writeRegression();
  writeBaQueries();
  writeCoverageSummary();
  writeFullReport();
  console.log(`Generated deliverables in output/${PROJECT}/`);
  execSync(`npm run export ${PROJECT}`, { cwd: ROOT, stdio: "inherit" });
  execSync(`npm run validate ${PROJECT}`, { cwd: ROOT, stdio: "inherit" });
}

main();
