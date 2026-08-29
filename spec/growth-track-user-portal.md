# Growth Track User Portal — Spec
> Conventions: see CLAUDE.md

## Overview

Three distinct areas of work:
1. **Join page pre-check** — `/[slug]/join` already has registration forms for first-timers and members. Add a phone/email lookup step at the start so duplicates are caught before the form is shown, and existing records get the right response.
2. **Growth track portal** — entirely missing user-facing pages for viewing lessons and taking assessments.
3. **Admin member management** — missing admin tools for converting first-timers to members and activating members to the next training level.

**Core promotion rule (non-negotiable):** Promotion between training levels is NEVER automatic. Passing an assessment marks the current level COMPLETED but does NOT change the member's `growthLevel`. Only the admin can activate the next level by explicitly changing `growthLevel`. Until activated, the member sees only their current level content and badges.

---

## What Is Already Implemented (do not re-implement)

| Feature | Location |
|---------|----------|
| DB schema: Member, FirstTimer, GrowthStage, GrowthContent, GrowthQuestion, MemberProgress | `prisma/schema.prisma` |
| Assembly join/register forms (visitor + member) | `src/app/(public)/[slug]/join/page.jsx` |
| Member lookup portal (phone/email → status) | `src/app/(public)/member/register/page.jsx` |
| Registration success page | `src/app/(public)/member/success/page.jsx` |
| Member lookup API | `src/app/api/member/lookup/route.js` |
| Assembly registration API | `src/app/api/assemblies/[slug]/register/route.js` |
| Admin: growth-track content manager | `/admin/growth-track` |
| Admin: first-timers list + follow-up actions | `/admin/first-timers` |
| Admin: global members list + growthLevel dropdown | `/admin/members` |
| Admin: assembly members CRUD + promote | `/admin/assemblies/[slug]/members` |
| Admin member PATCH (growthLevel activation) | `src/app/api/admin/members/[id]/route.js` |
| Admin first-timer PATCH | `src/app/api/admin/first-timers/[id]/route.js` |

---

## Schema Fix (Required Before Everything Else)

`MemberProgress` is missing lesson-tracking. The lookup API references `completedLessons` which does not exist in the schema — causing silent undefined reads.

**Change:** Add `completedContents Json @default("[]")` to `MemberProgress` model in `prisma/schema.prisma`. This stores an array of completed `GrowthContent` IDs for that stage.

Run after: `npm run db:push && npx prisma generate`

---

## Phase 1: Join Page Pre-Check (`/[slug]/join`)

**File to modify:** `src/app/(public)/[slug]/join/page.jsx`

**Current behaviour:** Presents a VISITOR / MEMBER choice card, then shows the full form immediately. Duplicates are only caught at submission time (API returns 409), giving a poor UX.

**New flow:**
1. User chooses VISITOR or MEMBER (existing card UI — keep as-is)
2. **New step added:** A "quick check" screen with two fields — phone and email. Label: "Enter your phone and/or email so we can check if you're already registered." Either field is sufficient; both is better. A "Check" button calls `POST /api/member/lookup` with `{ phone, email }` (both optional, at least one required).
3. Results:
   - **Found as MEMBER** → show their name, current growth level, and a message: "You're already registered as a member. Visit your Member Portal to access your growth track." with a link to `/member/register`. No form shown.
   - **Found as FIRST_TIMER (not yet member)** → if choosing MEMBER: pre-fill the full form with their existing data and show: "We found your visitor record. Complete the form below to become a member." If choosing VISITOR: show: "You've already registered as a visitor. We'll continue following up with you." No form.
   - **Not found** → show the full registration form as it currently exists, with phone/email fields pre-filled from what they just entered.
4. First-timer → member conversion via this form: when the API creates the Member record and an existing FirstTimer matched by phone/email, the FirstTimer record is marked `convertedToMember: true` and `memberId` is linked. The FirstTimer record is **kept** (not deleted) for history; it will no longer appear in the admin's pending follow-up list because `convertedToMember = true`.

**API change:** `POST /api/member/lookup` — update to accept `{ phone?, email?, identifier? }`. Use `identifier` as fallback for backward compat (the `/member/register` page sends this format). When `phone` or `email` provided directly, query with `OR [{ phone }, { email }]` filtering out null values.

**Acceptance criteria:**
- Selecting VISITOR or MEMBER shows the phone/email check screen before the form
- Existing member found → no form rendered, portal link shown
- Existing first-timer choosing MEMBER → form pre-filled with their data
- New user → form shown with phone/email pre-filled
- Both phone and email fields accept partial input (one is enough to check)

---

## Phase 2: Growth Track Portal

**Files:**
- `src/app/(public)/growth-track/page.jsx`
- `src/app/api/growth-track/stages/route.js`

**Entry point:** Member identifies via phone/email (same two-field lookup). `memberId` stored in `sessionStorage` after successful identification.

