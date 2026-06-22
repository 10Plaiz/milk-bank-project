# Mother's Reach — Human Milk Bank Management System
## Development Roadmap v1.2

> **Client:** Makati Human Milk Bank, 1126 Rodriguez Ave., Brgy. Bangkal, Makati City
> **System:** Web-based HMBMS replacing manual logbooks
> **Last Updated:** Aligned with Design Document and SRS v1.1 (April 28, 2026)

---

## Regulatory Context

All development must comply with:
- Republic Act No. 7600 (Expanded Breastfeeding Promotion Act of 2009)
- Makati City Ordinance No. 2014-089
- Philippine Milk Code (Executive Order No. 51)
- DOH Philippine Human Milk Banking Manual of Operations (2014)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, TailwindCSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth) |
| SMS | Semaphore SMS API |
| Deployment | Vercel + Supabase Cloud |

---

## Core Business Workflow

Every feature revolves around the milk batch lifecycle. **No module may bypass these transitions.**

```
Donor
 ↓
Collection (program-specific: Supsup Todo / Milky Way / Mom's Act)
 ↓
Pre-Pasteurization Lab Test  ←── 2-week City Hall turnaround
 ↓
Pasteurization
 ↓
Post-Pasteurization Lab Test  ←── 2-week City Hall turnaround
 ↓
Storage / Ready
 ↓
Dispensing → Recipient (NICU priority enforced)
```

### Milk Batch Status Flow

```
RAW → PRE_TESTING → PRE_TEST_PASSED → PASTEURIZED → POST_TESTING → READY → DISPENSED
                 ↘ PRE_TEST_FAILED → DISCARDED
                                                              ↘ POST_TEST_FAILED → DISCARDED
```

### Critical Linking Rule

Every collection, lab test, pasteurization record, inventory update, SMS notification, dispensing record, and audit log entry **must be linked to both:**
- `DTN` — Donor Tracking Number
- `CTN` — Collection Tracking Number (per batch/session)
- `Batch Number` — generated at collection

---

## User Roles & Access

| Role | Primary Responsibilities |
|---|---|
| Administrator | System config, user management, full read/write access |
| Doctor | Clinical oversight, approval authority |
| Nurse | Collection logging, dispensing, recipient management |
| Midwife | Collection (field/household), inquiry management |
| Medical Technologist | Lab test entry, pasteurization recording |

Role-based access must be enforced on every route and API call.

---

## Program-Specific Collection Rules

### Supsup Todo (Community/Mobile Collection)
- Staff visit health centers to collect milk from community donors
- **Requires full screening before collection:** preliminary lab test → counseling (10–20 min) → interview → consent signing → lactation massage (10–20 min) → extraction
- Volume limits: 30–240 mL/session, max 800 mL/day
- Collection mode: Field Collection (`FC`)

### Milky Way (Hospital-Based Collection)
- Donors are pre-screened via prenatal hospital records; **screening step is skipped in the system**
- Staff log hospital visit schedules and collection details
- Collection mode: Field Collection (`FC`)
- Primary recipients: premature babies in partner hospital NICUs

### Mom's Act (Household Pickup)
- Pre-screened donors call/request pickup; staff collect at residence
- **Screening step is skipped;** collection logging begins at household pickup
- Collection mode: Pickup (`PU`)

---

## Database Tables

```
users, profiles

donors, donor_screenings

recipients

milk_batches, milk_collections, milk_tests, pasteurization_records

inventory

inquiries

dispensing_records

sms_logs, audit_logs
```

- All tables use UUIDs and enforce foreign key relationships
- Every record must carry `donor_id` (DTN), `batch_id`, and `collection_id` (CTN) where applicable

---

## Development Phases

---

### Phase 1 — Authentication & Role Management

**Goal:** Secure, role-gated access for all five user types.

**Deliverables:**
- Login page with token-based auth (Supabase Auth + JWT)
- Password hashing and secure session management
- Protected route guards per user role
- Role assignment UI for Administrator
- Logout and session expiry handling

**Test cases (from SRS Table 5.2):**
- Valid credentials per role → login success
- Mismatched credentials → login failure
- Valid ID + invalid password → failure
- Invalid ID + valid password → failure

---

### Phase 2 — Database Schema & Supabase Setup

**Goal:** Establish the complete relational schema before any module is built.

