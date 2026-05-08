# Edit Records & Assembly Admin Warning — Spec

## Overview

Add full-record edit modals to FirstTimerManager and MemberManager so both GLOBAL_ADMIN and ASSEMBLY_ADMIN can update any field on a record. Also add a styled confirmation popup on the member creation form that warns ASSEMBLY_ADMIN users they won't be able to delete the record themselves once it's submitted.

## Phase 1: Edit modal — FirstTimerManager

- File: `src/components/admin/FirstTimerManager.jsx`
- Add `editingFT` state (null or record) and `editForm` state (object of editable fields)
- "Edit" button in actions column, visible when `canEdit`; opens modal pre-filled with record data
- Editable fields: firstName, lastName, middleName, email, phone, address, howDidYouHear, notes, followedUp (checkbox), isConverted (checkbox), wantsFollowUp (checkbox)
- Submit: PATCH `/api/admin/first-timers/[id]` with changed fields
- On success: update local `firstTimers` state, close modal
- Acceptance: edit button appears for canEdit users, modal opens with correct data, save updates the row, cancel closes without changes

## Phase 2: Edit modal — MemberManager

- File: `src/components/admin/MemberManager.jsx`
- Same pattern: `editingMember` state + `editForm` state
- "Edit" button in actions column, visible when `canEdit`
- Editable fields: firstName, lastName, middleName, email, phone, address, city, state, gender (select), dateOfBirth, fellowship (select), department (select), status (select: ACTIVE/INACTIVE/TRANSFERRED), notes
- Submit: PATCH `/api/admin/members/[id]` with changed fields
- On success: update local `members` state (and `selectedMember` if open), close modal
- Acceptance: same as Phase 1

## Phase 3: Assembly admin delete warning on member creation form

- File: `src/app/admin/(protected)/members/new/page.jsx`
- Add `showWarning` boolean state, `pendingSubmit` boolean state
- Intercept the submit button: if `session.user.role === 'ASSEMBLY_ADMIN'` and not yet confirmed → set `showWarning = true`, stop
- Custom styled warning modal (not browser `confirm()`): "Once submitted, you will not be able to delete this record. Only a Global Admin can delete records. Do you want to continue?"
- "Cancel" closes modal, stays on form; "Yes, Submit" closes modal and runs the actual `handleSubmit` logic
- GLOBAL_ADMIN/SUPER_ADMIN skip the warning entirely — their submit goes straight through
- Acceptance: ASSEMBLY_ADMIN sees modal on click; GLOBAL_ADMIN does not; clicking "Yes, Submit" creates the record; clicking "Cancel" does not create
