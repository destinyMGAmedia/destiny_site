# Global Leaders Management + Assemblies Fix — Spec

## Overview
The About page currently hardcodes 3 global officers (Primate, Presbyter, Global Administrator). This feature makes them fully DB-driven so a global admin can add, edit, reorder, and delete global leaders along with their photos at any time. Assembly leaders (pastors/team members) remain under assembly-scoped admin control as before. Two quick fixes are also included: rename "Our Pastors" → "Our Leaders" everywhere, and create the missing All Assemblies admin page (currently 404).

---

## Phase 1: Database Schema — GlobalLeader model
- **Scope:** `prisma/schema.prisma` only
- Add `GlobalLeader` model with: `id`, `name`, `title` (designation), `bio`, `photo`, `displayOrder`, `isActive`, `createdAt`, `updatedAt`
- Run `npm run db:push` (non-destructive — adds table, no data loss)
- Run `npx prisma generate`
- **Acceptance:** `prisma generate` completes, model available in Prisma client

---

## Phase 2: API Routes — Global Leaders
- **Scope:** `src/app/api/admin/global-leaders/route.js`, `src/app/api/admin/global-leaders/[id]/route.js`, `src/app/api/global-leaders/route.js`
- Admin endpoints (global admin only via `isGlobalAdmin`):
  - `GET /api/admin/global-leaders` — list all, ordered by displayOrder
  - `POST /api/admin/global-leaders` — create leader (name, title required)
  - `PATCH /api/admin/global-leaders/[id]` — update any fields
  - `DELETE /api/admin/global-leaders/[id]` — remove leader
- Public endpoint (no auth):
  - `GET /api/global-leaders` — returns only `isActive: true` leaders, ordered by displayOrder
- **Acceptance:** all 5 routes respond with correct status codes

---

## Phase 3: Admin UI — Global Leaders Management Page
- **Scope:** `src/app/admin/(protected)/global-leaders/page.jsx`, update `AdminSidebar.jsx`
- Page accessible only to global admin roles
- Features:
  - Table listing all global leaders (photo thumb, name, title, order, active toggle)
  - Add/Edit modal with fields: Name, Title/Designation, Bio, Photo (Cloudinary upload), Display Order, Active
  - Delete with confirmation
  - Inline reorder via display order field
- Add "Global Leaders" link in admin sidebar under the global admin section
- **Acceptance:** CRUD operations work end-to-end; photos upload via existing Cloudinary helper

---

## Phase 4: Update About Page — Dynamic Leaders
- **Scope:** `src/app/(public)/about/page.jsx`
- Convert from Server Component fetching hardcoded array to fetching from `GET /api/global-leaders` (or direct Prisma query)
- Show leaders sorted by `displayOrder`; if DB returns 0 records, fall back to the existing hardcoded array so the page never goes blank
- **Acceptance:** About page renders leaders from DB; adding a new leader in admin is immediately reflected

---

## Phase 5: Rename + All Assemblies Fix
- **Scope:** `src/components/assembly/TeamSection.jsx`, `src/app/admin/(protected)/assemblies/page.jsx` (new)
- Rename every user-visible occurrence of "Our Pastors" → "Our Leaders" in `TeamSection.jsx`
- Create `src/app/admin/(protected)/assemblies/page.jsx`:
  - Server component, fetches all assemblies via Prisma
  - Renders a table: name, city/country, status (active/inactive), member count, link to manage
  - Same card/table style as the rest of the admin dashboard
- **Acceptance:** `/admin/assemblies` loads without 404; "Our Pastors" no longer appears in the assembly public pages
