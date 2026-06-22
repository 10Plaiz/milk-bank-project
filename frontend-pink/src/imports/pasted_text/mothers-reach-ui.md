Design a complete frontend UI for "Mother's Reach", a web-based Human Milk Bank Management System (HMBMS) for the Makati Human Milk Bank in the Philippines. This is an internal staff-facing clinical operations tool — not a public consumer app.

---

## FRONTEND ONLY — BACKEND NOTES

All forms, tables, and interactive states should use clearly labeled placeholder data (e.g., "DTN-2024-001", "Juan dela Cruz", "450 mL"). Do not wire any logic. Every interactive element — buttons, dropdowns, form submissions, status badges — should exist as a static or prototype-only UI state. Leave all data fields clearly named so a developer can map them directly to a Supabase/PostgreSQL backend later. No authentication logic needed — just design the login screen and assume a logged-in state for all other screens.

---

## BRAND & VISUAL DIRECTION

- Name: Mother's Reach
- Client: Makati Human Milk Bank
- Tone: Clinical, trustworthy, clean. This is a government-run LGU health facility tool.
- Color palette: Soft warm whites and creams as background, a muted rose or warm coral as primary accent (referencing breastmilk/maternal care without being garish), neutral grays for secondary elements, and clear red/green for status indicators (FAILED/PASSED, DISCARDED/READY).
- Typography: Clean sans-serif (e.g., Inter or DM Sans). Comfortable line height for data-dense tables.
- Layout: Left sidebar navigation, main content area. Desktop-first but mobile-responsive. Must work on standard LGU desktop PCs and Chrome Mobile.
- Component style: Use shadcn/ui-style components — clean cards, subtle borders, no heavy drop shadows. Forms should feel structured but not intimidating for non-technical midwife and nurse users.

---

## USER ROLES (Design for role-aware UI)

The sidebar and visible actions should reflect the active user's role. Design for these five roles:
1. Administrator — full access
2. Doctor — read-heavy, approval views
3. Nurse — collection, dispensing, recipient management
4. Midwife — collection (field/household), inquiry management
5. Medical Technologist — lab test entry, pasteurization recording

Show the active role and name in the sidebar header. Role-restricted actions should appear grayed out or hidden (show one example of each pattern).

---

## SCREENS TO DESIGN

Design one screen per module below. Each screen must include: a page header with breadcrumb, the primary data table or form, action buttons (Add, Edit, Filter, Export where relevant), and empty/loading states.

### 1. Login Page
- Email and password fields
- Role is determined server-side — no role selector on login
- "Mother's Reach" logo/wordmark + Makati Human Milk Bank subtitle
- Subtle institutional feel