**Behaviour after identification:**
- Fetches `GET /api/growth-track/stages?memberId=...`
- Renders all 7 training levels as vertical stage cards in order (FOUNDATIONAL_CLASS → ADVANCED_LEADERSHIP_3)
- **NEW_COMER state** (no training activated yet): shows a message above the cards — "Your training will begin once your coordinator assigns your first level. Check back soon." All stage cards are locked.
- Each card shows:
  - Stage title + description
  - **Locked** (level > member's `growthLevel`): grey card, lock icon
  - **Completed** (`MemberProgress.status === COMPLETED`): green border, checkmark, score and completion date
  - **Active + in progress** (current `growthLevel`, MemberProgress exists with completions > 0): purple border, progress bar (completed lessons / total), "Continue" button → `/growth-track/[stage-slug]`
  - **Active + not yet started** (current `growthLevel`, MemberProgress with 0 completions OR no MemberProgress yet): gold border, prominent "Begin [Stage Title] Training" button → `/growth-track/[stage-slug]`

**New API:** `GET /api/growth-track/stages?memberId=...`
- Returns all `GrowthStage` records ordered by `level`, each including:
  - `contents`: array of `{ id, title, type, order }`
  - `questionsCount`: number of questions
  - `memberProgress`: the member's `MemberProgress` record for this stage (null if none), including the `completedContents` JSON array
- Computes and returns `isLocked`, `isActive`, `isCompleted`, `isPendingStart` booleans per stage based on member's `growthLevel`

**Acceptance criteria:**
- Unauthenticated (no memberId) → shows phone/email prompt, not a crash
- NEW_COMER → all locked + awaiting message
- Completed stages show score + date
- Active stage with no starts shows "Begin Training" button
- Active stage in progress shows progress bar + "Continue"
- Future locked stages are greyed and unclickable

---

## Phase 3: Stage Content Viewer

**Files:**
- `src/app/(public)/growth-track/[stage]/page.jsx`
- `src/app/api/member-progress/lesson/route.js`

**Stage slug:** lowercase GrowthLevel enum, e.g. `foundational_class`, `destiny_culture`.

**Behaviour:**
- Reads `memberId` from `sessionStorage`. If absent → redirect to `/growth-track`.
- If stage level > member's `growthLevel` → redirect to `/growth-track` (not yet activated).
- On first visit: if no `MemberProgress` for this stage, auto-creates one via `POST /api/member-progress/lesson` with `{ memberId, stageId, action: 'enroll' }`.
- Fetches stage content via the stages API. Renders `GrowthContent` items in order:
  - `VIDEO` — extract YouTube video ID from URL, render `<iframe>` embed
  - `TEXT` — render `content.body` as HTML (`dangerouslySetInnerHTML`; admin-controlled content)
  - `PDF` — download `<a>` link + `<embed>` for inline preview
- Each content item: "Mark Complete" button. Items whose ID is in `completedContents` array show a checkmark and are visually marked done (button disabled).
- On "Mark Complete" click → `POST /api/member-progress/lesson` with `{ memberId, stageId, contentId }`. Updates `completedContents`.
- When all content marked complete → show "All lessons complete! Take your assessment" button → `/growth-track/[stage]/assessment`.

**New API:** `POST /api/member-progress/lesson`
- `{ memberId, stageId, action: 'enroll' }` → upsert MemberProgress with `status: ENROLLED` if not exists, return it
- `{ memberId, stageId, contentId }` → add `contentId` to `completedContents` JSON array (no duplicates), return updated MemberProgress
- No admin auth; memberId is the identity token

**Acceptance criteria:**
- Locked stage visit → redirect to `/growth-track`
- VIDEO/TEXT/PDF render for their respective types
- Completed lesson IDs persist across refresh
- "Take Assessment" only shown after all content complete
- Re-visit to partial stage resumes from correct state

---

## Phase 4: Assessment Interface

**Files:**
- `src/app/(public)/growth-track/[stage]/assessment/page.jsx`
- `src/app/api/member-progress/assessment/route.js`

**Guards:**
- Not all lessons complete (`completedContents.length < contents.length`) → redirect to stage page
- `MemberProgress.status === COMPLETED` (already passed) → show read-only results screen (score, date, badge); no retake

**Behaviour:**
- Fetches `GrowthQuestion` records for the stage
- Renders questions:
  - `MULTIPLE_CHOICE` → radio buttons, options from `question.options` JSON array
  - `TEXT_SUMMARY` → textarea
- Submit → `POST /api/member-progress/assessment`
- **Pass (≥70% of MULTIPLE_CHOICE questions correct):**
  - MemberProgress: `status = COMPLETED`, `testScore = score%`, `completedAt = now()`, `badgeEarned = true`
  - `Member.growthLevel` is **NOT changed** — admin must activate next level
  - Show: "Congratulations! You passed with [X]%. Your result has been recorded. Your coordinator will activate your next training level when ready."
- **Fail (<70%):**
  - MemberProgress `testScore` updated, `status` stays `ENROLLED`
  - Show: "You scored [X]%. Pass mark is 70%. Review the lessons and try again." Retry button resets the form.
- **No MULTIPLE_CHOICE questions (TEXT_SUMMARY only):** auto-mark as submitted, `status = COMPLETED`, message: "Your answers have been submitted for review."

**New API:** `POST /api/member-progress/assessment`
- Input: `{ memberId, stageId, answers: [{ questionId, answer }] }`
- Fetches questions, grades MULTIPLE_CHOICE vs `correctAnswer`, stores TEXT_SUMMARY answers in `MemberProgress` (add `assessmentAnswers Json?` to schema if needed, or skip storing TEXT_SUMMARY for now)
- Returns: `{ passed, score, total }`
- Does NOT touch `Member.growthLevel`

**Acceptance criteria:**
- Lessons not complete → redirect to stage page
- Already passed → read-only results, no form
- MULTIPLE_CHOICE auto-grades correctly
- Pass does NOT change growthLevel
- Fail allows retry
- Score persists across refresh

---

## Phase 5: Admin Member Conversion Page

**Files:**
- `src/app/admin/(protected)/members/new/page.jsx`
- `src/app/api/admin/members/route.js` (POST)

**Context:** `FirstTimerManager.jsx` "Convert to Member" button links to `/admin/members/new?firstName=...&lastName=...&email=...&phone=...&firstTimerId=...`. This currently 404s.

**Behaviour:**
- Protected admin page — redirect `/admin/login` if no session
- Reads URL search params: pre-fills firstName, lastName, email, phone
- Full member form: gender (required), dateOfBirth, fellowship, department, arkCenter (from assembly's centers), growthLevel (default `NEW_COMER`), notes
- Assembly selector for SUPER_ADMIN/GLOBAL_ADMIN; locked to session assembly for ASSEMBLY_ADMIN
- Submit → `POST /api/admin/members`
- On success → redirect to `/admin/members`

**New API:** `POST /api/admin/members`
- Requires admin session (`canManageAssembly` or `isGlobalAdmin`)
- Creates `Member` with all provided fields
- If `firstTimerId` in body: sets `FirstTimer.convertedToMember = true`, `FirstTimer.memberId = newMember.id` (record kept, not deleted)
- Returns created member

**Acceptance criteria:**
- "Convert to Member" in FirstTimerManager opens pre-filled form correctly
- Submission creates member + marks first-timer converted
- Converted first-timer no longer appears in "Pending" filter in FirstTimerManager
- Non-admin session → 403

---

## Training Structure Alignment (training.txt)

| DB GrowthLevel | training.txt | How admin activates |
|----------------|-------------|---------------------|
| NEW_COMER | Entry state (no class) | Default on all new member registrations |
| FOUNDATIONAL_CLASS | Level 1 | Admin sets `growthLevel = FOUNDATIONAL_CLASS` via member manager |
| DESTINY_CULTURE | Level 2 (12 named topics) | Admin sets `growthLevel = DESTINY_CULTURE` |
| MINISTRY_CLASS | Level 3 | Admin sets `growthLevel = MINISTRY_CLASS` |
| LEADERSHIP_CLASS | Level 4 | Admin sets `growthLevel = LEADERSHIP_CLASS` |
| PASTORAL_CLASS | Level 5 | Admin sets `growthLevel = PASTORAL_CLASS` |
| ADVANCED_LEADERSHIP_2 | Level 6 | Admin sets `growthLevel = ADVANCED_LEADERSHIP_2` |
| ADVANCED_LEADERSHIP_3 | Level 7 | Admin sets `growthLevel = ADVANCED_LEADERSHIP_3` |

Admin activation uses the existing `PATCH /api/admin/members/[id]` with `{ growthLevel: 'NEXT_LEVEL' }`. The API already creates a `MemberProgress` record with `status: ENROLLED` when growthLevel changes. No new activation API needed.

The 12 Destiny Culture topics are content the admin loads via `/admin/growth-track`. The portal renders whatever is stored — no hardcoding.

---

## Summary of Changes

### New files
| File | Purpose |
|------|---------|
| `src/app/(public)/growth-track/page.jsx` | Stage overview — lock/unlock map, "Begin Training" CTA |
| `src/app/(public)/growth-track/[stage]/page.jsx` | Lesson viewer + per-content completion tracking |
| `src/app/(public)/growth-track/[stage]/assessment/page.jsx` | Quiz, auto-grade, pass/fail with no auto-promotion |
| `src/app/api/growth-track/stages/route.js` | GET all stages + member's progress state |
| `src/app/api/member-progress/lesson/route.js` | Enroll + mark individual lesson complete |
| `src/app/api/member-progress/assessment/route.js` | Submit + grade assessment (no growthLevel change) |
| `src/app/admin/(protected)/members/new/page.jsx` | Admin first-timer → member conversion form |
| `src/app/api/admin/members/route.js` | POST create member + optionally link first-timer |

### Files to modify
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `completedContents Json @default("[]")` to `MemberProgress` |
| `src/app/(public)/[slug]/join/page.jsx` | Add phone/email pre-check step before showing form |
| `src/app/api/member/lookup/route.js` | Accept `{ phone?, email? }` alongside existing `{ identifier }` |
| `src/app/(public)/member/success/page.jsx` | Fix messaging — remove false auto-enrollment claim |
