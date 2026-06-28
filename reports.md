# MHMBMS — Process & Compliance Report
**Makati Human Milk Bank Management System**
*Prepared for: Internal Development Team / Academic Review*
*Reference document: `docs/human_milk_bank_design_doc.md` (single source of truth)*
*Date: 2026-06-28*

---

## 1. Purpose

This report evaluates whether the current web application faithfully implements the processes, data structures, and business logic described in the original design document (`docs/human_milk_bank_design_doc.md`). It covers:

- **Process alignment** — Does each screen follow the workflow steps in the design doc's flowcharts (Figures 1–10)?
- **Data/field alignment** — Do the forms and database tables capture the same fields as Appendices F, G, H, and I?
- **Gaps** — Features specified in the design doc that are not yet built.
- **Deviations** — Cases where the app differs from the design doc (intentional or not).

Each finding is flagged, given a recommendation, and assigned a priority level.

| Priority | Meaning |
|---|---|
| **P1 — Critical** | Breaks a core clinical or operational process; must be resolved before go-live |
| **P2 — Moderate** | Reduces fidelity or completeness; should be resolved before handoff |
| **P3 — Low** | Enhancement or audit concern; can be deferred to a later phase |

---

## 2. Process Alignment Analysis

### 2.1 Supsup Todo (Figure 1)

The design doc describes the full mobile donation workflow:

```
Screening → Counseling → Interview & Consent → Donor Log Update
→ Lactation Massage → Milk Extraction → Bottling (Cold Chain)
→ Collection Log Update → Pre-Lab Sampling → Lab Testing (2 wks)
→ [Fail → Discard] / [Pass → Pasteurization]
→ Post-Lab Sampling → Lab Testing (2 wks)
→ [Fail → Discard] / [Pass → Ready for Dispensing]
```

**App coverage:**

| Design Doc Step | Screen | Status | Notes |
|---|---|---|---|
| Screening (prelim lab test) | Donor Management → Health Screening tab | ✅ Implemented | All binary health flags are captured |
| Counseling (10–20 min) | — | ⚠️ Partial | `counseling_completed_at` is in the schema but not exposed in the UI |
| Interview & Consent Signing | — | ⚠️ Partial | `interview_completed_at`, `consent_signed_at` in schema, not in UI |
| Update Donor List/Log | Donor Management | ✅ Implemented | Records persist to `donors` + `donor_screenings` tables |
| Lactation Massage | — | ➖ Not applicable | Physical step; no digital record required |
| Milk Extraction + Bottling (Cold Chain) | Milk Collection | ✅ Implemented | `cold_chain_verified` boolean captured |
| Update Collection Log | Milk Collection | ✅ Implemented | CTN auto-generated, linked to batch |
| Pre-lab sampling (≤5mL) | Lab Testing | ✅ Implemented | `sample_volume_ml` field, stage = `pre_pasteurization` |
| Sent to City Hall (2-week turnaround) | Lab Testing | ✅ Implemented | `sent_to_lab_at` + `expected_result_at` auto-set +14 days |
| Lab result: Fail → Discard | Lab Testing | ✅ Implemented | Batch status transitions to `discarded` automatically |
| Lab result: Pass → Pasteurization | Lab Testing → Pasteurization | ✅ Implemented | Batch transitions to `pre_test_passed`, then `pasteurized` |
| Post-lab sampling (≤5mL) | Lab Testing | ✅ Implemented | stage = `post_pasteurization` |
| Post-lab: Fail → Discard | Lab Testing | ✅ Implemented | Batch → `discarded` |
| Post-lab: Pass → Ready | Lab Testing | ✅ Implemented | Batch → `ready`, bottle created in `bottles` table |

**Summary:** The core milk lifecycle pipeline is fully implemented. The only gap is the counseling/consent timestamp UI — the data model supports it but the form does not expose it.

---

### 2.2 Milky Way (Figure 2)

The design doc states that Milky Way donors are pre-screened during prenatal checkups at the hospital. The workflow bypasses the screening and counseling steps entirely and begins directly at milk collection.

**App coverage:**

| Design Doc Step | Status | Notes |
|---|---|---|
| Skip screening (pre-screened) | ✅ Implemented | `screening_status: 'not_required'` value exists in the schema and is selectable |
| Hospital collection | ✅ Implemented | Collection form supports all programs; `program = 'milky_way'` |
| Bottling & labeling | ✅ Implemented | CTN auto-generated |
| Lab + pasteurization pipeline | ✅ Implemented | Same pipeline as Supsup Todo |