### 2. Dashboard (Home)
Summary cards showing:
- Total active donors (by program: Supsup Todo / Mom's Act / Milky Way)
- Milk inventory by status: RAW, IN TESTING, READY, DISPENSED, DISCARDED (volumes in mL)
- Active waiting list count
- Batches pending lab results (with days elapsed indicator)
A simple bar or area chart for monthly collection volume. A recent activity feed on the right.

### 3. Donor Management
- Searchable, filterable table: columns for DTN, Full Name, Program Type, Screening Status (badge: Pending / Passed / Failed), Contact Number, Actions
- "Add Donor" slide-over or modal form with two tabs:
  - Tab 1 — Personal Info: full name, address, prenatal health center, telephone, occupation, date of birth, civil status, classification (Community / Private / Institutional)
  - Tab 2 — Health Screening: clinical checklist (TB, Hepatitis B, Mastitis, Syphilis, Herpes/STDs, blood transfusion history, organ transplant, alcohol use, smoking, drug use, medications, travel history), consent signed toggle, last delivery date, screened by, date screened
- DTN is auto-generated (show as read-only pre-filled field)

### 4. Milk Collection
- Filterable collection log table: CTN, Batch Number, Donor (DTN + Name), Program Type, Volume (mL), Collection Date, Mode (FC / PU), Status badge, Actions
- "New Collection" form:
  - Program Type selector (Supsup Todo / Milky Way / Mom's Act)
  - If Supsup Todo: show a screening completion gate banner ("Confirm donor screening is complete before proceeding")
  - Fields: CTN (auto-generated, read-only), Batch Number (auto-generated, read-only), Donor search (by DTN or name), Volume (mL) with inline warning if outside 30–240 mL or daily total exceeds 800 mL, Collection Date, Collection Mode (FC / PU), Age of Baby (AOB), Collected By
  - Label preview panel on the right: shows the unpasteurized label template populated with entered values (DTN, Volume, AOB, Mode, Date, Expiry)

### 5. Laboratory Testing
- Two-tab view: Pre-Pasteurization Tests | Post-Pasteurization Tests
- Each tab: table with Batch Number, CTN, DTN, Sample Volume, Date Sent, Expected Result Date, Days Elapsed (highlight overdue in amber), Result (PASS / FAIL badge), Tested By
- Pending results banner at top: count of batches awaiting results
- "Log Result" form: batch selector (status-gated — only shows eligible batches), test type, result toggle (PASS / FAIL), result date, tested by
- If FAIL selected: show a confirmation modal — "This will mark the batch as DISCARDED. This action cannot be undone."

### 6. Pasteurization
- Pasteurization log table: Batch Number, Operator, Temperature (°C), Duration (min), Date, Linked Post-Test Status
- "Log Pasteurization" form: batch selector (only PRE_TEST_PASSED batches shown), operator dropdown, temperature field (placeholder: 62.5°C), duration field (placeholder: 30 min), date
- Status gate notice: "Only batches that have passed pre-pasteurization testing are shown."

### 7. Inventory
- Read-only status board: large status cards for each stage (RAW, PRE_TESTING, PRE_TEST_PASSED, PASTEURIZED, POST_TESTING, READY, DISPENSED, DISCARDED) showing batch count and total volume (mL)
- Below: filterable batch list table with all fields visible
- Filter controls: program type, date range, batch number, status
- No add/edit buttons — include a notice: "Inventory is automatically updated by batch status transitions."

### 8. Recipient Management
- Searchable table: Guardian Name, Baby Name, Hospital, NICU Status (badge: NICU / Non-NICU — NICU in a distinct highlight color), Contact Number, AOB, Actions
- "Add Recipient" form: guardian name, baby name, hospital, NICU status toggle, contact number, AOB
- NICU status is visually prominent throughout — use a colored pill/badge

### 9. Inquiry & Waiting List
- Two-tab view: Active Inquiries | Waiting List
- Inquiry intake form: Inquiry Type (Walk-in / Hotline Call), Recipient search/link, NICU confirmation checkbox (required — show a hard gate message if unchecked: "Only NICU babies are eligible for milk from this bank."), Notes
- Waiting list table: Recipient, Baby Name, NICU badge, Inquiry Date, Days Waiting, Status badge (WAITING / NOTIFIED / FULFILLED / CANCELLED), Actions (Mark Notified, Mark Fulfilled, Cancel)
- WAITING rows with NICU badge should be visually prioritized (e.g., subtle row highlight)

### 10. SMS Notifications
- SMS log table: Recipient, Contact Number, Message Preview, Trigger Event, Date Sent, Status (Sent / Failed / Pending)
- Message template editor (Admin only): editable text area per template type (Milk Available, Dispensing Confirmation, Status Update)
- Failed SMS entries show a "Retry" action button

### 11. Dispensing
- Multi-step form wizard (5 steps shown as a progress bar at top):
  1. Find Recipient — search field
  2. Verify Requirements — NICU status confirmed, requirements checklist (show check/cross per item)
  3. Select Batch — shows only READY batches with available volume
  4. Fee Summary — Volume (mL) input, Fee per mL (₱2.00, read-only), Total Fee auto-calculated, Deposit Paid field
  5. Confirm & Dispense — summary of all above, Dispensed By (logged-in user, read-only), Date (today, read-only), Confirm button
- Dispensing log table below: Recipient, Baby Name, Batch Number, DTN, Volume (mL), Total Fee, Dispensed By, Date

### 12. Reports
- Report type selector: Daily / Weekly / Monthly / Annual
- Date range picker
- Preview panel: summary statistics (collections count, volume collected, pasteurized, dispensed, discarded, donor count, recipient count, discard rate)
- Collection Unit Ledger section: table broken down by program (In-House, Mom's Act, Milky Way, Supsup Todo) with columns for Raw Volume, QA Failure Adjustments, Net to Pasteurization, Carryover Balance
- Export buttons: Download PDF, Download Excel

### 13. Audit Log (Admin only)
- Table: Timestamp, User, Role, Action, Module/Table Affected, Record ID, Change Summary (Old Value → New Value)
- Filter by user, date range, module
- Read-only — no actions

---

## NAVIGATION STRUCTURE

Left sidebar with grouped sections:

- Overview: Dashboard
- Donors: Donor Management
- Milk Lifecycle: Collection → Lab Testing → Pasteurization → Inventory
- Recipients: Recipient Management, Inquiry & Waiting List
- Operations: Dispensing, SMS Notifications
- Reports: Reports
- Admin: Audit Log, User Management (Admin only — grayed for other roles)

Show active state on sidebar items. Collapse groups on mobile.

---

## DESIGN SYSTEM NOTES

- Status badges must be consistent across all screens:
  - RAW: gray
  - PRE_TESTING / POST_TESTING: amber/yellow
  - PRE_TEST_PASSED / PASTEURIZED: blue
  - READY: green
  - DISPENSED: teal
  - PRE_TEST_FAILED / POST_TEST_FAILED / DISCARDED: red
  - WAITING: orange
  - NOTIFIED: blue
  - FULFILLED: green
  - CANCELLED: gray
- All tables must have: column headers, row hover state, pagination controls, and a search/filter bar
- All forms must have: field labels above inputs, placeholder text, required field indicators (*), and a clear Cancel / Save button pair
- Gate/blocked states (e.g., non-NICU inquiry block, wrong batch status) must use a visible banner or disabled state — never silently fail
- Every data field should be named exactly as it will appear in the database (e.g., label "DTN" not "Donor ID", "Volume (mL)" not "Amount")