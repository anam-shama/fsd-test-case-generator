# Requirement Coverage Summary — RT-956

## FSD: TPMA First Month Free Offer - Improvements (v0.1)

```
Total Requirements:        24
Total Test Cases:          50
Positive Test Cases:       32
Negative Test Cases:       12
Boundary/Edge Cases:        1
API Test Cases:            11
DB Test Cases:              0 (N/A)
Regression Test Cases:      3
Uncovered Requirements:     0 (pending BA clarifications for analytics detail)
```

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
