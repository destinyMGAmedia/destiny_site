# Weekly Assembly Reporting System — Spec (Revised)

## Overview

Digitize the Church Weekly Report Template. The existing assembly dashboard already has "Finance" and "Reports" cards (links to unbuilt pages). This feature builds those two pages, with a new `WeeklyReport` model as the data backbone.

Key integrations:
- **Ark Centers** already record service data via `ServiceData` (with `arkCenterId`). The weekly report pulls these records for the reporting week to pre-populate Ark Center attendance/income, avoiding double-entry.
- **Finance page** (`/admin/assemblies/[slug]/finance`) shows financial summaries drawn from both `ServiceData` (raw records) and `WeeklyReport` (structured reports).
- **Reports page** (`/admin/assemblies/[slug]/reports`) is the primary landing for weekly reports.

---

## Phase 1: Database Schema

**New model: `WeeklyReport`**

Store complex nested data as JSON fields.

```prisma
model WeeklyReport {
  id               String             @id @default(cuid())
  assemblyId       String
  weekStart        DateTime           // Monday of the reporting week
  weekEnd          DateTime           // Sunday of the reporting week
  status           WeeklyReportStatus @default(DRAFT)

  // Section 1 — Administrative
  branchPastor         String?
  administrator        String?
  thursdayAttendance   Json @default("{}")
  // Shape: { main: { adults:{m,f}, youth:{m,f}, children:{m,f}, firstTimers:{m,f}, newConverts:{m,f}, workers:{m,f} },
  //          arkCenters: [{ arkCenterId, name, attendance }] }
  sundayAttendance     Json @default("{}")
  // Shape: { adults:{m,f}, youth:{m,f}, children:{m,f}, firstTimers:{m,f}, newConverts:{m,f}, workers:{m,f} }
  followUp             Json @default("{}")
  // Shape: { firstTimersContacted, firstTimersRetained, newConvertsInDiscipleship,
  //          baptisms, newWorkers, membersFollowedUp, visitations }
  majorActivities      String?
  leadershipMeetings   String?
  challenges           String?
  hqSupport            String?

  // Section 2 — Financial
  financeOfficer       String?
  thursdayIncome       Json @default("{}")
  // Shape: { main: { tithe, offering, specialSeed, welfare, partnership, otherIncome },
  //          arkCenters: [{ arkCenterId, name, offering }] }
  sundayIncome         Json @default("{}")
  // Shape: { tithe, offering, specialSeed, welfare, partnership, otherIncome }
  expenses             Json @default("[]")
  // Shape: [{ category, amount, approvedBy }]
  amountBanked         Float?
  dateBanked           DateTime?
  proofOfPayment       Boolean  @default(false)
  proofUrl             String?

  submittedAt          DateTime?
  submittedById        String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  assembly             Assembly @relation(fields: [assemblyId], references: [id], onDelete: Cascade)

  @@unique([assemblyId, weekStart])
}

enum WeeklyReportStatus {
  DRAFT
  SUBMITTED
}
```

Add `weeklyReports WeeklyReport[]` to the `Assembly` model.

**Migration:** `npm run db:push` (non-destructive add), then `npx prisma generate`.

---

## Phase 2: API Routes

### Assembly-scoped (ASSEMBLY_ADMIN)

**`GET /api/admin/assemblies/[slug]/weekly-reports`**
- Auth: `canManageAssembly`
- Query: `weekStart`, `status`
- Returns list + prefetched Ark Center names for the assembly
- Also returns current-week Ark Center `ServiceData` for pre-population

**`POST /api/admin/assemblies/[slug]/weekly-reports`**
- Auth: `canManageAssembly`
- Validates unique `assemblyId + weekStart` (duplicate → 409)
- Returns created report

**`GET /api/admin/assemblies/[slug]/weekly-reports/[id]`**
- Auth: `canManageAssembly`

**`PUT /api/admin/assemblies/[slug]/weekly-reports/[id]`**
- Auth: `canManageAssembly`
- If `status=SUBMITTED`: sets `submittedAt`, `submittedById`; blocks further edits

**`GET /api/admin/assemblies/[slug]/ark-center-service-data`**
- Auth: `canManageAssembly`
- Query: `weekStart`, `weekEnd`
- Returns `ServiceData` records with `arkCenterId != null` for the given date range
- Used to pre-fill Ark Center rows in the weekly report form

### Global admin

**`GET /api/admin/weekly-reports`**
- Auth: `isGlobalAdmin`
- Query: `weekStart`, `assemblyId`, `status`
- Returns reports joined with assembly name
- Also returns all assemblies list for the submission-status grid (not-yet-submitted assemblies show as ❌)

---

## Phase 3: Reports Page — Assembly Admin

**`/admin/assemblies/[slug]/reports/page.jsx`** (server component)

Replaces the placeholder "Monthly & annu..." link from the dashboard card.

Layout:
1. **Current week submission banner** — big ✅ Submitted / ⚠️ Draft / ❌ Not submitted for the current week. If not submitted, prominent "Submit This Week's Report" button.
2. **Past reports list** — table: Week range, Status badge (DRAFT/SUBMITTED), Submitted date, Actions (View / Edit if draft).

**`/admin/assemblies/[slug]/reports/new/page.jsx`** — new weekly report  
**`/admin/assemblies/[slug]/reports/[id]/page.jsx`** — view (submitted) or edit (draft)

These load the `WeeklyReportForm` client component.

### WeeklyReportForm

Two-tab form (state persists on tab switch — single React form with all fields):

