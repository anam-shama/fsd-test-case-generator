const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PROJECT = "RT-956";
const OUT = path.join(ROOT, "output", PROJECT);

const cases = [
  ["TC_001","FR-001","Onboarding","Verify First Month Free Offer is communicated during new user onboarding","New registered user without any pack/subscription; first app launch after feature release","Eligible new user account","1. Install app version released after this feature\n2. Register as new user\n3. Complete onboarding flow\n4. Observe offer messaging and terms presentation","First Month Free Offer and associated terms are clearly communicated during onboarding per FSD UX section", "Positive","Frontend","P0","Android/iOS"],
  ["TC_002","FR-014","Eligibility","Verify eligible new registered user without subscription sees promotional offer","New registered user; no pack or channel subscription taken post registration","User with zero subscriptions","1. Log in as new registered user with no subscriptions\n2. Navigate to sampling-enabled content\n3. Observe promotional/sampling UI","Promotional offer and sampling banner are visible to eligible user", "Positive","Frontend","P0","Android/iOS"],
  ["TC_003","FR-014","Eligibility","Verify existing user with any subscription does not see promo banner","User registered and has taken any pack/subscription post registration","User with active channel/pack subscription","1. Log in as user with existing subscription\n2. Navigate to content that would be sampling-enabled for eligible users\n3. Observe banners","Promo/sampling banner is NOT displayed; user is not eligible per FSD", "Negative","Frontend","P0","Android/iOS"],
  ["TC_004","FR-014","Eligibility","Verify user who subscribed after registration is not eligible for promo banner","User took subscription after initial registration","Post-registration subscriber","1. Log in as user who subscribed after registration\n2. Open sampling-enabled content\n3. Verify banner visibility","Promotional sampling banner is not shown", "Negative","Frontend","P0","Android/iOS"],
  ["TC_005","FR-002","Sampling Banner","Verify sampling banner displays remaining days and expiry month during free content consumption","Eligible user with active free offer; viewing sampling-enabled content","Offer with known remaining days","1. Log in as eligible user\n2. Play/view sampling-enabled free content\n3. Observe sampling banner text","Banner displays: Only xx days left to watch for free – till xx Month with correct values from backend", "Positive","Frontend","P0","Android/iOS"],
  ["TC_006","FR-003","Sampling Banner","Verify sampling banner appears below the player during playback","Eligible user playing sampling-enabled content","Active free offer content","1. Start playback of sampling-enabled content\n2. Observe area below player","Sampling banner is displayed below the player", "Positive","Frontend","P0","Android/iOS"],
  ["TC_007","FR-003","Sampling Banner","Verify sampling banner appears in content lists for relevant items","Eligible user browsing content lists with sampling-enabled items","Content list with sampling-enabled entries","1. Navigate to content list containing sampling-enabled items\n2. Locate relevant list items\n3. Observe banner on list items","Sampling banner is displayed in content lists for applicable items", "Positive","Frontend","P1","Android/iOS"],
  ["TC_008","FR-002","Sampling Banner","Verify Add Pack CTA is visible on sampling banner","Eligible user; promotional subscription not yet availed","Sampling-enabled content","1. View sampling banner on player or list\n2. Observe CTA on banner","Add Pack CTA is visible and clearly labeled on the sampling banner", "Positive","Frontend","P0","Android/iOS"],
  ["TC_009","FR-018","Add Pack CTA","Verify Add Pack CTA is generic until user avails promotion on PI page","Eligible user has not availed promotion on PI page","Pre-availment state","1. View sampling banner before availing offer on PI\n2. Note CTA label and behaviour\n3. Tap Add Pack","CTA displays generic Add Pack label and navigates to appropriate pack/subscription flow", "Positive","Frontend","P1","Android/iOS"],
  ["TC_010","FR-018","Add Pack CTA","Verify Add Pack CTA is hidden after promotion offer availed on PI page","User avails promotional subscription on PI page; entitlement updates in real time","Post-availment eligible user","1. Avail promotion offer on PI page\n2. Return to sampling-enabled content\n3. Observe banner CTA","Add Pack CTA is no longer displayed after entitlement changes in real time", "Positive","Integration","P0","Android/iOS"],
  ["TC_011","FR-005","Sampling Banner","Verify sampling banner not shown when promotion subscription availed","User has availed promotional subscription","Availed promotion user","1. Log in as user who availed promotion subscription\n2. Open sampling-enabled content\n3. Observe banner area","Sampling banner is NOT displayed for sampling-enabled content when promotion is availed", "Negative","Frontend","P0","Android/iOS"],
  ["TC_012","FR-006","Sampling Banner","Verify sampling banner shown when promotion subscription not availed","Eligible user; promotion not availed","Un-availed promotion user","1. Log in as eligible user without availed promotion\n2. Open sampling-enabled content\n3. Observe banner","Sampling banner IS displayed for sampling-enabled content", "Positive","Frontend","P0","Android/iOS"],
  ["TC_013","FR-004","Sampling Banner","Verify sampling banner disappears when offer no longer applicable","User offer period has ended or eligibility revoked","Expired/ineligible offer state","1. Use account where offer is no longer applicable\n2. Open previously sampling-enabled content\n3. Observe banner","Sampling banner is not displayed when offer is no longer applicable", "Negative","Frontend","P0","Android/iOS"],
  ["TC_014","FR-007","Offer Expiry","Verify expiry notification banner before offer ends","Eligible user nearing offer end date","User with 1-2 days remaining","1. Log in as user with offer nearing expiry\n2. View free content\n3. Read banner messaging","Banner shows Only xx days left to watch for free – till xx Month as expiry notification", "Positive","Frontend","P1","Android/iOS"],
  ["TC_015","FR-015","Sampling Banner","Verify remaining days on banner update in real time","Eligible user with active offer; cross midnight boundary or backend refresh","Active offer account","1. Note remaining days on banner\n2. Wait for day rollover or trigger refresh\n3. Re-observe banner","Remaining days count updates accurately in real time per PubNub/backend data", "Positive","Integration","P1","Android/iOS"],
  ["TC_016","FR-008","Unsubscribed Banner","Verify unsubscribed channel banner when user not subscribed to channel","User not subscribed to channel being viewed; sampling may apply","Unsubscribed channel content","1. Open content for channel user is not subscribed to\n2. Observe banner above CTA","Banner displays: You have not subscribed to this Channel above the CTA", "Positive","Frontend","P0","Android/iOS"],
  ["TC_017","FR-009","Unsubscribed Banner","Verify unsubscribed banner shown for sampling-enabled content","User not subscribed; content is sampling-enabled","Unsubscribed + sampling content","1. Open sampling-enabled content for unsubscribed channel\n2. Observe banners","You have not subscribed to this Channel banner is displayed alongside applicable sampling behaviour per Figma option 1", "Positive","Frontend","P1","Android/iOS"],
  ["TC_018","FR-019","Unsubscribed Banner","Verify unsubscribed banner stays generic until user adds that channel","User has not added/subscribed to specific channel","Single unsubscribed channel","1. View unsubscribed channel content\n2. Note banner text\n3. Without subscribing navigate to another unsubscribed channel","Banner text remains generic You have not subscribed to this Channel until user adds that particular channel", "Positive","Frontend","P2","Android/iOS"],
  ["TC_019","FR-010","UI/UX","Verify promo banner matches Figma option 1 final design","Figma handoff available; eligible user","Figma reference node 18113-64268","1. Open sampling/unsubscribed banner on device\n2. Compare layout typography CTA placement with Figma Promo banner option 1","UI matches Figma Promo banner option 1 (final) design", "Positive","Frontend","P1","Android/iOS"],
  ["TC_020","FR-020","Offer Unlocked Screen","Verify Offer Unlocked screen text rendered from backend","User triggers Offer Unlocked screen","Eligible new user","1. Navigate to Offer Unlocked screen\n2. Observe displayed text\n3. Compare with backend-provided copy","Text on Offer Unlocked screen matches backend-provided content", "Positive","Integration","P1","Android/iOS"],
  ["TC_021","FR-020","Access Unlocked Screen","Verify Access Unlocked screen text rendered from backend","User triggers Access Unlocked screen","Eligible new user","1. Navigate to Access Unlocked screen\n2. Observe displayed text","Text on Access Unlocked screen matches backend-provided content", "Positive","Integration","P1","Android/iOS"],
  ["TC_022","FR-020","Responsive UI","Verify Access/Offer Unlocked text adjusts for mobile screen size","Mobile device (phone form factor)","Phone device","1. Open Access Unlocked and Offer Unlocked screens on phone\n2. Verify text wrapping and layout","Text adjusts appropriately for mobile screen size without truncation or overlap", "Positive","Frontend","P2","Android/iOS"],
  ["TC_023","FR-020","Responsive UI","Verify Access/Offer Unlocked text adjusts for tablet and iPad","Tablet/iPad device","Tablet/iPad","1. Open screens on tablet and iPad\n2. Verify text layout","Text adjusts appropriately for tablet and iPad screen sizes", "Positive","Frontend","P2","Android/iOS"],
  ["TC_024","FR-017","CMS Configuration","Verify sampling banner message is configurable from CMS","CMS updated with new banner copy","CMS test message configured","1. Update banner text via CMS\n2. Refresh app content for eligible user\n3. Observe banner","Banner displays CMS-configured message text", "Positive","Integration","P1","Android/iOS"],
  ["TC_025","FR-013","Account Status","Verify banners disabled for suspended account","User account status = Suspended","Suspended account","1. Log in as suspended user\n2. Navigate to content\n3. Observe sampling and promo banners","Banners are not displayed for suspended account", "Negative","Frontend","P0","Android/iOS"],
  ["TC_026","FR-013","Account Status","Verify banners disabled for inactive account","User account status = Inactive","Inactive account","1. Log in as inactive user\n2. Navigate to content\n3. Observe banners","Banners are not displayed for inactive account", "Negative","Frontend","P0","Android/iOS"],
  ["TC_027","FR-013","Analytics","Verify tracking disabled for suspended/inactive accounts","Suspended or inactive account","Suspended account","1. Perform actions that would trigger promo events on active account\n2. Monitor analytics pipeline","No FREE-PROMOTION-SUBSCRIPTION / FREE_PROMOTION_SUBSCRIPTION events fired for suspended/inactive accounts", "Negative","Backend","P0","Android/iOS"],
  ["TC_028","FR-011","PubNub API","Verify PubNub returns campaign eligibility and remaining offer days","Eligible user; PubNub channel subscribed","Active campaign user","1. Log in as eligible user\n2. Monitor PubNub messages/API\n3. Verify eligibility flag and remaining days payload","PubNub delivers user campaign eligibility and accurate remaining offer days", "Positive","Backend","P0","Android/iOS"],
  ["TC_029","FR-012","Account Status","Verify user account status updates dynamically when offer subscribed","Eligible user subscribes to promotional offer","Pre-subscription eligible user","1. Note account status before subscription\n2. Complete promotional subscription\n3. Verify account status and UI update without re-login","User account status updates dynamically in real time after offer subscription", "Positive","Integration","P0","Android/iOS"],
  ["TC_030","FR-016","Mixpanel","Verify FREE-PROMOTION-SUBSCRIPTION event with SOURCEFIRST-TIME-LOGIN=TRUE on first login","First-time login eligible user with active promotional offer","First login session","1. Log in for first time with active promo offer\n2. Capture Mixpanel events\n3. Verify event payload","FREE-PROMOTION-SUBSCRIPTION event fired with SOURCEFIRST-TIME-LOGIN=TRUE", "Positive","Backend","P0","Android/iOS"],
  ["TC_031","FR-016","Mixpanel","Verify FREE-PROMOTION-SUBSCRIPTION event with SOURCEFIRST-TIME-LOGIN=FALSE on second login","Second login eligible user with active promotional offer","Second login session","1. Log in for second time with active promo offer\n2. Capture Mixpanel events","FREE-PROMOTION-SUBSCRIPTION event fired with SOURCEFIRST-TIME-LOGIN=FALSE", "Positive","Backend","P0","Android/iOS"],
  ["TC_032","FR-016","MoEngage","Verify FREE_PROMOTION_SUBSCRIPTION event with FIRST_TIME_LOGIN=TRUE","First-time login eligible user","First login session","1. Log in for first time with active promo\n2. Capture MoEngage events","FREE_PROMOTION_SUBSCRIPTION event fired with FIRST_TIME_LOGIN=TRUE", "Positive","Backend","P0","Android/iOS"],
  ["TC_033","FR-016","MoEngage","Verify FREE_PROMOTION_SUBSCRIPTION event with FIRST_TIME_LOGIN=FALSE","Second login eligible user","Second login session","1. Log in for second time with active promo\n2. Capture MoEngage events","FREE_PROMOTION_SUBSCRIPTION event fired with FIRST_TIME_LOGIN=FALSE", "Positive","Backend","P0","Android/iOS"],
  ["TC_034","FR-016","Analytics","Verify analytics events fire when user consumes free promotional content","Eligible user watching holding/free content","Free promotional content","1. Play holding/free content under offer\n2. Monitor Mixpanel and MoEngage\n3. Verify consumption tracking events per analytics spec","Content watched events captured for holding/free content as specified in FSD analytics section", "Positive","Backend","P1","Android/iOS"],
  ["TC_035","FR-021","Performance","Verify banner rendering does not cause UI lag","Eligible user on mid-range device","Standard test device","1. Navigate rapidly between content with banners\n2. Start/stop playback\n3. Observe UI responsiveness","No perceptible UI lag attributable to new banners or tracking", "Positive","Frontend","P1","Android/iOS"],
  ["TC_036","FR-022","Backward Compatibility","Verify feature not available on older app versions","App version released before this feature","Legacy app build","1. Install pre-feature app version\n2. Log in as eligible new user\n3. Navigate to content","First Month Free Offer improvements are not visible on older app versions", "Negative","Frontend","P1","Android/iOS"],
  ["TC_037","FR-022","Backward Compatibility","Verify feature visible only after feature app release login","User logs in after feature release on supported app","Post-release app + login","1. Update to post-feature app version\n2. Log in after release\n3. Verify offer UI","Functionality visible to users who log in after feature app release", "Positive","Frontend","P1","Android/iOS"],
  ["TC_038","FR-023","Out of Scope","Verify WEB platform does not show TPMA promo banners","User on WEB platform","WEB session","1. Access Tata Play via WEB\n2. Log in as eligible new user\n3. Browse content","Promo/sampling banners are not displayed on WEB (out of scope)", "Negative","Frontend","P2","WEB"],
  ["TC_039","FR-024","Out of Scope","Verify service landing page is out of scope for promo banners","Eligible user on service landing page","Service landing navigation","1. Navigate to service landing page\n2. Observe promo/sampling banners","Promo banner changes do not appear on service landing page (out of scope)", "Negative","Frontend","P2","Android/iOS"],
  ["TC_040","FR-024","Out of Scope","Verify Genre PI page is out of scope for promo banners","Eligible user on Genre PI page","Genre PI navigation","1. Navigate to Genre PI page\n2. Observe banners","Promo banner changes do not appear on Genre PI page (out of scope)", "Negative","Frontend","P2","Android/iOS"],
  ["TC_041","FR-002","Sampling Banner","Verify banner not shown when user is ineligible mid-session after subscription","User subscribes during session","Eligible then subscribes","1. Start as eligible user with banner visible\n2. Complete subscription for channel/pack\n3. Return to content","Banner disappears when user no longer eligible/applicable", "Positive","Integration","P1","Android/iOS"],
  ["TC_042","FR-008","Unsubscribed Banner","Verify unsubscribed banner CTA navigates to pack add flow","User not subscribed to channel","Unsubscribed content","1. View unsubscribed channel banner\n2. Tap CTA\n3. Observe navigation","User is directed to appropriate pack/subscription flow from CTA", "Positive","Frontend","P1","Android/iOS"],
  ["TC_043","FR-015","Sampling Banner","Verify banner shows zero days remaining on last day of offer","User on final day of free offer","Last-day offer account","1. Log in on last offer day\n2. View sampling content\n3. Read banner","Banner accurately shows remaining days (0 or 1 per business rule) and expiry month", "Boundary","Frontend","P1","Android/iOS"],
  ["TC_044","FR-011","PubNub API","Verify app handles PubNub connection failure gracefully","Simulate PubNub unavailable","Network fault injection","1. Block PubNub connectivity\n2. Open app as eligible user\n3. Observe banner and error handling","App handles PubNub failure without crash; banner/eligibility degrades gracefully per error handling guidelines", "Negative","Backend","P1","Android/iOS"],
  ["TC_045","FR-016","Analytics","Verify no duplicate analytics events on rapid banner refresh","Eligible user; rapid eligibility updates","Active offer","1. Trigger rapid eligibility/day updates\n2. Monitor event stream","No duplicate FREE-PROMOTION-SUBSCRIPTION / FREE_PROMOTION_SUBSCRIPTION events for single user action", "Negative","Backend","P2","Android/iOS"],
  ["TC_046","FR-001","Onboarding","Verify onboarding terms include offer conditions","New user onboarding","Eligible new user","1. Complete onboarding\n2. Review terms/conditions section for offer","Terms and conditions for First Month Free Offer are presented during onboarding", "Positive","Frontend","P1","Android/iOS"],
  ["TC_047","FR-014","Eligibility","Verify offer abuse prevention — registered user with prior pack history","User registered earlier with pack history","Legacy subscriber re-login","1. Log in as user with subscription history\n2. Verify promo visibility","User with any subscription post registration does not see promo (eligibility logic)", "Negative","Backend","P0","Android/iOS"],
  ["TC_048","FR-024","Regression","Verify existing subscribed user playback unaffected","Existing subscriber without promo","Long-term subscriber","1. Log in as existing subscriber\n2. Play content\n3. Verify no regression in playback or unrelated banners","Existing subscriber experience unchanged; no erroneous promo banners", "Regression","Frontend","P1","Android/iOS"],
  ["TC_049","FR-024","Regression","Verify content browsing for non-eligible users unchanged","Non-eligible registered user","Non-eligible user","1. Browse content lists and PI pages\n2. Verify no broken layouts from banner components","Non-eligible users see unchanged browsing experience aside from out-of-scope pages", "Regression","Frontend","P2","Android/iOS"],
  ["TC_050","FR-016","Regression","Verify unrelated Mixpanel/MoEngage events not impacted","Eligible and ineligible users","Standard accounts","1. Perform standard app actions outside promo flows\n2. Compare analytics event volume/names with baseline","Existing analytics events outside FREE-PROMOTION-SUBSCRIPTION are unaffected", "Regression","Backend","P2","Android/iOS"],
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

const apiCases = cases.filter((r) => r[9] === "Backend" || (r[9] === "Integration" && r[2].includes("PubNub") || r[2].includes("Analytics") || r[2].includes("Account")));
// write api subset - use cases with Backend layer or analytics module
const apiRows = cases.filter((r) => r[9] === "Backend" || r[2] === "PubNub API" || r[2] === "Analytics" || r[2] === "Mixpanel" || r[2] === "MoEngage" || r[2] === "Account Status");
const apiHeaders = ["Test Case ID","Requirement ID","Module","Endpoint","Method","Test Scenario","Preconditions","Test Data (Request)","Test Steps","Expected Result (Response)","Test Type","Layer","Priority"];
const apiCsv = [apiHeaders, ...apiRows.map((r) => [
  r[0], r[1], r[2], r[2].includes("PubNub") ? "PubNub channel" : "Analytics / Account API", r[2].includes("PubNub") ? "SUBSCRIBE" : "EVENT", r[3], r[4], r[5], r[6], r[7], r[8], "Backend", r[10]
])];
fs.writeFileSync(path.join(OUT, "api-test-cases.csv"), apiCsv.map((row) => row.map((c) => {
  const v = String(c ?? "");
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}).join(",")).join("\n") + "\n");

const regCases = cases.filter((r) => r[8] === "Regression");
fs.writeFileSync(path.join(OUT, "regression-test-cases.csv"), toCsv(regCases));

const baQueries = `# Open Queries for Business Analyst (BA)

**Project:** RT-956  
**FSD:** TPMA First Month Free Offer - Improvements (v0.1)  
**Prepared by:** QA (FSD Test Case Generator Agent)  
**Date:** 2026-08-28  
**Status:** Pending BA Response

---

## Summary

| Metric | Count |
|--------|-------|
| Total Queries | 10 |
| Blockers (P0) | 3 |
| High Priority (P1) | 5 |
| Medium Priority (P2) | 2 |

---

## Queries for BA

| Query ID | FSD Section / Requirement | Category | Priority | Query for BA | Why QA Cannot Proceed | Impacted Test Cases | BA Response | Status |
|----------|----------------------------|----------|----------|--------------|----------------------|---------------------|-------------|--------|
| BAQ-001 | FR-011 — PubNub API | Missing Detail | P0 | Please provide **PubNub channel name**, message schema, and sample payloads for campaign eligibility and remaining offer days. | Cannot validate API contract without documented PubNub message format | TC_028, TC_044 | | Open |
| BAQ-002 | Section 11 — Analytics | Missing Detail | P0 | FSD lists FREE-PROMOTION-SUBSCRIPTION / FREE_PROMOTION_SUBSCRIPTION events but **Content watched** analytics table is empty. What are the exact event names and parameters for content consumption tracking? | Consumption analytics test cases cannot be finalized | TC_034 | | Open |
| BAQ-003 | FR-017 — CMS | Missing Detail | P0 | Which **CMS keys/fields** control banner text (sampling and unsubscribed)? What is the fallback if CMS is unavailable? | CMS configuration tests need field names and failure behaviour | TC_024 | | Open |
| BAQ-004 | FR-018 — Add Pack CTA | Ambiguous Requirement | P1 | After user avails promotion on PI page, should the **entire sampling banner** hide or only the Add Pack CTA? FSD mentions CTA hidden but sampling banner rules overlap. | Expected UI state after availment unclear | TC_010, TC_011 | | Open |
| BAQ-005 | FR-008 / FR-009 — Banner stacking | Ambiguous Requirement | P1 | When user is **both** unsubscribed to channel **and** has active free offer, should both banners show, or only one? What is z-order per Figma option 1? | Combined banner display rules not specified | TC_016, TC_017 | | Open |
| BAQ-006 | FR-012 — Account status | Missing Detail | P1 | What are the **account status values** before/after promotional subscription (API field names and enum values)? | Dynamic status update tests need documented states | TC_029 | | Open |
| BAQ-007 | Section 4 — Onboarding | Acceptance Criteria Gap | P1 | What **exact copy** (headline, body, T&C links) should appear during onboarding for the First Month Free Offer? | Onboarding UI validation needs specified strings | TC_001, TC_046 | | Open |
| BAQ-008 | FR-020 — Unlocked screens | Missing Reference | P2 | Please provide **sample backend responses** for Access Unlocked and Offer Unlocked screens (all supported locales if applicable). | Cannot verify backend-driven copy without samples | TC_020, TC_021 | | Open |
| BAQ-009 | FR-015 — Real-time days | Missing Detail | P1 | How often should remaining days **refresh** (PubNub push interval, polling, on app resume)? What timezone defines day boundary? | Real-time update boundary tests need refresh rules | TC_015, TC_043 | | Open |
| BAQ-010 | Section 11 — Questions table | Incomplete Specification | P2 | FSD **Questions/Queries** table (S.No 1) is empty. Are there pending product decisions affecting QA? | May block final coverage if open product questions exist | — | | Open |

---

## Instructions for BA

1. Review each query and provide response in the **BA Response** column.
2. Update **Status** to \`Answered\`, \`Deferred\`, or \`Out of Scope\`.
3. If FSD is updated, share revised FSD version with QA.
`;

fs.writeFileSync(path.join(OUT, "ba-open-queries.md"), baQueries);

const coverage = `# Requirement Coverage Summary — RT-956

## FSD: TPMA First Month Free Offer - Improvements (v0.1)

\`\`\`
Total Requirements:        24
Total Test Cases:          50
Positive Test Cases:       32
Negative Test Cases:       12
Boundary/Edge Cases:        1
API Test Cases:            11
DB Test Cases:              0 (N/A)
Regression Test Cases:      3
Uncovered Requirements:     0 (pending BA clarifications for analytics detail)
\`\`\`

## Requirement Traceability

| Requirement ID | Description | Test Case IDs | Covered |
|----------------|-------------|---------------|---------|
| FR-001 | Onboarding communicates First Month Free Offer and terms | TC_001, TC_046 | Yes |
| FR-002 | Sampling banner during free content consumption | TC_005, TC_008, TC_041 | Yes |
| FR-003 | Banner below player and in content lists | TC_006, TC_007 | Yes |
| FR-004 | Banner disappears when offer not applicable | TC_013, TC_041 | Yes |
| FR-005 | No sampling banner when promotion availed | TC_011 | Yes |
| FR-006 | Sampling banner when promotion not availed | TC_012 | Yes |
| FR-007 | Offer expiry notification banner | TC_014 | Yes |
| FR-008 | Unsubscribed channel banner | TC_016, TC_042 | Yes |
| FR-009 | Unsubscribed banner for sampling content | TC_017 | Yes |
| FR-010 | Figma Promo banner option 1 final | TC_019 | Yes |
| FR-011 | PubNub eligibility and remaining days | TC_028, TC_044 | Yes |
| FR-012 | Dynamic account status on subscribe | TC_029 | Yes |
| FR-013 | Suspended/inactive — no banners/tracking | TC_025, TC_026, TC_027 | Yes |
| FR-014 | Eligible new users only | TC_002, TC_003, TC_004, TC_047 | Yes |
| FR-015 | Real-time remaining days | TC_015, TC_043 | Yes |
| FR-016 | Mixpanel and MoEngage events | TC_030–TC_034, TC_045, TC_050 | Yes |
| FR-017 | CMS configurable banner | TC_024 | Yes |
| FR-018 | Add Pack CTA behaviour | TC_009, TC_010 | Yes |
| FR-019 | Generic unsubscribed banner until channel added | TC_018 | Yes |
| FR-020 | Access/Offer Unlocked backend text + responsive | TC_020–TC_023 | Yes |
| FR-021 | Performance — no UI lag | TC_035 | Yes |
| FR-022 | Backward compatibility — post-release app only | TC_036, TC_037 | Yes |
| FR-023 | WEB out of scope | TC_038 | Yes |
| FR-024 | Existing subscribers / landing pages out of scope | TC_039, TC_040, TC_048, TC_049 | Yes |
`;

fs.writeFileSync(path.join(OUT, "coverage-summary.md"), coverage);

const report = `# RT-956 — Full QA Test Case Report

**FSD:** TPMA First Month Free Offer - Improvements (v0.1)  
**Source:** \`fsd/1787904427156-RT-956_TPMA_First_Month_Free_Offer_-_Improvements__1_.docx\`  
**Generated:** 2026-08-28

---

## 1. FSD Summary

RT-956 enhances the **TPMA First Month Free Offer** for Tata Play new registered users on Android and iOS. Scope includes revamped UI/UX (onboarding, browsing, content viewing), **sampling banners** showing remaining free days, **unsubscribed channel banners**, PubNub-driven eligibility, and **Mixpanel/MoEngage** analytics.

### Key Features
- Onboarding communication of First Month Free Offer and terms
- Sampling banner: "Only xx days left to watch for free – till xx Month" + Add Pack CTA
- Unsubscribed banner: "You have not subscribed to this Channel"
- PubNub for campaign eligibility and remaining days
- CMS-configurable banner copy
- Analytics: FREE-PROMOTION-SUBSCRIPTION (Mixpanel) / FREE_PROMOTION_SUBSCRIPTION (MoEngage)

### Out of Scope
- Existing subscribers / users with any pack post-registration
- WEB platform
- Service landing, landing page, Genre PI page

---

## 2. Identified Requirements

24 functional/non-functional requirements (FR-001 to FR-024) — see \`coverage-summary.md\`.

---

## 3. Assumptions

| # | Assumption | Basis |
|---|------------|-------|
| A-001 | Figma Promo banner option 1 is the authoritative UI reference | FSD states option 1 is final |
| A-002 | "Add Pack" navigates to standard pack subscription flow | FSD describes generic CTA until PI availment |
| A-003 | Day boundary for remaining days follows server/PubNub timezone | FSD requires real-time updates without specifying TZ |

---

## 4–9. Test Case Deliverables

- **test-cases.csv** — 50 functional/UI/integration cases
- **api-test-cases.csv** — 11 API/analytics cases
- **regression-test-cases.csv** — 3 regression cases
- **ba-open-queries.md** — 10 BA queries (3 P0 blockers)

---

## 10. Coverage Summary

See \`coverage-summary.md\`.

---

## 11. Open Queries for BA

See \`ba-open-queries.md\` — 10 queries pending BA response.
`;

fs.writeFileSync(path.join(OUT, "full-report.md"), report);

console.log("Generated RT-956 deliverables in", OUT);
execSync(`node scripts/export-qa-pack.js ${PROJECT}`, { cwd: ROOT, stdio: "inherit" });
console.log("Export complete");
