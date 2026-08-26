# The Yellow Pages — Skills & Business Directory — Spec

## What

A public, unauthenticated directory of church members' skills and businesses, searchable by category and location/assembly, served on its own subdomain (`theyellowpages.destinymissionglobal.org`) using the same host-rewrite pattern as `nation.destinymissionglobal.org`. Anyone can browse, search, submit a listing, and rate a listing — no login anywhere on this surface. Built to scale to the general public later, so nothing in the core data model requires church membership.

## Context

- Subdomain precedent: `src/proxy.js` + `src/lib/nation/host.js` — `getNationBase(host)` returns `''` on the nation host (link-prefix-free) or `'/nation'` otherwise (rewrite target), with a `?__nation=1` dev override. Same shape reused here.
- Public registration precedent: `src/app/api/assemblies/[slug]/register/route.js` — unauthenticated POST, validates, checks duplicates by phone/email, returns 201/409/400/500 JSON.
- Existing models this connects to: `Assembly` (slug, name, city, country), `Member` (assemblyId, firstName, lastName, phone, email, city, state, country).
- Cloudinary precedent: `src/lib/cloudinary.js` — `generateUploadSignature()` / `getUploadFolder()` for signed client-side uploads.
- Admin role helpers: `src/lib/auth.js` (`isGlobalAdmin`, etc.) and `src/proxy.js`'s `ADMIN_AUTH_PATHS` role-gating block.
- Decisions already made with the user: listings **auto-publish immediately** (no approval queue); ratings require reviewer name + phone-or-email, one rating per (listing, contact); build ships as schema+API → directory/search UI → join-page integration → admin moderation, each independently reviewable.
- Unrelated in-flight WIP in the working tree (Paystack) is untouched by this work.

## Requirements

1. New subdomain `theyellowpages.destinymissionglobal.org` (env `YELLOWPAGES_HOST`, default that value) rewrites to `/yellowpages/*`, mirroring the nation pattern, with a `?__yellowpages=1` dev override.
2. Public pages: home/browse+search, category browse, search results, listing detail, add-a-listing form. No auth on any of them.
3. A listing represents a **person offering a skill** or a **business/organization** — one model, a `listingType` discriminator, since they share almost all fields (see Design).
4. Every listing has one category (industry/sector) and optional sub-sector/profession text, for filtering.
5. Location/assembly-aware: filter by assembly (dropdown of active assemblies) and/or free-text city/country. Assembly link is optional — a listing can exist with just city/country, so the directory works for non-members later.
6. Search: text query over name/description/services, combinable with category + location filters.
7. Any visitor can rate 1–5 stars + optional comment, giving name + (phone or email). One rating per (listing, contact-hash). First name/initial shown publicly, never the full contact.
8. Listings auto-publish on submit. Existing `SUPER_ADMIN`/`GLOBAL_ADMIN` (reuse `isGlobalAdmin`) get a way to deactivate/reactivate/delete a listing from `/admin`.
9. `[slug]/join` member registration form gains an optional "List your skill or business" section. Skipping it must not change existing Member-creation behavior at all. Filling it creates a `YellowPagesListing` linked to the new `Member`, in the same request.
10. `theyellowpages` also has its own standalone add-listing form, independent of church membership registration.
11. Yellow-themed visual design, own component tree (`src/components/yellowpages/`), distinct from both the main purple/gold theme and the nation subdomain's theme.
12. Every new API route gets a colocated test/verification script; the schema/moderation logic and at least the search/filter API get real test coverage, per CLAUDE.md.

## Design

### Data model (`prisma/schema.prisma` additions)