**Tab 1 — Administrative Report**

*Basic Info:*
- Branch Name — read-only (from session/assembly)
- Reporting Week — Mon–Sun date range picker (defaults to current week)
- Branch Pastor — text input
- Administrator — text input

*Thursday Service Attendance — Main Assembly:*
6-row grid (Adults, Youth, Children, First Timers, New Converts, Workers) × 3 columns (Male, Female, Total auto-calc). TOTAL row sums all categories.

*Thursday Service — Ark Centers:*
Collapsible sub-table. One row per active Ark Center (name read-only, attendance number input). Pre-filled from `ServiceData` records for the week if they exist. Combined total shown.

*Sunday Service Attendance:*
Same 6-row grid as Thursday main (Ark Centers don't meet on Sundays, so this section is main assembly only).

*Follow-up & Membership Development:*
7 number inputs: First Timers Contacted, First Timers Retained, New Converts in Discipleship, Baptisms Conducted, New Workers Added, Members Followed Up, Visitations Conducted.

*Administrative Notes:*
4 textareas: Major Activities, Leadership Meetings Held, Challenges Encountered, HQ Support Needed.

**Tab 2 — Financial Report**

*Basic Info:*
- Branch Name — read-only
- Reporting Week — synced from Tab 1 (read-only here)
- Finance Officer — text input

*Thursday Income — Main Assembly:*
6-row table: Tithe, Offering, Special Seed, Welfare, Partnership, Other Income. TOTAL auto-calc.

*Thursday Income — Ark Centers:*
Collapsible table. One row per active Ark Center — Offering field (pre-filled from `ServiceData.offering` for the week). Combined total shown.

*Sunday Income:*
Same 6-row table as Thursday main.

*Weekly Expenses:*
Dynamic rows (add/remove). Each row: Expense Category (dropdown: Welfare, Logistics, Media, Utilities, Evangelism, Maintenance, Other) + Amount + Approved By. TOTAL auto-calc.

*Financial Summary (read-only, auto-computed):*
- Total Income = Thursday Main + Thursday Ark + Sunday
- Total Expenses
- Net Balance = Total Income − Total Expenses

*Banking Details:*
Amount Banked, Date Banked, Proof of Payment (Yes/No toggle + optional URL field).

**Actions:**
- "Save Draft" — saves with DRAFT status, stays on form
- "Submit Report" — saves with SUBMITTED status, shows success confirmation
- Submitted reports render read-only (all inputs disabled, actions hidden)

**Validation:** Required fields (branch pastor, administrator, finance officer), no negative numbers, numbers-only on financial fields. Week picker blocks future weeks.

---

## Phase 4: Finance Page — Assembly Admin

**`/admin/assemblies/[slug]/finance/page.jsx`** (server component)

Currently the "Finance" dashboard card links to this unbuilt page. This page gives a financial overview — it complements the weekly reports.

Sections:
1. **This Month Summary** — pull from `WeeklyReport` records for current month: Total Tithes, Total Offerings, Total Expenses, Net Balance. Shown as stat cards.
2. **Weekly Breakdown Table** — one row per submitted weekly report this month: week range, Thursday income, Sunday income, Ark Center income, Expenses, Net. Click row → view that week's full report.
3. **Raw Service Records** — existing `ServiceDataManager` component (already built), showing raw per-service records including Ark Centers. Labelled "Individual Service Records" to distinguish from the aggregated weekly reports.
4. **Giving Details** — link to the existing giving details editor.

This page requires no new API routes — it reads from existing `weekly-reports` and `service-data` endpoints.

---

## Phase 5: Global Admin — Reports Dashboard

**`/admin/reports/page.jsx`** (server component + client filter)

Add to GLOBAL_ADMIN/SUPER_ADMIN sidebar under a new "Reporting" section.

Sections:
1. **Week Selector** — defaults to current week; changes trigger client-side re-fetch
2. **Submission Status Grid** — card per assembly: name, ✅ Submitted / ⚠️ Draft / ❌ Not Submitted. Clicking a submitted card navigates to that report.
3. **Summary Stats** — Total Combined Income this week, Total Sunday Attendance, # Submitted / # Total.
4. **All Reports Table** — filterable by assembly and week; columns: Assembly, Week, Status, Total Income, Sunday Attendance, Submitted At.

**`/admin/reports/[id]/page.jsx`** — read-only view of any assembly's weekly report (both sections rendered, print-friendly).

---

## Phase 6: Navigation & Sidebar

- **AdminSidebar (GLOBAL_ADMIN/SUPER_ADMIN):** Add nav section "Reporting" with item "Weekly Reports" → `/admin/reports` using `ClipboardList` icon.
- **AdminSidebar (ASSEMBLY_ADMIN):** "Reports" link (`${assemblyBase}/reports`) already exists — no change needed. "Finance" link also already exists — no change needed.
- **Assembly dashboard card:** Update "Reports" card description from "Monthly & annu..." to "Weekly reports & submissions".

---

## Acceptance Criteria

- ASSEMBLY_ADMIN: one report per week; duplicate week blocked with 409 + user-friendly error
- Ark Center service data auto-pre-fills attendance and income in the weekly report form (editable override allowed)
- All totals auto-calculate in real time without page reload
- Tab switch preserves all form data
- Submitted report is read-only; drafts can be edited
- Global admin sees submission grid for any selected week across all assemblies
- Finance page shows month-to-date summary from submitted weekly reports
- Mobile-friendly: single-column layout, numeric keyboard on financial inputs (`inputMode="decimal"`)
