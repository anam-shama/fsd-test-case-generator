const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PROJECT = "RT-1266";
const OUT = path.join(ROOT, "output", PROJECT);

const cases = [
  ["TC_001","FR-001","Cold Start","Verify CMS-configured bottom nav icon auto-plays Lottie animation on cold start","App force-killed; user logged in; CMS configured for Favourites icon animation; prefers-reduced-motion disabled","CMS: animatedIcon=Favourites; loopCount=2","1. Force-kill app\n2. Launch app (cold start)\n3. Observe bottom navigation Favourites icon","Favourites icon begins Lottie auto-play animation immediately after bottom nav renders on cold start", "Positive","Integration","P0","Android/iOS"],
  ["TC_002","FR-002","Cold Start","Verify animation plays exactly 2 loops (default CMS config) then stops","Cold start; CMS loopCount=2; animation not interrupted","loopCount=2","1. Cold start app\n2. Observe animating icon without interaction\n3. Count completed animation loops","Animation plays exactly 2 full loops then stops; no additional loops begin", "Positive","Frontend","P0","Android/iOS"],
  ["TC_003","FR-014","Cold Start","Verify animation plays CMS-configured loop count (non-default)","Cold start; CMS loopCount=3","loopCount=3","1. Configure CMS loop count to 3\n2. Cold start app\n3. Observe animation loops","Animation plays exactly 3 loops then stops per CMS configuration", "Positive","Frontend","P1","Android/iOS"],
  ["TC_004","FR-003","Cold Start","Verify icon returns to static unselected state after animation completes","Cold start; animation allowed to finish without tap","loopCount=2","1. Cold start app\n2. Allow auto-play animation to complete all loops\n3. Observe icon visual state","Icon displays static unselected state after animation completes (not stuck mid-animation frame)", "Positive","Frontend","P0","Android/iOS"],
  ["TC_005","FR-004","Session Flag","Verify auto-play does not replay again within same app session","Cold start completed; animation finished; session active","Same session","1. Complete cold-start auto-play animation\n2. Navigate across bottom nav tabs\n3. Return to Home and other tabs\n4. Observe animating icon","No auto-play animation replays during the same app session after initial cold-start trigger", "Positive","Frontend","P0","Android/iOS"],
  ["TC_006","FR-013","CMS Configuration","Verify correct icon animates per CMS configuration — Live TV","Cold start; CMS animatedIcon=Live TV","animatedIcon=Live TV","1. Set CMS to animate Live TV icon\n2. Cold start app\n3. Observe bottom nav icons","Only Live TV icon auto-plays; other icons remain static unselected", "Positive","Integration","P0","Android/iOS"],
  ["TC_007","FR-013","CMS Configuration","Verify correct icon animates per CMS configuration — On Demand","Cold start; CMS animatedIcon=On Demand","animatedIcon=On Demand","1. Set CMS to animate On Demand icon\n2. Cold start app\n3. Observe bottom nav","Only On Demand icon auto-plays animation", "Positive","Integration","P0","Android/iOS"],
  ["TC_008","FR-013","CMS Configuration","Verify correct icon animates per CMS configuration — My Account","Cold start; CMS animatedIcon=My Account","animatedIcon=My Account","1. Set CMS to animate My Account icon\n2. Cold start app\n3. Observe bottom nav","Only My Account icon auto-plays animation", "Positive","Integration","P1","Android/iOS"],
  ["TC_009","FR-005","Tap During Animation","Verify tapping animating icon stops Lottie animation immediately","Cold start; animation in progress on Favourites","Tap during loop 1","1. Cold start with Favourites animating\n2. Tap Favourites icon before animation completes","Lottie auto-play animation stops immediately on tap; no further loop frames play", "Positive","Frontend","P0","Android/iOS"],
  ["TC_010","FR-005","Tap During Animation","Verify selected state Lottie plays after tap during animation","Cold start; animation in progress","Tap during animation","1. Cold start with icon animating\n2. Tap animating icon mid-animation\n3. Observe icon state","Selected state Lottie animation plays for tapped icon after auto-play stops", "Positive","Frontend","P0","Android/iOS"],
  ["TC_011","FR-005","Tap During Animation","Verify navigation to tapped tab when icon tapped during animation","Cold start; animation in progress","Tap animating icon","1. Cold start with Favourites animating\n2. Tap Favourites during animation","App navigates to Favourites tab content screen", "Positive","Integration","P0","Android/iOS"],
  ["TC_012","FR-005","Tap During Animation","Verify icon remains in selected highlighted state after tap during animation","Cold start; tap during animation","Tap during animation","1. Tap animating icon mid-animation\n2. Observe bottom nav icon state after navigation","Tapped icon remains in selected (highlighted) state on bottom navigation", "Positive","Frontend","P0","Android/iOS"],
  ["TC_013","FR-006","Tap Other Icons","Verify animation continues when user taps non-animating icon before animation completes","Cold start; Favourites animating; animation not finished","Tap Live TV during Favourites animation","1. Cold start with Favourites animating\n2. Before animation completes tap Live TV icon\n3. Observe Favourites icon","Favourites auto-play animation continues until Favourites icon is selected; animation does not stop on other icon tap", "Positive","Frontend","P0","Android/iOS"],
  ["TC_014","FR-006","Tap Other Icons","Verify animation continues when user taps non-animating icon after animation completes","Cold start; animation completed; Favourites unselected","Tap On Demand after animation done","1. Allow Favourites animation to complete\n2. Tap On Demand icon\n3. Observe Favourites icon","Favourites remains static unselected; no new auto-play starts; On Demand becomes selected", "Positive","Frontend","P1","Android/iOS"],
  ["TC_015","FR-006","Tap Other Icons","Verify animation stops only when configured animating icon is selected","Cold start; Favourites animating","Sequential tab taps","1. Cold start with Favourites animating\n2. Tap Live TV then On Demand (non-animating)\n3. Verify animation still running\n4. Tap Favourites","Animation continues through non-animating tab taps and stops only when Favourites (animating icon) is selected", "Positive","Frontend","P0","Android/iOS"],
  ["TC_016","FR-007","App Backgrounding","Verify minimizing app during in-progress animation — behavior on return to foreground","Cold start; animation in progress; app minimized mid-animation","Background during loop 1","1. Cold start with animation playing\n2. Minimize app (do not force-kill) mid-animation\n3. Return app to foreground\n4. Observe animation state","Documented behavior verified: animation state on foreground return matches FSD (see BAQ-001 for Scope vs Assumption clarification)", "Positive","Integration","P0","Android/iOS"],
  ["TC_017","FR-007","App Backgrounding","Verify no new auto-play trigger after animation completed and app backgrounded","Animation completed; session flag set; app backgrounded without force-kill","Post-animation session","1. Complete cold-start animation\n2. Minimize app\n3. Return to foreground\n4. Observe bottom nav","No new auto-play animation starts on foreground return when animation already completed in session", "Positive","Frontend","P0","Android/iOS"],
  ["TC_018","FR-008","App Backgrounding","Verify force-kill and relaunch triggers auto-play again","Previous session animation completed; app force-killed","Force-kill relaunch","1. Complete animation in session\n2. Force-kill app\n3. Relaunch app (cold start)\n4. Observe configured icon","Auto-play animation triggers again on cold start after force-kill; session flag is reset", "Positive","Integration","P0","Android/iOS"],
  ["TC_019","BR-002","App Backgrounding","Verify animation replay after tap-navigate-background-foreground sequence per Assumption","Cold start; user taps animating icon mid-animation; navigates away; backgrounds","Tap then navigate sequence","1. Cold start with Favourites animating\n2. Tap Favourites mid-animation\n3. Navigate to another bottom nav tab\n4. Background app\n5. Return to foreground\n6. Observe Favourites icon","Per FSD Assumption: animation is replayed on Favourites icon after background-to-foreground return in this sequence", "Positive","Integration","P1","Android/iOS"],
  ["TC_020","FR-009","Navigation","Verify navigating to auto-play icon tab selects the icon","Cold start; animation playing or completed; user on different tab","Navigate to Favourites tab","1. Cold start with Favourites configured to animate\n2. Navigate to Favourites tab via bottom nav\n3. Observe icon state","Favourites icon becomes selected when user navigates to that tab", "Positive","Frontend","P0","Android/iOS"],
  ["TC_021","FR-010","Navigation","Verify returning to auto-play icon tab shows unselected state with no re-animation","User navigated away from auto-play icon after animation completed","Return navigation","1. Complete cold-start animation on Favourites (unselected)\n2. Navigate to Live TV tab\n3. Navigate back to Favourites tab\n4. Observe icon","Favourites icon is unselected (not highlighted) and no auto-play animation replays", "Positive","Frontend","P0","Android/iOS"],
  ["TC_022","FR-010","Navigation","Verify auto-play icon does not re-animate on multiple return navigations","Animation completed once in session","Multiple tab switches","1. Complete animation\n2. Switch between tabs 5 times including auto-play icon\n3. Observe animation","Auto-play icon never re-animates on return navigation within same session", "Positive","Frontend","P1","Android/iOS"],
  ["TC_023","FR-011","Home Icon","Verify Home icon never receives auto-play animation","CMS may configure any icon; Home hardcoded selected on FE","Any CMS config","1. Cold start app\n2. Observe Home icon on bottom nav\n3. Repeat with different CMS animated icon configs","Home icon never plays auto-play Lottie; remains in selected state as per FSD limitation", "Negative","Frontend","P0","Android/iOS"],
  ["TC_024","FR-011","Home Icon","Verify Home icon cannot be configured as animated icon from CMS","CMS user attempts Home icon animation config","CMS: animatedIcon=Home (if allowed)","1. Attempt CMS config for Home icon animation\n2. Cold start app\n3. Observe behavior","Home icon does not animate; FE hardcoded behavior prevents Home animation regardless of CMS", "Negative","Frontend","P1","Android/iOS"],
  ["TC_025","FR-012","Single Animation","Verify only one bottom nav icon animates at a time","CMS configured for single icon; cold start","animatedIcon=Favourites","1. Cold start app\n2. Observe all bottom nav icons during auto-play","Exactly one icon (CMS-configured) animates; all other icons remain static", "Positive","Frontend","P0","Android/iOS"],
  ["TC_026","FR-012","Single Animation","Verify behavior when CMS configures multiple animated icons (no FE restriction)","CMS configured with multiple icon animations","Multiple icons in CMS","1. Configure CMS with animation for 2+ bottom nav icons\n2. Cold start app\n3. Observe which icons animate","Behavior documented per FSD: no FE restriction implemented; verify actual behavior and document for BA (see BAQ-002)", "Boundary","Integration","P1","Android/iOS"],
  ["TC_027","FR-015","CMS Fallback","Verify graceful skip of auto-play when CMS animation config is missing","CMS returns bottom nav without animation fields","Missing animation config","1. Remove/clear animation config from CMS\n2. Cold start app\n3. Observe bottom nav","Auto-play is skipped gracefully; static fallback icons display; no crash or broken nav", "Negative","Integration","P0","Android/iOS"],
  ["TC_028","FR-016","CMS Fallback","Verify fallback static icons used when CMS config missing or app updated","CMS unavailable or partial response after app update","Degraded CMS response","1. Simulate CMS missing animation Lottie URLs\n2. Launch app\n3. Observe bottom nav icons","Fallback static unselected icons display for all nav items; auto-play skipped", "Negative","Frontend","P0","Android/iOS"],
  ["TC_029","FR-017","Accessibility","Verify auto-play skipped when prefers-reduced-motion is enabled","Device accessibility: prefers-reduced-motion=ON","Reduced motion enabled","1. Enable prefers-reduced-motion on device\n2. Cold start app with valid CMS animation config\n3. Observe bottom nav","No auto-play Lottie animation starts; icons display static states respecting accessibility setting", "Positive","Frontend","P0","Android/iOS"],
  ["TC_030","FR-017","Accessibility","Verify auto-play works when prefers-reduced-motion is disabled","Device accessibility: prefers-reduced-motion=OFF","Reduced motion disabled","1. Disable prefers-reduced-motion\n2. Cold start with valid CMS config\n3. Observe animating icon","Auto-play Lottie animation plays normally when reduced motion is not enabled", "Positive","Frontend","P1","Android/iOS"],
  ["TC_031","FR-018","Lottie Assets","Verify unselected auto-play Lottie renders for Live TV icon","CMS animates Live TV; assets available","Live TV Lottie asset","1. Configure Live TV animation\n2. Cold start\n3. Verify Lottie renders without distortion","Live TV unselected auto-play Lottie renders correctly using integrated Lottie library", "Positive","Frontend","P1","Android/iOS"],
  ["TC_032","FR-019","Lottie Assets","Verify unselected auto-play Lottie renders for On Demand Favourites and My Account","CMS cycles through each animatable icon","All 4 animatable icons","1. Test each icon (Live TV On Demand Favourites My Account) as CMS animated icon\n2. Cold start per config\n3. Verify Lottie asset","Each icon type renders correct unselected auto-play Lottie from finalized asset set", "Positive","Frontend","P1","Android/iOS"],
  ["TC_033","FR-018","Lottie Assets","Verify selected state Lottie available for all animatable icons from CMS","Selected icons already in CMS per prerequisites","All animatable icons","1. Tap each bottom nav icon\n2. Observe selected state Lottie/static icon","Selected state visuals render correctly for all icons using existing CMS selected assets", "Positive","Frontend","P1","Android/iOS"],
  ["TC_034","FR-014","Boundary","Verify animation with minimum loop count of 1","CMS loopCount=1","loopCount=1","1. Set CMS loop count to 1\n2. Cold start\n3. Count loops","Animation plays exactly 1 loop then stops and returns to static unselected state", "Boundary","Frontend","P2","Android/iOS"],
  ["TC_035","FR-014","Boundary","Verify handling of invalid CMS loop count (0 or negative)","CMS loopCount=0 or invalid value","loopCount=0","1. Configure invalid loop count in CMS\n2. Cold start app\n3. Observe behavior","App handles invalid loop count gracefully (skip animation or use default) without crash", "Negative","Integration","P2","Android/iOS"],
  ["TC_036","BR-001","App Backgrounding","Verify animation replays on background-to-foreground return per Assumption","Cold start; animation in progress or completed per assumption scenario","Background return","1. Cold start with animation\n2. Background app without force-kill\n3. Return to foreground\n4. Observe animation","Per FSD Assumption: icon animation replays when user returns from background to foreground", "Positive","Integration","P1","Android/iOS"],
  ["TC_037","FR-022","Backward Compatibility","Verify no bottom nav animation on app version below feature release","Pre-feature app build installed","Legacy app version","1. Install app version released before RT-1266\n2. Launch app\n3. Observe bottom nav","Bottom nav icons display without auto-play Lottie animation on older app versions", "Negative","Frontend","P1","Android/iOS"],
  ["TC_038","FR-022","Backward Compatibility","Verify animation feature available after updating to feature release version","User updates from pre-feature to post-feature app","Post-feature app build","1. Update app to version including RT-1266\n2. Cold start\n3. Observe configured icon","Auto-play animation feature is available after app update to feature release version", "Positive","Frontend","P1","Android/iOS"],
  ["TC_039","BR-023","Out of Scope","Verify no rotation of animations across multiple icons in single session","CMS could configure multiple; single session","Single session","1. Cold start app\n2. Complete animation\n3. Verify no second icon auto-animates in same session","Only one icon animates per session; no rotating animation across icons (out of scope)", "Negative","Frontend","P2","Android/iOS"],
  ["TC_040","BR-024","Out of Scope","Verify CMS config change during active session does not hot-reload animation","Active session; CMS updated mid-session","Mid-session CMS change","1. Cold start with Favourites animating\n2. Change CMS animated icon to Live TV without restarting app\n3. Observe bottom nav","Animation config does not hot-reload during active session; behavior unchanged until next cold start", "Negative","Integration","P2","Android/iOS"],
  ["TC_041","BR-025","Out of Scope","Verify feature not available on WEB platform","User accesses Tata Play on WEB","WEB session","1. Open Tata Play on WEB browser\n2. Log in\n3. Observe bottom navigation","No bottom nav icon auto-play animation on WEB (mobile only per FSD out of scope)", "Negative","Frontend","P2","WEB"],
  ["TC_042","FR-023","Guest Users","Verify guest user bottom nav animation behavior","Guest user (not logged in); guest nav hardcoded on FE","Guest session","1. Launch app as guest user\n2. Observe bottom nav icons\n3. Compare with logged-in user behavior","Guest user animation behavior matches BA-confirmed approach (see BAQ-003 and FSD Questions S.No 1)", "Positive","Integration","P0","Android/iOS"],
  ["TC_043","FR-023","Guest Users","Verify guest user does not crash when animation feature enabled for logged-in only","Guest session; feature flag for logged-in users","Guest account","1. Launch as guest\n2. Navigate bottom nav\n3. Monitor for errors","App remains stable for guest users regardless of animation feature scope decision", "Negative","Frontend","P1","Android/iOS"],
  ["TC_044","FR-024","Bottom Nav API","Verify bottom nav list API returns animation Lottie URL for configured icon","Logged-in user; API returns animation config","Valid CMS animation payload","1. Capture bottom nav list API response on cold start\n2. Locate configured animated icon entry\n3. Verify animation fields","API response includes Lottie animation URL/asset reference for CMS-configured animated icon", "Positive","Backend","P0","Android/iOS"],
  ["TC_045","FR-024","Bottom Nav API","Verify bottom nav list API returns configurable loop count","Logged-in user; CMS loopCount configured","loopCount=2","1. Call bottom nav list API\n2. Inspect animation configuration fields\n3. Compare with CMS","API response includes loop count value matching CMS configuration (default 2 for first release)", "Positive","Backend","P0","Android/iOS"],
  ["TC_046","FR-015","Bottom Nav API","Verify API response when animation config absent — no animation fields or null","CMS without animation configuration","Missing animation config","1. Call bottom nav list API with no animation config\n2. Inspect response\n3. Verify FE handling","API returns valid bottom nav list without animation fields or with null/empty animation config; FE skips auto-play", "Negative","Backend","P0","Android/iOS"],
  ["TC_047","FR-023","Bottom Nav API","Verify guest user bottom nav API vs hardcoded FE nav for animation","Guest user session","Guest vs logged-in","1. Call bottom nav API as guest (if applicable)\n2. Compare with logged-in API response\n3. Document animation field presence","API/FE behavior for guest users documented per BA decision on animation for guest hardcoded nav", "Positive","Backend","P1","Android/iOS"],
  ["TC_048","FR-024","Bottom Nav API","Verify API returns selected icon assets for all bottom nav items","Logged-in user; standard CMS config","Full nav list","1. Call bottom nav list API\n2. Verify selected and unselected icon assets for each nav item","All bottom nav items include selected icon assets already used in CMS as per FSD prerequisites", "Positive","Backend","P1","Android/iOS"],
  ["TC_049","FR-024","Regression","Verify existing bottom nav tab navigation unaffected by animation feature","Logged-in user; animation enabled","Standard navigation","1. Cold start app\n2. Tap each bottom nav tab sequentially\n3. Verify screen loads","All bottom nav tabs navigate correctly to respective screens without regression", "Regression","Frontend","P0","Android/iOS"],
  ["TC_050","FR-024","Regression","Verify static bottom nav icons display correctly when animation skipped","CMS config missing or reduced motion enabled","No animation scenario","1. Launch app with animation skipped\n2. Observe all bottom nav icons\n3. Verify labels and icons","All bottom nav icons and labels display correctly without animation; no layout breakage", "Regression","Frontend","P1","Android/iOS"],
  ["TC_051","FR-024","Regression","Verify bottom nav performance not degraded during Lottie animation","Mid-range test device; animation playing","Performance baseline","1. Cold start with animation\n2. Rapidly switch tabs during animation\n3. Monitor UI responsiveness","No perceptible UI lag or jank attributable to Lottie auto-play animation", "Regression","Frontend","P2","Android/iOS"],
  ["TC_052","FR-024","Regression","Verify unrelated app features unaffected during animation playback","Logged-in user; animation in progress","Standard app usage","1. Start animation on cold start\n2. Use search playback notifications while animation plays\n3. Verify core features","Core app features outside bottom nav animation work normally during animation playback", "Regression","Integration","P2","Android/iOS"],
];