```prisma
model YellowPagesListing {
  id                  String    @id @default(cuid())
  listingType         ListingType            // INDIVIDUAL | BUSINESS
  name                String                 // business/org name, or person's display name for a skill listing
  contactPersonName   String?                // required for BUSINESS; null/mirrors `name` for INDIVIDUAL
  position            String?                // "CEO", "Founder", etc. — BUSINESS only
  phone               String
  whatsapp            String?
  email               String?
  category            YellowPagesCategory
  subCategory         String?                // free-text profession/sub-sector, e.g. "Travel Agency"
  description         String                 // ~150 words, enforced client + server (see Invariants)
  servicesOffered     String?                // main services/products, short text
  city                String?
  state               String?
  country             String?
  assemblyId          String?
  assembly            Assembly?  @relation(fields: [assemblyId], references: [id], onDelete: SetNull)
  memberId            String?
  member              Member?    @relation(fields: [memberId], references: [id], onDelete: SetNull)
  website             String?
  socialLinks         Json       @default("{}")   // { facebook, instagram, linkedin, tiktok, ... }
  yearsInOperation    Int?
  certifications      String?
  logoUrl             String?
  photoUrl            String?
  licenseNumber       String?
  preferredContact    PreferredContact @default(PHONE)
  isActive            Boolean    @default(true)     // admin hide/deactivate flips this; excluded from public queries when false
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
  ratings             YellowPagesRating[]
}

model YellowPagesRating {
  id           String   @id @default(cuid())
  listingId    String
  listing      YellowPagesListing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  stars        Int                     // 1–5, validated server-side
  comment      String?
  reviewerName String
  contactHash  String                  // sha256 of normalized phone-or-email, for dedupe — never store/return raw contact
  createdAt    DateTime @default(now())

  @@unique([listingId, contactHash])
}

enum ListingType {
  INDIVIDUAL
  BUSINESS
}

enum PreferredContact {
  PHONE
  WHATSAPP
  EMAIL
}

enum YellowPagesCategory {
  TOURISM_TRAVEL
  CONSTRUCTION_REAL_ESTATE
  EDUCATION_TRAINING
  FINANCE_INSURANCE
  HEALTH_WELLNESS
  FOOD_HOSPITALITY
  TECHNOLOGY_IT
  CREATIVE_MEDIA
  FASHION_BEAUTY
  LEGAL_PROFESSIONAL_SERVICES
  TRANSPORT_LOGISTICS
  RETAIL_ECOMMERCE
  HOME_SERVICES_TRADES        // plumbing, carpentry, electrical, etc.
  AGRICULTURE_FOOD_PRODUCTION
  EVENTS_ENTERTAINMENT
  OTHER
}
```

Add `listings YellowPagesListing[]` to `Assembly` and `Member`. `contactHash` uses a server-side normalize (strip non-digits for phone, lowercase+trim for email) + `sha256`, salted with `NEXTAUTH_SECRET` — no new secret needed.

`YellowPagesCategory` is a fixed enum (matches the requested sector list + a `HOME_SERVICES_TRADES` bucket for the skill examples given — plumbing/carpentry/etc. — and `OTHER` as an escape hatch), not a free-text/DB-managed table — simplest for phase 1, matches how the schema already treats controlled vocab (`Department`, `Fellowship`) as enums. Revisit only if categories need to be admin-editable later.

### Routing

- `src/lib/yellowpages/host.js` — `getYellowPagesBase(host)`, same shape as `getNationBase`.
- `src/proxy.js` — add a second host-rewrite branch (pathname → `/yellowpages/...`) alongside the existing nation branch, same `?__yellowpages=1` dev-override convention. Keep the two branches independent (a request matches at most one).
- `.env.example` — add `YELLOWPAGES_HOST="theyellowpages.destinymissionglobal.org"` next to `NATION_HOST`.

### Page map (`src/app/yellowpages/`, own `layout.jsx` — not under `(public)`, mirrors `src/app/nation/`)

| Route | Purpose |
|---|---|
| `/yellowpages` | Home: hero + search bar + category grid + "recently added" + assembly/location filter entry point |
| `/yellowpages/search` | Results: text query + category + location filters, paginated grid of listing cards |
| `/yellowpages/category/[category]` | Pre-filtered results for one category |
| `/yellowpages/listing/[id]` | Full listing detail: all fields, logo/photo, rating average + list, "Rate this listing" form, contact links (tel:/mailto:/wa.me) respecting `preferredContact` |
| `/yellowpages/register` | Standalone add-a-listing form (INDIVIDUAL or BUSINESS toggle) |

### API (`src/app/api/yellowpages/`)