**Deliverables:**
- Create all tables with UUID primary keys and FK constraints
- Row-level security (RLS) policies per role
- Seed roles and test user accounts
- Migration scripts versioned in the repo
- Confirm DTN/CTN/Batch linkage is enforced at schema level (NOT NULL constraints where required)

**Key fields to confirm at schema stage:**
- `milk_batches`: `batch_number`, `donor_id` (→ DTN), `collection_id` (→ CTN), `status` (enum: RAW, PRE_TESTING, PRE_TEST_PASSED, PASTEURIZED, POST_TESTING, READY, DISPENSED, PRE_TEST_FAILED, POST_TEST_FAILED, DISCARDED), `program_type`, `volume_ml`
- `donors`: `dtn`, `name`, `address`, `contact_number`, `program_type`, `screening_status`, `date_of_birth`, `civil_status`, `occupation`, `classification` (community/private/institutional)
- `donor_screenings`: `donor_id`, `travel_history`, `tb_history`, `hepatitis_b`, `blood_transfusion_history`, `alcohol_use`, `smoking`, `drug_use`, `medications`, `consent_signed`, `last_delivery_date`, `screened_by`, `screened_at`
- `milk_collections`: `ctn`, `donor_id`, `batch_number`, `program_type`, `volume_ml`, `collection_date`, `collection_mode` (FC/PU), `aob` (age of baby), `collected_by`
- `milk_tests`: `batch_id`, `test_type` (PRE/POST), `result` (PASS/FAIL), `sample_volume_ml`, `sent_to_lab_date`, `result_date`, `tested_by`
- `pasteurization_records`: `batch_id`, `operator_id`, `temperature_c`, `duration_minutes`, `pasteurized_at`
- `recipients`: `guardian_name`, `baby_name`, `hospital`, `nicu_status` (boolean), `contact_number`, `aob`
- `inquiries`: `recipient_id`, `status` (WAITING/NOTIFIED/FULFILLED/CANCELLED), `nicu_confirmed`, `inquiry_date`, `notes`
- `dispensing_records`: `recipient_id`, `batch_id`, `volume_ml`, `fee_per_ml` (default 2.00 PHP), `total_fee`, `deposit_paid`, `dispensed_by`, `dispensed_at`
- `sms_logs`: `recipient_id`, `message`, `trigger_event`, `sent_at`, `status`
- `audit_logs`: `user_id`, `action`, `table_affected`, `record_id`, `old_value`, `new_value`, `timestamp`

---

### Phase 3 — Donor Management Module

**Goal:** Register and manage donor records with full health screening per DOH MOP standards.

**Deliverables:**
- Donor list view (searchable by DTN, name, program)
- Donor registration form with auto-generated DTN
- Donor health screening form including:
  - Personal data: full name, address, prenatal health center, telephone, occupation, age, civil status
  - Classification: community / private / institutional employee
  - Travel history (5-year international)
  - Clinical checklist: TB, Hepatitis B, Mastitis, Syphilis, Herpes/STDs, blood transfusions (past 12 months), organ transplant history
  - Lifestyle indicators: alcohol (past 24 hrs), smoking, illegal drug use
  - Dietary and medication notes (vitamins, herbal, hormonal)
  - Maternal authorization / consent signing field