**Summary:** Milky Way is fully covered. The screening bypass is explicitly modeled in the schema.

---

### 2.3 Mom's Act (Figure 3)

The workflow begins with a household pickup request (donor contacts the bank) and follows the same post-collection pipeline.

**App coverage:**

| Design Doc Step | Status | Notes |
|---|---|---|
| Donor contacts milk bank | ➖ Not tracked | No "initial contact" record; collection starts at the pickup step |
| Household collection (PU mode) | ✅ Implemented | `collection_mode = 'pickup'` |
| Date of Pickup (DoPU) | ⚠️ Partial | `pickup_at` column exists in the schema but is not exposed in the collection form |
| Lab + pasteurization pipeline | ✅ Implemented | Same pipeline |

**Summary:** Substantially aligned. The DoPU field is a specific label requirement (Appendix F) that is in the schema but missing from the UI form.

---

### 2.4 Dispensing Procedure (Figure 4)

The design doc flow:
```
Mother visits → Check existing record → [Create if none]
→ Check requirements → [Incomplete → Cancel] / [Complete → Collect payment → Release milk → Update logbook]
```

**App coverage:**

| Design Doc Step | Screen | Status | Notes |
|---|---|---|---|
| Check/create recipient record | Recipients screen (pre-requisite) | ✅ Implemented | Beneficiaries are registered before dispensing |
| Requirements checklist | Dispensing Step 2 | ✅ Implemented | NICU, guardian ID, referral letter, balance, deposit — all checked |
| Incomplete → Cancel | Dispensing Step 2 | ✅ Implemented | "Next" button is disabled until all requirements are met |
| Collect payment / fee | Dispensing Step 4 | ✅ Implemented | Fee calculated at ₱2.00/mL, deposit tracked |
| Release milk (select bottle) | Dispensing Step 3 | ✅ Implemented | FIFO bottle selection from `bottles` table |
| Update logbook | Dispensing Step 5 | ✅ Implemented | `dispensing_records` + `dispensing_items` persisted; `bottles.remaining_volume_ml` decremented |

**Summary:** The dispensing procedure is the most complete module and actually exceeds the design doc's level of detail with its 5-step wizard and `dispensed_by` tracking.

---

### 2.5 Milk Availability Inquiry (Figures 5 and 10)

The design doc flow:
```
Staff receives inquiry → Is baby in NICU? → [No → End]
→ Is inventory sufficient? → [No → Record + notify via SMS/email]
                           → [Yes → Inform of requirements + update record]
```

**App coverage:**

| Design Doc Step | Status | Notes |
|---|---|---|
| Receive inquiry | ✅ Implemented | `InquiryWaitingListScreen` exists; inquiry type (walk_in / hotline_call) captured |
| NICU gate | ✅ Implemented | `nicu_confirmed` boolean on `inquiries`; `waiting_list_requires_nicu` constraint enforced at DB level |
| Inventory check | ❌ Not implemented | App does not auto-check available inventory against the inquiry volume; staff must do this manually |
| Record inquiry details | ✅ Implemented | `inquiries` table captures beneficiary, requested volume, type |
| Notify via email when available | ⚠️ Partial | `email_notifications` table exists; actual email sending is not wired to an automatic trigger |
| Status tracking (waiting → notified → fulfilled) | ✅ Implemented | Full status lifecycle with auto-timestamp trigger |
| Days waiting | ⚠️ Partial | `Revision.md` flags this as needing a fix; `requested_at` is stored, calculation exists but display needs audit |

**Summary:** Inquiry recording and status tracking are implemented. The inventory-check step and the email-send trigger are not yet automated — staff must manually assess inventory and manually trigger notifications.

---

## 3. Data / Field Alignment Analysis

### 3.1 Appendix F — Collection Label (Raw Milk)

The design doc specifies this label for every unpasteurized bottle:

