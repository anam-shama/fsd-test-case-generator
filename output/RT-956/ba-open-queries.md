# Open Queries for Business Analyst (BA)

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
2. Update **Status** to `Answered`, `Deferred`, or `Out of Scope`.
3. If FSD is updated, share revised FSD version with QA.