- Screening status management (Pending / Passed / Failed)
- Donor profile edit and history view
- Program type assignment (Supsup Todo / Mom's Act / Milky Way)

**Referenced fields:** Design Doc Appendix G & H, SRS §3.1.1–3.1.2

---

### Phase 4 — Milk Collection Module

**Goal:** Record program-specific milk donations and generate batch/label data.

**Deliverables:**
- Collection form per program type with conditional logic:
  - **Supsup Todo:** enforce donor screening completion gate before collection entry
  - **Milky Way / Mom's Act:** bypass screening gate (pre-screened externally)
- Fields: CTN (auto-generated), Batch Number (auto-generated), donor (linked by DTN), program type, volume (mL), collection date, collection mode (FC / PU), age of baby (AOB), collected by
- Volume validation: 30–240 mL/session; flag if daily total exceeds 800 mL across sessions for same donor
- Label data output (matching Appendix F format):
  - Unpasteurized label: DTN, Volume, AOB, Mode of Collection, Date of Collection, Date of Pickup, Collected By, Expiry
  - Pasteurized label: Batch No, Bottle No, Volume, Date of Expiration
- Batch status automatically set to `RAW` on creation
- Collection log view (filterable by date, program, donor, status)

**Referenced fields:** Design Doc Appendix F, §Milk Collection; SRS §3.1.3, §3.2.2, §3.3.1–3.3.2

---

### Phase 5 — Laboratory Testing Module

**Goal:** Track pre- and post-pasteurization microbiological tests with City Hall turnaround tracking.

**Deliverables:**
- Pre-pasteurization test form:
  - Link to batch (by batch number / CTN)
  - Sample volume (≤5 mL), date sent to City Hall lab, expected result date (~2 weeks)
  - Result entry: PASS → set batch to `PRE_TEST_PASSED`; FAIL → set to `PRE_TEST_FAILED` → trigger DISCARDED
- Post-pasteurization test form (same structure):
  - PASS → set batch to `READY`; FAIL → set to `POST_TEST_FAILED` → trigger DISCARDED
- Test log view (filterable by batch, test type, result, date range)
- Pending lab results dashboard (batches in `PRE_TESTING` or `POST_TESTING` with days elapsed)
- Logged by Medical Technologist role only

**Referenced fields:** Design Doc Fig. 1–3; SRS §3.1.4, §3.2.3, §3.3.3

---

### Phase 6 — Pasteurization Module

**Goal:** Record pasteurization runs and advance batch status.

**Deliverables:**
- Pasteurization entry form:
  - Batch selection (must be in `PRE_TEST_PASSED` status — gate enforced)
  - Operator (staff member), temperature (°C), duration (minutes), date
  - Submission sets batch to `PASTEURIZED` and triggers post-pasteurization test creation
- Pasteurization log view (filterable by operator, date, batch)
- Logged by Medical Technologist role

**Referenced fields:** Design Doc Fig. 1–3; Sterifeed reference (62.5°C / 30 min standard)

---

### Phase 7 — Inventory Management Module

**Goal:** Real-time inventory view derived entirely from batch status transitions.

**Deliverables:**
- Inventory dashboard with live counts and volumes (mL) by status:
  - Raw Milk (`RAW`)
  - In Testing (`PRE_TESTING`, `POST_TESTING`)
  - Pending Pasteurization (`PRE_TEST_PASSED`)
  - Pasteurized (`PASTEURIZED`)
  - Ready for Dispensing (`READY`)
  - Dispensed (`DISPENSED`)
  - Discarded (`PRE_TEST_FAILED`, `POST_TEST_FAILED`, `DISCARDED`)
- Inventory is **read-only derived data** — no direct edits; all changes come from batch status transitions
- Filter by program type, date range, batch number

---

### Phase 8 — Recipient Management Module

**Goal:** Maintain beneficiary records for dispensing and inquiry processing.

**Deliverables:**
- Recipient registration form:
  - Guardian name, baby name, hospital, NICU status (boolean), contact number, AOB
- Recipient profile view and edit
- Recipient search (by guardian name, baby name, hospital)
- NICU status prominently flagged in list view (used as priority filter in dispensing)

---

### Phase 9 — Inquiry & Waiting List Module

**Goal:** Manage milk availability inquiries via walk-in and hotline, enforcing NICU priority.

**Deliverables:**
- Inquiry intake form:
  - Inquiry type: Walk-in / Hotline Call
  - Link to existing recipient record (or create new)
  - NICU confirmation gate: **if baby is not NICU, inquiry cannot proceed to waiting list** (per design doc Fig. 5 & 10)
  - Notes field
- Waiting list view (ordered by inquiry date, NICU-flagged entries highlighted)
- Status management: WAITING → NOTIFIED → FULFILLED / CANCELLED
- When batch status reaches `READY` and inventory buffer allows: flag matched waiting recipients for SMS notification
- Automatic SMS trigger on status change to NOTIFIED (feeds into Phase 10)

**Referenced fields:** Design Doc Fig. 5 & 10; SRS §2.2 (SMS module), §1.3 (dispensing inquiry workflow)

---

### Phase 10 — SMS Notification Module

**Goal:** Automated, logged SMS alerts to recipients via Semaphore API.

**Deliverables:**
- Semaphore API integration (configured via environment variable)
- Trigger points:
  - Milk available: recipient status → NOTIFIED
  - Dispensing confirmation
  - Status updates (configurable)
- Message templates (editable by Administrator)
- All sent messages logged to `sms_logs` with: recipient, message body, trigger event, timestamp, delivery status
- SMS log view (filterable by recipient, date, event type, status)
- Failed SMS retry handling and error display

---

### Phase 11 — Dispensing Module

**Goal:** Process milk release to recipients with eligibility verification, fee calculation, and inventory update.

**Deliverables:**
- Dispensing workflow (enforced step order):
  1. **Verify Recipient** — search by name; confirm existing record
  2. **Check Requirements** — confirm NICU status and completed intake steps
  3. **Check Inventory** — confirm `READY` batches with sufficient volume
  4. **Fee Calculation** — 2 PHP/mL × volume; display deposit and total amount
  5. **Dispense** — record volume dispensed, staff on duty, date; set batch to `DISPENSED` (or reduce remaining volume)
  6. **Update Inquiry Status** — linked inquiry set to FULFILLED
- Dispensing record fields: recipient, batch number (DTN + CTN linked), volume, fee per mL, total fee, dispensed by, dispensed at
- Dispensing log view (filterable by recipient, date, batch, staff)
- Incomplete requirements → block dispensing with clear reason shown

**Referenced fields:** Design Doc Fig. 4 & 9; SRS Table 5.8 (fee at 2 PHP/mL)

---

### Phase 12 — Reports & Dashboard Module

**Goal:** Auto-generated reports covering all operational metrics, exportable in PDF and Excel.

**Deliverables:**
- Summary dashboard (real-time):
  - Total donors by program
  - Total batches by status
  - Volume collected, pasteurized, dispensed, discarded (mL)
  - Active waiting list count
- Report generation:
  - **Daily Report:** collections, dispensing, lab results
  - **Weekly Report:** same metrics aggregated
  - **Monthly Report:** includes donor counts, recipient counts, program breakdown, discard rate
  - **Annual Report:** full year summary
- Export formats: PDF, Excel (.xlsx)
- Collection Unit Ledger view (per Appendix I structure): breakdown by In-House, Mom's Act, Milky Way, Supsup Todo with raw volume, QA failure adjustments, net to pasteurization, carryover balances

**Referenced fields:** Design Doc Appendix I; SRS §2.2; Design Doc §Objectives (c)

---

### Phase 13 — Audit Trail & System Hardening

**Goal:** Complete audit coverage, performance validation, and compliance review.

**Deliverables:**
- Audit log viewer (Administrator only): who changed what, when, on which record (old vs. new value)
- Confirm all batch status transitions are logged
- Confirm all DTN/CTN/Batch linkages are intact across all tables (referential integrity check)
- Role access penetration check: verify no role can access beyond their permissions
- Performance test under concurrent users (busy business hours simulation)
- Cross-browser compatibility check: Chrome, Firefox, Safari, Opera Mini, Chrome Mobile
- DOH/regulatory compliance review checklist sign-off
- Final user acceptance testing (UAT) with MHMB staff

---

## Cross-Document Alignment Notes

| Gap Found | Source | Resolution in Roadmap |
|---|---|---|
| Donor screening checklist missing from original roadmap | Design Doc Appendix G/H | Added to Phase 3 with full field list |
| CTN absent from collection fields | Design Doc Appendix F, SRS test tables | Added to Phase 4 and schema in Phase 2 |
| Collection mode (FC/PU) not captured | Design Doc label Appendix F | Added to Phase 4 collection form |
| Supsup Todo has pre-collection screening gate; Milky Way/Mom's Act skip it | Design Doc Fig. 1–3 | Conditional logic added to Phase 4 |
| 2-week City Hall lab turnaround not reflected | Design Doc Fig. 1–3 | Added to Phase 5 with pending dashboard |
| NICU priority gate in dispensing/inquiry not enforced | Design Doc Fig. 5 & 10 | Enforced in Phase 9 and Phase 11 |
| 2 PHP/mL fee not in original dispensing module | SRS Table 5.8 | Added to Phase 11 |
| Walk-in vs. Hotline inquiry types missing | Design Doc §Dispensing Procedure | Added to Phase 9 |
| AOB (Age of Baby) missing from collection/recipient fields | Design Doc Appendix F | Added to Phase 4 and Phase 8 |
| Audit trail placed too late (Phase 13) for a critical-linkage system | Design Doc critical rule | Schema for audit_logs defined in Phase 2; trail active from Phase 1 onward; Phase 13 is review/hardening only |
| Regulatory compliance never mentioned in original roadmap | SRS §2.5 | Added as top-level section and Phase 13 sign-off |