const headers = ["Test Case ID","Requirement ID","Module","Test Scenario","Preconditions","Test Data","Test Steps","Expected Result","Test Type","Layer","Priority","Platform"];

function toCsv(rows) {
  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const v = String(cell ?? "");
          return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(",")
    )
    .join("\n") + "\n";
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

fs.writeFileSync(path.join(OUT, "test-cases.csv"), toCsv(cases));

const apiHeaders = ["Test Case ID","Requirement ID","Module","Endpoint","Method","Test Scenario","Preconditions","Test Data (Request)","Test Steps","Expected Result (Response)","Test Type","Layer","Priority"];
const apiRows = cases.filter((r) => r[2] === "Bottom Nav API");
const apiCsv = [apiHeaders, ...apiRows.map((r) => [
  r[0], r[1], r[2], "Bottom Nav List API (bottom nav list endpoint)", "GET", r[3], r[4], r[5], r[6], r[7], r[8], "Backend", r[10]
])];
fs.writeFileSync(
  path.join(OUT, "api-test-cases.csv"),
  apiCsv
    .map((row) =>
      row.map((c) => {
        const v = String(c ?? "");
        return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(",")
    )
    .join("\n") + "\n"
);

const regCases = cases.filter((r) => r[8] === "Regression");
fs.writeFileSync(path.join(OUT, "regression-test-cases.csv"), toCsv(regCases));

const baQueries = `# Open Queries for Business Analyst (BA)

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
2. Update **Status** to \`Answered\`, \`Deferred\`, or \`Out of Scope\`.
3. If FSD is updated, share revised FSD version with QA.
`;

fs.writeFileSync(path.join(OUT, "ba-open-queries.md"), baQueries);

const layerCounts = { Frontend: 0, Backend: 0, Integration: 0 };
const typeCounts = { Positive: 0, Negative: 0, Boundary: 0, Regression: 0 };
for (const r of cases) {
  layerCounts[r[9]] = (layerCounts[r[9]] || 0) + 1;
  typeCounts[r[8]] = (typeCounts[r[8]] || 0) + 1;
}

const coverage = `# Requirement Coverage Summary — RT-1266

## FSD: Bottom Navigation Icon Animation handling (v0.3)

\`\`\`
Total Requirements:        24
Total Test Cases:          52
Frontend Test Cases:       ${layerCounts.Frontend}
Backend Test Cases:        ${layerCounts.Backend}
Integration Test Cases:    ${layerCounts.Integration}
Positive Test Cases:       ${typeCounts.Positive}
Negative Test Cases:       ${typeCounts.Negative}
Boundary/Edge Cases:       ${typeCounts.Boundary}
API Test Cases:             5
DB Test Cases:              0 (N/A — no DB behavior in FSD)
Regression Test Cases:      ${typeCounts.Regression}
Uncovered Requirements:     0 (pending BA clarifications for contradictions and guest users)
\`\`\`

## Requirement Traceability

| Requirement ID | Description | Test Case IDs | Covered |
|----------------|-------------|---------------|---------|
| FR-001 | Auto-play CMS-configured icon on cold start | TC_001, TC_006–TC_008 | Yes |
| FR-002 | Animation plays configured loops then stops | TC_002, TC_004 | Yes |
| FR-003 | Icon returns to static unselected after animation | TC_004 | Yes |
| FR-004 | Session flag — no replay in same session | TC_005, TC_017, TC_022 | Yes |
| FR-005 | Tap during animation stops and selects icon | TC_009–TC_012 | Yes |
| FR-006 | Tap other icons — animation continues until animating icon selected | TC_013–TC_015 | Yes |
| FR-007 | App backgrounding (minimize) behavior | TC_016, TC_017, TC_036 | Yes |
| FR-008 | Force-kill relaunch resets session and re-triggers | TC_018 | Yes |
| FR-009 | Navigate to auto-play icon selects it | TC_020 | Yes |
| FR-010 | Navigate away and return — unselected, no re-animation | TC_021, TC_022 | Yes |
| FR-011 | Home icon cannot be animated | TC_023, TC_024 | Yes |
| FR-012 | Only one icon animates at a time | TC_025, TC_026 | Yes |
| FR-013 | CMS configurable animated icon | TC_006–TC_008, TC_027 | Yes |
| FR-014 | CMS configurable loop count | TC_003, TC_034, TC_035, TC_045 | Yes |
| FR-015 | Graceful skip when CMS config missing | TC_027, TC_046 | Yes |
| FR-016 | Fallback static icons when CMS missing | TC_028 | Yes |
| FR-017 | prefers-reduced-motion skips auto-play | TC_029, TC_030 | Yes |
| FR-018 | Lottie library integration | TC_031, TC_033 | Yes |
| FR-019 | Animation assets for all animatable icons | TC_032 | Yes |
| FR-022 | Backward compatibility — older app versions | TC_037, TC_038 | Yes |
| FR-023 | Guest user behavior | TC_042, TC_043, TC_047 | Yes (pending BA) |
| FR-024 | Bottom nav list API with animation fields | TC_044–TC_048 | Yes |
| BR-001 | Assumption — replay on background return | TC_036 | Yes |
| BR-002 | Assumption — replay after tap/navigate/background sequence | TC_019 | Yes |
| BR-023 | Out of scope — no rotating animations | TC_039 | Yes |
| BR-024 | Out of scope — no CMS hot-reload | TC_040 | Yes |
| BR-025 | Out of scope — mobile only | TC_041 | Yes |
`;

fs.writeFileSync(path.join(OUT, "coverage-summary.md"), coverage);

const report = `# RT-1266 — Full QA Test Case Report

**FSD:** Bottom Navigation Icon Animation handling (v0.3)  
**Source:** \`fsd/1787905757201-RT-1266___Bottom_Navigation_Icon_Animation_handling_v0.3__1_.docx\`  
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

24 requirements (FR-001 to FR-024, BR-001 to BR-025) — see \`coverage-summary.md\`.

---

## 3. Assumptions

| # | Assumption | Basis |
|---|------------|-------|
| A-001 | Bottom nav list API is the CMS source for animation config for logged-in users | FSD Questions section |
| A-002 | Default loop count is 2 when CMS value absent | FSD states first release = 2 loops |
| A-003 | Home tab is default landing with hardcoded selected state | FSD Assumptions on Home icon |

---

## 4. Detailed Test Cases (Positive Functional/UI)

52 test cases in \`test-cases.csv\` covering all 5 FSD scenarios, CMS configuration, accessibility, backward compatibility, and out-of-scope validation.

---

## 5. API/Backend Test Cases

5 API cases in \`api-test-cases.csv\` for bottom nav list API animation fields (endpoint schema pending BA — see BAQ-004).

---

## 6. Database Test Cases

N/A — FSD does not define database behavior.

---

## 7. Negative & Edge Case Coverage

Negative cases: TC_023, TC_024, TC_027, TC_028, TC_029, TC_035, TC_037, TC_039–TC_041, TC_043, TC_046  
Boundary cases: TC_034, TC_035, TC_026

---

## 8. Regression Coverage

4 regression cases (TC_049–TC_052) in \`regression-test-cases.csv\` — bottom nav navigation, static display, performance, unrelated features.

---

## 9. Requirement Coverage Summary

See \`coverage-summary.md\`.

---

## 10. Open Questions (Internal QA Notes)

- **Scope vs Assumptions contradiction** on backgrounding replay behavior — raised as BAQ-001
- **Guest user animation** — product open question in FSD Questions table — raised as BAQ-003
- **Multiple CMS animated icons** — no FE restriction but business requests single icon — raised as BAQ-002
- **API contract** not in FSD — raised as BAQ-004

---

## 11. Open Queries for BA

See \`ba-open-queries.md\` — 9 queries (3 P0 blockers) pending BA response.
`;

fs.writeFileSync(path.join(OUT, "full-report.md"), report);

console.log("Generated RT-1266 deliverables in", OUT);
execSync(`node scripts/export-qa-pack.js ${PROJECT}`, { cwd: ROOT, stdio: "inherit" });
execSync(`node scripts/validate-test-cases.js ${PROJECT}`, { cwd: ROOT, stdio: "inherit" });
console.log("Export and validation complete");