| Label Field | Code Field | Status | Notes |
|---|---|---|---|
| DTN | `donors.dtn` | ✅ Matched | Auto-generated as `DTN-XXXXXX` |
| Volume | `collections.volume_ml` | ✅ Matched | |
| AOB (Age of Baby) | `collections.age_of_baby_days` | ✅ Matched | Stored in days, displayed in weeks |
| Mode of Collection (FC / PU) | `collections.collection_mode` | ✅ Matched | `field_collection` / `pickup` |
| DoC (Date of Collection) | `collections.collected_at` | ✅ Matched | |
| DoPU (Date of Pickup) | `collections.pickup_at` | ⚠️ Gap | In schema, not in UI form |
| Collected by | `collections.collected_by` (UUID FK) | ⚠️ Partial | FK to profiles; the UI captures a free-text name, not a profile selection |
| DoEx (Date of Expiration on raw label) | — | ❌ Gap | Not captured at collection stage; expiration is only set when a bottle is created post-pasteurization |

### 3.2 Appendix F — Bottle Label (Pasteurized Milk)

| Label Field | Code Field | Status | Notes |
|---|---|---|---|
| Batch No. | `batches.batch_number` | ✅ Matched | Auto-generated as `BATCH-XXXXXX` |
| Bottle No. | `bottles.bottle_number` | ✅ Matched | Auto-generated as `BTL-XXXXXX` |
| Volume | `bottles.volume_ml` | ✅ Matched | |
| Date of Expiration | `bottles.expires_at` | ✅ Matched | Set to +90 days on bottle creation |
| Barcode / Traceability sign-off | — | ❌ Gap | No barcode generation or printing functionality |

### 3.3 Appendix G/H — Donor Health Screening Form

| Screening Field | Code Field | Status | Notes |
|---|---|---|---|
| Full Name | `donors.full_name` | ✅ Matched | |
| Address | `donors.address` | ✅ Matched | |
| Prenatal Health Center | — | ❌ Gap | Not captured anywhere in schema or UI |
| Telephone Number | `donors.contact_number` | ✅ Matched | |
| Occupation | `donors.occupation` | ✅ Matched | |
| Age | Derived from `donors.date_of_birth` | ✅ Matched (better) | Storing DOB is more durable than storing age |
| Civil Status | `donors.civil_status` | ✅ Matched | single / married / separated / widowed |
| Classification (Community / Private / Institutional) | `donors.classification` | ✅ Matched | |
| Travel history (5 years) | `donor_screenings.travel_history_5_years` | ✅ Matched | |
| Tuberculosis history | `donor_screenings.tuberculosis_history` | ✅ Matched | |
| Hepatitis B history | `donor_screenings.hepatitis_b_history` | ✅ Matched | |
| Mastitis history | `donor_screenings.mastitis_history` | ✅ Matched | |
| Syphilis history | `donor_screenings.syphilis_history` | ✅ Matched | |
| Herpes / STD history | `donor_screenings.herpes_or_std_history` | ✅ Matched | |
| Blood transfusion / organ transplant (12 months) | `donor_screenings.blood_transfusion_last_12_months` + `organ_transplant_history` | ✅ Matched | |
| Alcohol (last 24h) | `donor_screenings.alcohol_last_24_hours` | ✅ Matched | |
| Smoking | `donor_screenings.smoking_history` | ✅ Matched | |
| Illegal drug use | `donor_screenings.illegal_drug_use` | ✅ Matched | |
| Strict vegan diet / medications | `donor_screenings.strict_vegan_diet` + `current_medications` | ✅ Matched | |
| Last delivery date | `donor_screenings.last_delivery_date` | ✅ Matched | |
| Counseling completed | `donor_screenings.counseling_completed_at` | ⚠️ Partial | In schema, not in UI form |
| Interview completed | `donor_screenings.interview_completed_at` | ⚠️ Partial | In schema, not in UI form |
| Consent signed | `donor_screenings.consent_signed_at` | ⚠️ Partial | In schema, not in UI form |
| Maternal authorization text | — | ❌ Gap | Consent language is not displayed or acknowledged in the UI |

### 3.4 Appendix I — Monthly Collection Unit Ledger