- `GET /api/yellowpages/listings` — query params `q`, `category`, `assemblySlug`, `city`, `country`, `page`. Returns only `isActive: true` listings, paginated, with `avgRating`/`ratingCount` aggregated.
- `GET /api/yellowpages/listings/[id]` — single listing incl. ratings (reviewer first-name/initial only), 404 if missing or `isActive: false`.
- `POST /api/yellowpages/listings` — public create. Body validated server-side (name, phone, category, description required; description length-capped ~150 words / 1200 chars; email/phone format checks mirroring `join/page.jsx`'s validators). Returns 201 + created listing, or 400 with field errors.
- `POST /api/yellowpages/listings/[id]/ratings` — public create-or-edit. Body: `stars` (1–5), `comment?`, `reviewerName`, `phone` or `email`. Hash the contact, then **upsert** on `@@unique([listingId, contactHash])`: a first submission creates (201), a repeat submission from the same contact updates that person's own review (200 `{ ..., updated: true }`) — there is no login, so "same contact" is how the author is recognised. Returns the public-safe rating shape (no contactHash). A concurrent-insert race (P2002 from the upsert) falls back to an update.
- `PATCH /api/yellowpages/listings/[id]` (admin-only, `isGlobalAdmin`) — body `{ isActive }`, toggles visibility.
- `DELETE /api/yellowpages/listings/[id]` (admin-only) — hard delete.
- `GET /api/yellowpages/upload-signature` — thin wrapper around `generateUploadSignature(getUploadFolder(..., 'yellowpages'))`, same pattern as existing signed-upload routes (no auth needed — same trust level as the public-registration Cloudinary flow already in the app, if one exists; otherwise this is the first client-signed public upload and should be capped via an `eager`/format allowlist in the signature params).

### Join-page integration

- `src/app/(public)/[slug]/join/page.jsx`: after the existing MEMBER-type fields, add a collapsed/optional section "List your skill or business in The Yellow Pages" (toggle to expand — off by default) with a trimmed field set: listing type, name, category, phone (prefilled from the member phone field, editable), description, city/state/country (prefilled from member fields). Full/advanced fields (logo, socials, certifications, etc.) are **not** duplicated here — the success screen links to `/yellowpages/listing/[id]/edit`-equivalent... no edit auth exists, so instead link to `theyellowpages.destinymissionglobal.org/yellowpages/register?listingId=<id>` pre-filled, so they can add the rest later. (Simplify: link to the standalone register page with a "complete your listing" query param that pre-fills from the just-created listing's public GET.)
- `src/app/api/assemblies/[slug]/register/route.js`: accept optional `yellowPages: { listingType, name, category, description, ... }` in the body. When present and `type === 'MEMBER'`, after `member` is created, create the `YellowPagesListing` with `memberId: member.id` inside the same handler (not a DB transaction requirement — Member creation must still succeed and return 201 even if the listing insert fails; log and continue, matching the existing best-effort `growthStage` enrollment pattern a few lines below it).
- Skipping the section sends no `yellowPages` key — route behaves exactly as today.

### Admin moderation

- `src/app/admin/(protected)/yellowpages/page.jsx` — list all listings (active + inactive), search/filter, toggle active / delete. Gated via the existing `ADMIN_AUTH_PATHS`-style check in `src/proxy.js` (add `/admin/yellowpages` to the global-only or a new appropriately-scoped path group — `isGlobalAdmin` only, since it's cross-assembly) and a server-side `isGlobalAdmin(session)` check in the route handlers.
- Add a sidebar entry in `src/components/admin/AdminSidebar.jsx`, visible to `SUPER_ADMIN`/`GLOBAL_ADMIN` only.

### Visual design

- Yellow-primary palette (e.g. `--yp-yellow-500` ~ `#F5B700`/amber family) + near-black/charcoal text for contrast/professionalism (classic "yellow pages" print reference), defined as CSS variables scoped under `src/app/yellowpages/layout.jsx` (or a `theyellowpages.css`), not overriding the global `--purple-*`/`--gold-*` tokens used elsewhere.
- `src/components/yellowpages/` — `ListingCard`, `CategoryGrid`, `SearchBar`, `FilterBar`, `RatingStars`, `RatingForm`, `ListingForm` (shared between join-page-embedded mini form and the standalone register page).

## Decisions

- **One `YellowPagesListing` model for both individuals and businesses** (discriminated by `listingType`), not two tables — the field overlap is >90%, and search/filter/rating logic stays uniform. `contactPersonName`/`position` are the only BUSINESS-flavored fields and are simply optional.
- **Category is a fixed Prisma enum**, not an admin-managed table — matches existing controlled-vocab pattern (`Department`, `Fellowship`); revisit if the church later wants to self-serve new categories.
- **No moderation queue** (per user decision) — `isActive` boolean + admin toggle/delete is the only backstop, checked into this phase, not deferred.
- **Ratings dedupe via hashed contact**, never stored/returned in the clear — balances "no login" with "no trivial spam" per user decision.
- **Join-page embed stays minimal**; full listing detail (logo, socials, certs) is only collectable on the dedicated `/yellowpages/register` form, reached via a pre-fill link post-registration — avoids bloating the membership form while still satisfying "optionally register from the membership flow."
- **Assembly linkage is nullable everywhere** (`assemblyId?`, `memberId?`) — required for the stated future "scale to the general public" goal.

## Invariants

- Skipping the yellow-pages section in `/[slug]/join` never alters existing Member-creation request/response shape or status codes.
- A listing is only ever publicly visible (`GET` list/detail, search) when `isActive: true`.
- `YellowPagesRating.contactHash` is never included in any API response; raw phone/email submitted for a rating is never persisted.
- `@@unique([listingId, contactHash])` is the sole rating-dedupe mechanism — enforced at the DB layer, not just app-layer, so it holds under concurrent requests.
- `description` is capped server-side (~1200 chars) regardless of client validation.

## Error Behavior

- `POST /listings` — 400 with `{ errors: { field: message } }` for validation failures (missing name/phone/category/description, malformed email/phone), mirroring `join/page.jsx`'s error shape.
- `POST /listings/[id]/ratings` — 400 for invalid `stars` (not 1–5) or missing name+contact; 404 if listing missing/inactive; a repeat submission from the same contact is not an error — it updates that reviewer's existing rating (200, `updated: true`).
- `PATCH`/`DELETE` on a listing — 401 if unauthenticated, 403 if authenticated but not `isGlobalAdmin`, 404 if listing doesn't exist.
- All routes: 500 + logged error on unexpected DB failure, matching existing routes' try/catch shape.

## Testing Strategy

- `src/lib/yellowpages/host.test.js` — mirrors `src/lib/nation/host.test.js` (if present) for `getYellowPagesBase`.
- `src/proxy.test.js` — extend with cases for the new host branch (rewrite on host match, on `?__yellowpages=1`, pass-through otherwise, and that nation/yellowpages branches don't collide).
- `src/app/api/yellowpages/listings/route.test.js` — create validation (required fields, description cap, dup handling if any), list filtering by category/assembly/location/query, `isActive` exclusion.
- `src/app/api/yellowpages/listings/[id]/ratings/route.test.js` — valid create (201), repeat-contact update (200 `updated:true`), invalid stars 400, hash never leaks in response.
- `src/app/api/yellowpages/listings/[id]/route.test.js` — admin PATCH/DELETE auth gating (401/403/200).
- Extend `src/app/api/assemblies/[slug]/register/route` test coverage (or add one if none exists) for the optional `yellowPages` payload: present → listing created + linked; absent → unchanged behavior; listing-insert failure → member creation still succeeds.
- Component-level: at minimum a verification checklist (per CLAUDE.md's "or verification checklist" allowance) for `ListingForm`, `SearchBar`/`FilterBar`, and `RatingForm` covering empty-state, validation-error display, and submit-success paths; add `.test.jsx` files for these if the phase-2 PR has bandwidth, following the existing `Component.jsx` + `Component.test.jsx` colocation.

## Out of Scope (this spec)

- Messaging/contact-in-app (contact is via `tel:`/`mailto:`/`wa.me` links only, no in-app inbox).
- Listing edit/claim flow for the submitter (no login exists to gate "this is my listing" — deferred; today, corrections go through the admin panel).
- Admin-managed category taxonomy (enum is fixed for phase 1).
- Public API rate-limiting infra (relies on the same exposure level as the existing public register endpoint; add if abuse is observed).
- Full "scale to the public" auth/accounts system — this spec only ensures the data model doesn't block it later.

## Implementation Plan (phased PRs)

1. **Schema + subdomain + public API** — Prisma models/enums + migration, `getYellowPagesBase`/proxy branch/env var, all `/api/yellowpages/*` routes + their tests. No new pages yet (verifiable via API tests + curl).
2. **Directory UI** — `src/app/yellowpages/*` pages + `src/components/yellowpages/*`, yellow theme, wired to phase-1 API.
3. **Join-page integration** — optional section in `[slug]/join`, `register` route change, its tests.
4. **Admin moderation** — `/admin/yellowpages`, sidebar entry, PATCH/DELETE routes' auth wiring (routes themselves may ship in phase 1; this phase is the admin UI).

Each phase is independently committable and does not depend on unrelated in-flight WIP in the working tree.
