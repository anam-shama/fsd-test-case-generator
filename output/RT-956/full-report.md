# RT-956 — Full QA Test Case Report

**FSD:** TPMA First Month Free Offer - Improvements (v0.1)  
**Source:** `fsd/1787904427156-RT-956_TPMA_First_Month_Free_Offer_-_Improvements__1_.docx`  
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

24 functional/non-functional requirements (FR-001 to FR-024) — see `coverage-summary.md`.

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

See `coverage-summary.md`.

---

## 11. Open Queries for BA

See `ba-open-queries.md` — 10 queries pending BA response.