| Ledger Field | Code Field | Status | Notes |
|---|---|---|---|
| Collection streams (Supsup Todo, Milky Way, Mom's Act) | `collection_unit_report_base` view, grouped by `program` | ✅ Matched | |
| In-House collection stream | — | ❌ Gap | No "In-House" program exists; design doc implies a 4th stream for direct bank walk-ins |
| Total raw collected (mL) | `raw_collected_ml` in view | ✅ Matched | |
| QA failure deductions (mL) | `discarded_ml` in view | ✅ Matched | |
| Net transferred to pasteurization | `cleared_for_use_ml` in view | ✅ Matched | |
| Carryover balances (MHMB Previous / OSMAK Previous) | — | ❌ Gap | Monthly carryover tracking not implemented |
| Weekly / yearly rollup reports | — | ❌ Gap | Only monthly granularity is modeled; Reports screen is incomplete |

---

## 4. Gap Register

> Gaps are features or data points specified in the design doc that are not yet implemented in the app.

| # | Gap | Affected Module | Priority | Recommendation |
|---|---|---|---|---|
| G1 | Counseling / interview / consent timestamp inputs in Screening UI | Donor Management | **P2** | Add a "Completion Timestamps" section to the Health Screening tab; bind to `counseling_completed_at`, `interview_completed_at`, `consent_signed_at`. Required only for Supsup Todo donors. |
| G2 | Maternal consent authorization text displayed and acknowledged | Donor Management | **P2** | Render the consent statement (Appendix G) as read-only text before the submit button on the screening form; add a confirmation checkbox. |
| G3 | DoPU (Date of Pickup) field in Collection form | Milk Collection | **P2** | Conditionally show a "Pickup Date" datetime input when `collection_mode = 'pickup'`; bind to `collections.pickup_at`. |
| G4 | Raw milk expiration date on collection label | Milk Collection | **P3** | The raw label (Appendix F) includes a DoEx. Add an optional `expires_at` field to the collection form, or compute it as collected_at + N days and display on the label. |
| G5 | Prenatal Health Center field on donor form | Donor Management | **P3** | Add a `prenatal_health_center text` column to `donors` and expose it in the registration form. |
| G6 | Automatic inventory check against inquiry volume | Inquiry / Waitlist | **P1** | When an inquiry is submitted, query `bottles` for total `remaining_volume_ml` where `status = 'available'`. Display availability status in the inquiry detail view. |
| G7 | Automated email trigger when milk becomes available | Inquiry / Waitlist | **P1** | Wire the inquiry status transition from `waiting` → `notified` to an `email_notifications` insert. This closes the loop on Fig. 10's notification flow. |
| G8 | Days waiting display on Inquiry screen | Inquiry / Waitlist | **P1** | Calculate `now() - inquiries.requested_at` in days and display in the waitlist table. This is flagged in `Revision.md`. |
| G9 | In-House collection stream in ledger | Reports | **P3** | Determine with the client whether "In-House" is a 4th program or a collection point within an existing program. Add accordingly. |
| G10 | Monthly carryover balance tracking | Reports | **P2** | Add a `ledger_carryover` table or a monthly snapshot function to track `MHMB Previous` and `OSMAK Previous` balances as referenced in Appendix I. |
| G11 | Weekly and yearly report rollups | Reports | **P2** | Extend the `collection_unit_report_base` view (or create new ones) for weekly and yearly granularity. The Reports screen should offer a period selector. |
| G12 | Barcode / QR code label printing | Inventory / Bottles | **P3** | Generate a printable label (PDF or print-CSS page) for raw collection labels and pasteurized bottle labels per Appendix F. Use `batch_number`, `bottle_number`, `dtn`, `ctn` as identifiers. |

---

## 5. Deviation Register

> Deviations are cases where the app intentionally or unintentionally differs from the design doc.

| # | Deviation | Design Doc Specifies | App Does | Classification | Recommendation |
|---|---|---|---|---|---|
| D1 | Notification channel | SMS via GSM modem (Fig. 10, Chapter 3 hardware specs) | Email via `email_notifications` table | **Intentional** — documented in `context/DECISIONS.md` | No action needed. Document the rationale in academic submission as a conscious modernization decision. |
| D2 | Batch pooling | Implied 1 collection = 1 batch (Fig. 1 shows single bottling flow per extraction) | Multiple collections can be pooled into one batch via `batch_collections` | **Beneficial deviation** | Retain as-is. Pooling is a common milk bank practice and improves inventory efficiency. Note as an enhancement in academic report. |
| D3 | Status override on Collection form | Not specified — design doc shows a fixed pipeline | Previous version allowed staff to set arbitrary batch status at creation | **Corrected** — fixed in this session | Status override has been removed. All batches now start as `RAW`, enforcing the pipeline described in Figs. 1–3. |
| D4 | Milky Way / Mom's Act screening bypass | Design doc explicitly shows no screening for these programs (Figs. 2–3) | App has a unified screening form for all programs; `not_required` status handles the bypass but no program-level gating exists in the UI | **Minor gap** | Add a UI guard: when `program = 'milky_way'` or `'moms_act'`, auto-set `screening_status = 'not_required'` and hide or collapse the screening tab. |
| D5 | "Collected by" field | Appendix F label shows a free-text name field ("Collected by: ______") | UI has a free-text input (`collected_by` text), but the schema maps this to a UUID FK to `profiles` | **Schema/UI mismatch** | Resolve: either change the UI to a staff dropdown (FK lookup), or change the column to `collected_by_name text`. The FK approach is better for accountability. |
| D6 | Initial contact record for Mom's Act | Fig. 3 begins with "Contact Milk Bank" — implying a contact log entry before collection | No contact log; collection is the first record in the system | **Acceptable deviation** | The design doc's "contact" step is a phone call — no digital record is needed. The `inquiry_type = 'hotline_call'` on inquiries partially serves this purpose for beneficiaries, but Mom's Act donors have no equivalent. Accept as-is for now. |
| D7 | Dispensing exceeds design doc spec | Fig. 4 shows a 3-state flow (check record → check requirements → pay/release) | App has 5-step wizard with explicit clinical gate checks and `dispensed_by` accountability | **Beneficial enhancement** | Retain. The additional verification steps are clinically sound and exceed the original requirements. |

---

## 6. Priority Summary

### P1 — Critical (resolve before go-live)

| # | Item |
|---|---|
| G6 | Automatic inventory check on inquiry submission |
| G7 | Email trigger: `waiting → notified` status change |
| G8 | Days waiting display on Inquiry screen |

### P2 — Moderate (resolve before handoff)

| # | Item |
|---|---|
| G1 | Counseling / interview / consent timestamps in Screening UI |
| G2 | Maternal consent text and acknowledgment checkbox |
| G3 | DoPU (Date of Pickup) in Collection form |
| G10 | Monthly carryover balance in ledger |
| G11 | Weekly and yearly report rollups |
| D4 | Program-level screening bypass guard in UI |
| D5 | "Collected by" — FK dropdown vs. free-text resolution |

### P3 — Low (defer to later phase)

| # | Item |
|---|---|
| G4 | Raw milk expiration date on collection label |
| G5 | Prenatal Health Center field on donor form |
| G9 | In-House collection stream in ledger |
| G12 | Barcode / QR label printing |
| D6 | Mom's Act initial contact log |

---

## 7. Overall Alignment Assessment

| Module | Alignment |
|---|---|
| Donor Management & Screening | ✅ High — all clinical fields covered; minor UI gaps in timestamps |
| Milk Collection | ✅ High — CTN, volume, mode, AOB all captured; DoPU missing for PU mode |
| Lab Testing | ✅ Full — two-stage pipeline, 14-day turnaround, pass/fail status transitions |
| Pasteurization | ✅ Full — temperature, duration, operator, automatic status advancement |
| Inventory / Bottles | ✅ High — FIFO, remaining volume, expiry; barcode printing not implemented |
| Dispensing | ✅ Full — exceeds design doc spec with 5-step wizard and clinical gate enforcement |
| Inquiry / Waitlist | ⚠️ Partial — recording and status lifecycle work; inventory check and email trigger not automated |
| Reports | ⚠️ Partial — monthly collection view implemented; weekly/yearly and carryover not yet done |
| Audit Log | ✅ Full — all major tables have write_audit_log triggers; admin-gated read screen |
| Notifications (SMS→Email) | ✅ Accepted deviation — `email_notifications` table in place; send trigger not wired |

**The system faithfully implements the core milk lifecycle** (collection → lab → pasteurization → dispensing) as specified in Figures 1–4 of the design document. The primary areas requiring attention before go-live are the Inquiry module's automation gaps (G6–G8) and the missing notification trigger (G7). All other gaps are operational enhancements that improve completeness and field-level fidelity.

---

*Generated from codebase audit against `docs/human_milk_bank_design_doc.md` on 2026-06-28.*
