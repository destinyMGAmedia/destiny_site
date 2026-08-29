# Site Content Admin — Spec

## Overview
Expand the "Global Leaders" admin tab into a full "Site Content" management hub covering the entire About page and Home page static content. Add a new `SITE_CONTENT_ADMIN` role — the global equivalent of `APP_ADMIN` — so GLOBAL_ADMIN can delegate site content editing to another person with fewer privileges.

---

## Phase 1: Schema + Auth

**Scope:**
- `prisma/schema.prisma` — add `SITE_CONTENT_ADMIN` to Role enum; add `SiteContent` model
- `src/lib/auth.js` — add `isSiteContentAdmin`, `canManageSiteContent` helpers; update `getAdminLandingRoute`

**SiteContent model:**
```prisma
model SiteContent {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
```

**Keys to seed (via `npm run db:seed` or separate script — NOT auto-seeded in schema):**
about_hero_title, about_hero_tagline, about_vision_title, about_vision_body, about_mission_title, about_mission_body, about_history_body, about_declaration, about_anthem, home_founder_name, home_founder_title, home_founder_bio, home_founder_photo, home_founder_name2, home_founder_title2, home_founder_bio2, home_founder_photo2

**Auth helpers:**
- `isSiteContentAdmin(s)` → `s?.user?.role === 'SITE_CONTENT_ADMIN'`
- `canManageSiteContent(s)` → SITE_CONTENT_ADMIN || GLOBAL_ADMIN || SUPER_ADMIN
- `getAdminLandingRoute` → SITE_CONTENT_ADMIN → `/admin/site-content`
- `isAnyAdmin` → include SITE_CONTENT_ADMIN

**Acceptance:** `npx prisma generate` succeeds; no TypeScript errors.

---

## Phase 2: API Routes

**Scope:**
- New: `src/app/api/admin/site-content/route.js` — GET (all keys as map) + PATCH (batch update)
- Update: `src/app/api/admin/global-leaders/route.js` + `[id]/route.js` — allow SITE_CONTENT_ADMIN

**GET /api/admin/site-content** — returns `{ [key]: value }` map of all rows
**PATCH /api/admin/site-content** — accepts `{ updates: { [key]: value } }`, upserts each key

**Auth guard:** `canManageSiteContent(session)` on all site-content endpoints; `canManageSiteContent` on global-leaders endpoints too.

**Acceptance:** Curl GET returns `{}` or content map. PATCH with one key upserts correctly.

---

## Phase 3: New Admin Page — Site Content Hub

**Scope:**
- New: `src/app/admin/(protected)/site-content/page.jsx`
- Keep: `src/app/admin/(protected)/global-leaders/page.jsx` (unchanged, reachable from About tab link)

**Page structure:** Client component with two tabs — "About Page" and "Home Page"

**About Page tab sections** (each is a collapsible/expandable editor card):
1. **Hero** — hero_title (text input), hero_tagline (text input)
2. **Vision & Mission** — mission_title, mission_body, vision_title, vision_body (text inputs + textareas)
3. **History** — history_body (textarea, multi-paragraph)
4. **Declaration** — declaration (textarea)
5. **Anthem** — anthem (textarea)
6. **Leadership** — "Edit Leaders →" link/button that takes to `/admin/global-leaders`

**Home Page tab sections:**
1. **Founder 1 (Primate)** — name, title, bio (textarea), photo (ImageUploader), quote (textarea)
2. **Founder 2 (Presbyter)** — name, title, bio, photo (ImageUploader), tagline

Each section has its own Save button that calls PATCH /api/admin/site-content with only that section's keys.

**Toast** for success/error (same pattern as global-leaders page).

**Acceptance:** Page loads with tabs, displays current DB values, saves and shows toast.

---

## Phase 4: Make Public Pages Dynamic

**Scope:**
- `src/app/(public)/about/page.jsx` — fetch SiteContent, fall back to hardcoded defaults
- `src/components/home/FounderSection.jsx` — accept `founders` prop instead of hardcoded content
- `src/app/(public)/page.jsx` — fetch founder SiteContent keys, pass to FounderSection

**About page:** `prisma.siteContent.findMany({ where: { key: { startsWith: 'about_' } } })` → build a map → use values with fallback to existing hardcoded strings. Keep `force-dynamic`.

**FounderSection:** Convert to accept `founder1` and `founder2` props (name, title, bio, photo, quote/tagline). Fall back to the current hardcoded strings if props are empty/missing so the page never breaks.

**Home page:** Fetch `home_founder_*` keys from SiteContent (wrapped in try/catch). Pass parsed values as props to FounderSection. Keep existing parallel fetches.

**Acceptance:** Public about page and home page render correctly even when SiteContent table is empty (fallback values shown).

---

## Phase 5: Sidebar, Layout, Admin Management

**Scope:**
- `src/components/admin/AdminSidebar.jsx`
- `src/app/admin/(protected)/layout.jsx`
- `src/app/admin/(protected)/admins/page.jsx`

**Sidebar changes:**
- SUPER_ADMIN / GLOBAL_ADMIN: rename "Global Leaders" nav item → "Site Content" with href `/admin/site-content`; keep all other items unchanged
- Add SITE_CONTENT_ADMIN nav section with: Site Content → `/admin/site-content`, Royal Feed → `/admin/devotionals`, Events → `/admin/events`, Hero Slides → `/admin/hero-slides`, Channels → `/admin/channels`; Account → Settings (no assembly-specific settings needed, just a placeholder `/admin/dashboard`)

**Layout changes:**
- Add SITE_CONTENT_ADMIN to `isAdmin` array (so it gets the sidebar layout)
- Update `isAtDashboard` check: for SITE_CONTENT_ADMIN, dashboard = `/admin/site-content`
- Header title: `role?.replace(/_/g, ' ')` already handles it generically

**Admins page changes:**
- Add `SITE_CONTENT_ADMIN` to `ROLE_LABELS` map with appropriate color
- Filter available roles for new admin creation: show SITE_CONTENT_ADMIN as an option in the create form (note: the current admins page only does credential regeneration — if there's a create form elsewhere, update that too; otherwise just add the display label)

**Acceptance:** SITE_CONTENT_ADMIN logs in, sees sidebar with Site Content section only, lands on `/admin/site-content`. GLOBAL_ADMIN sees "Site Content" in place of "Global Leaders".
