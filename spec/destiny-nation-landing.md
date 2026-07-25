# Destiny Nation — The Gatekeepers Commission — Spec

## 0. Source reconciliation

Four source docs were provided (`DestinyNation.png`, two WhatsApp infographic exports, and `THE GATEKEEPERS @branding slides.pdf`, 9 slides). All describe the same initiative; the PDF is the deepest source (it contains a 4-layer model the infographics don't show). Below is the merged model, with conflicts called out explicitly.

**Campaign identity:** "Destiny Nation — The Gatekeepers Commission." Sub-line: *30 Gates · 30 Years · One Legacy*. Launched to mark Destiny Mission Global Assembly's 30th anniversary. Tagline: *"We don't just build churches. We build the leaders who build nations."* Closing line: *"One Church. One Mission. Thirty Gates. Infinite Impact."*

**Theological frame:** gates in Scripture were places of Authority, Governance, Justice, Commerce, Security, Wisdom, Influence. Anchor verse/question: *"What are the gates God has entrusted to this house, and who will steward them into the future?"*

**The 4-layer model (from the PDF — this is the narrative backbone the infographics don't spell out):**
1. **Layer 1 — The House.** The church itself: the source, the altar, the training ground.
2. **Layer 2 — Internal Gates** (30: 5 categories × 6). Existing ministries/operations reframed as gates — Spiritual Formation, Family, Worship & Communication, Operations, Leadership & Expansion. *This is internal church org structure, not partner-facing.*
3. **Layer 3 — Influence Gates** (the "30 Gates of Influence" shown in all three infographics — this is the public-facing centerpiece): 6 sectors × 5 gates each — Governance & Public Leadership, Economy & Enterprise, Science/Innovation & Infrastructure, Human Development, Culture & Media, Global Development. Full 30-item list captured below.
4. **Layer 4 — Legacy Projects.** Each gate's project must pass 4 tests: solve a real problem, outlive the anniversary, produce measurable impact, create future leaders. Examples given: Christian Education Gate → Destiny Leadership Institute; Youth Gate → Next Gen Leadership Fellowship; Media Gate → Digital Broadcasting Studio; Governance Gate → Faith & Public Leadership Forum; Healthcare Gate → Community Health Initiative; Technology Gate → AI Innovation Lab.

**Gatekeeper roles per gate:** Gate Patron (senior oversight, usually pastor/elder), Chief Gatekeeper (operational head), Emerging Gatekeeper (successor-in-training).

**Gatekeeper Council:** Senior Pastor, Executive Pastor, Legacy Director, Internal Gate Leaders, Influence Gate Leaders — meets quarterly to review progress, resolve challenges, coordinate partnerships.

**Commissioning process (5 phases):** Recognition → Nomination → Validation (character, competence, contribution, capacity) → Formation (Gatekeepers Academy: Spiritual Leadership, Governance, Stewardship, Strategic Planning, Project Management, Succession Development) → Commissioning (public covenant, mandate, impartation).

**✅ Giving tiers — resolved as two separate, non-overlapping packages.** Previous draft merged the 9-rung ladder and the Founders' Circle into one ladder with a badge layered on top from ₦25M up. Per your steer, these are two different packages serving two different donor intents, not one payment path — keeping them structurally and visually separate everywhere (data model, page, checkout flow):

**Package A — Gatekeeper Giving Ladder.** Project-tied giving: every tier attaches the gift to a specific gate, cohort, or initiative and earns ladder-specific recognition (name on a sponsored gate, a scholarship fund named after the donor, etc.).

| # | Tier | Amount | Cadence |
|---|------|--------|---------|
| 9 | Gatekeeper Friend | ₦30K | one-time or recurring (monthly/annual) |
| 8 | Gatekeeper Partner | ₦100K | one-time or recurring (monthly) |
| 7 | Kingdom Builder | ₦500K | one-time or recurring |
| 6 | Legacy Circle | ₦1M | annual giving community |
| 5 | Future Leaders Scholarship Fund | ₦5M | one-time (or pledge) |
| 4 | Gate Champion | ₦10M | one-time / annual pledge |
| 3 | Sponsor a Gate | ₦30M/gate | annual pledge |
| 2 | Nation Builder | ₦50M | pledge |
| 1 | Legacy Founder | ₦100M+ | one-time or pledge |

**Package B — Founders' Circle.** A separate endowment program, not a tier within the ladder above. Funds the initiative's long-term sustainability (the House + cross-cutting Legacy Projects fund) rather than one specific gate. Founders get their own recognition track (permanent Founders' Wall, annual Founders' Circle gathering) distinct from ladder recognition.

| Tier | Amount |
|------|--------|
| Bronze | ₦25M+ |
| Silver | ₦100M+ |
| Gold | ₦250M+ |
| Diamond | ₦350M+ |
| Platinum | ₦500M+ |

*(Only Bronze ₦25M+ and Platinum ₦500M+ were confirmed by the source infographic — Silver/Gold/Diamond above are a proposed even split pending your confirmation.)*

**Why the amount ranges are allowed to overlap:** a ₦100M gift could go either to the ladder's "Legacy Founder" tier or the Founders' Circle's "Silver" tier — the packages differ by *purpose* (fund one gate vs. fund the whole initiative's endowment), not by amount bracket, so a donor picks a package first, then a tier within it. The UI must present these as two clearly separate cards/paths ("Give to a Gate" vs. "Join the Founders' Circle"), never as one combined ladder.

**First 100 partners**, across both packages combined, are recognized as "Founding Gatekeepers." This needs a live counter on the page (see §4).

---

## 1. Architecture decision — subdomain vs. in-site page

**Recommendation: same Next.js app and Vercel project, new subdomain mapped via host-based rewrite — not a separate codebase/deployment.**

Reasoning:
- You already run one Next.js 16 app on Vercel with Prisma/Postgres, NextAuth, Cloudinary, and Resend wired up. A second deployable app would mean a second env-var set, a second DB connection story (or a fragile cross-project DB share), duplicated auth if you ever want admin login here, and a second CI/deploy target — for a feature whose actual differentiator is *branding and URL*, not infrastructure.
- Vercel supports attaching `nation.destinymissionglobal.org` as an additional domain on the **same** project. Next.js middleware can inspect the `Host` header and `rewrite()` requests for that host into an internal route group (e.g. `/nation/*`), so the subdomain is real (own URL, own look, no `/nation` prefix visible to visitors) while the code, DB, and deploy pipeline stay unified.
- This gets you what you actually said you wanted: it *feels* like its own site (own nav, own footer, no shared homepage chrome), can grow into multiple routes later (`/nation/give`, `/nation/register`, `/nation/gates/[slug]` if you ever split it up), but costs you almost nothing operationally today.

Rejected alternative — fully separate app/repo/Vercel project: revisit only if Destiny Nation outgrows being "a campaign of the church" (e.g., becomes its own legal entity with its own team managing it independently). Not justified for launch.

**Sunday-launch fallback:** the two real deadline risks are DNS propagation for the subdomain and payment-provider account approval (§3) — neither is code, and neither is fully in your control on a 3-day clock. Because the middleware just rewrites `/` to `/nation` internally, the page is reachable at `https://destinymissionglobal.org/nation` the moment it's built, with or without the subdomain DNS having propagated yet. Recommendation: build and launch content against that path, flip `nation.destinymissionglobal.org` on as soon as DNS/Vercel verification clears (same code, zero rework, just add the domain + redirect once ready).

**Implementation:**
- `middleware.js` (new, project root) — if `Host` is `nation.destinymissionglobal.org` (or a `NATION_HOST` env var, so staging/preview domains work), rewrite `/` → `/nation` and pass through any subpath (`/gates/influence` → `/nation/gates/influence`, etc.) untouched otherwise. Add a matcher excluding `/api`, `/_next`, static assets.
- `src/app/nation/` — new route segment, now multi-page (§2: landing + `gates/internal` + `gates/influence` + `projects` + `partner` + `give/callback`), not under the `(public)` group since it needs its own `layout.jsx` with Destiny Nation's own header/footer and tab-nav, not the main site chrome.
- Main site links to it as a normal external-looking URL (`https://nation.destinymissionglobal.org`), not an internal `<Link>` — it's cross-host.
- Vercel dashboard: add `nation.destinymissionglobal.org` as a domain on this project, plus a DNS record at your registrar (CNAME to Vercel). **This DNS change happens outside the repo — you'll need to do it in Vercel + your DNS provider; flag when you're ready and I'll give exact steps.**

---

## 2. Page structure — landing overview + tab-nav to sector/project/partner pages

Revised per your steer: the single-long-scroll design is out. `/nation` becomes a concise overview with a clear CTA, and a persistent tab-nav sends visitors to dedicated pages per sector/track — the 30-gate detail, the legacy-projects catalogue, and the give flow each get their own page instead of being scroll-sections. All content below is still only what's in the four source docs — no new concepts introduced.

**Site map** (all under `src/app/nation/`, sharing one `layout.jsx` with the Destiny Nation header/footer + tab-nav):

| Route | Purpose |
|---|---|
| `/nation` | **Landing/overview** — Hero (30/30/One Legacy + CTA buttons), theological foundation, a compact visual summary of the 4-layer model (House → Internal Gates → Influence Gates → Legacy Projects), tab-nav to the pages below. |
| `/nation/gates/internal` | **Internal Gates** — 5 categories × 6 gates (Spiritual Formation, Family, Worship & Communication, Operations, Leadership & Expansion). Church-internal structure, informational only — no partner CTA, since these aren't gates an external partner acts on. |
| `/nation/gates/influence` | **Influence Gates** — the public-facing centerpiece. Interactive grid of all 30 gates grouped by the 6 sectors (Governance & Public Leadership, Economy & Enterprise, Science/Innovation & Infrastructure, Human Development, Culture & Media, Global Development), each gate a card (icon + name) linking to gate detail (Patron/Chief/Emerging roles per the source doc, + linked Legacy Project if one exists). |
| `/nation/projects` | **Legacy Projects** — the 4-test framework (solves a real problem, outlives the anniversary, measurable impact, creates future leaders) + the gate→project→outcome example cards from the source doc, filterable by sector. No leadership-application CTA here — gatekeepers are assigned by senior leadership through the existing Recognition→Nomination→Validation→Formation→Commissioning process (§ below), not by public self-nomination. If a lightweight "register interest in this project" action is wanted, it's optional and separate from that leadership process — flag if you want it in scope, otherwise this page stays read-only content. |
| `/nation/partner` | **Get Involved** — Gatekeeper structure (Patron/Chief/Emerging roles + Council) and the 5-phase Commissioning timeline as informational content; org-type value props (`WhyPartner`: Government, Corporate, Development Partners, Educational Institutions, Churches, Individuals); the first-100 live counter; and the actual give flow — the two separate giving-package cards from §0 (ladder vs. Founders' Circle) with the real payment form. Giving is the one interactive/actionable feature on this page. |
| `/nation/give/callback` | Payment-provider redirect target (plumbing, not content) — verifies the transaction, shows inline success/failure, deep-links back to `/nation/partner`. |

**Components** under `src/components/nation/`, one subfolder per route instead of one flat list of scroll-sections:

- `landing/` — `Hero`, `TheologicalFoundation`, `ModelSummary`, `TabNav`.
- `gates-internal/` — `InternalGatesGrid`.
- `gates-influence/` — `InfluenceGatesGrid`, `GateDetail`.
- `projects/` — `LegacyProjectsCatalogue`, `ProjectCard` (gate → project → outcome, 4-test badge).
- `partner/` — `GatekeeperStructure`, `CommissioningProcess`, `WhyPartner`, `FoundingPartnerCTA` (first-100 counter + the two giving-package cards from §0 + the give form, see §3).
- `shared/` — `Footer` (logo, socials, link back to `www.destinymissionglobal.org`), used by the layout.

---

## 3. Payment gateway — Flutterwave (church's own account), direct bank transfer as the only interim stopgap

**This section supersedes the Paystack-subaccount design that briefly preceded it.** Reason for dropping Paystack: the live key available belongs to a Paystack account verified under your cooperative society's KYB documents, not the church. A subaccount only controls where money *settles*, not whose name the donor sees — Paystack's own support docs confirm debit alerts and billing descriptors are tied to the verified parent merchant account, so donors would likely see the cooperative's name, not Destiny Mission Global's. That's the exact suspicion-avoidance problem the church wants to avoid, and it isn't worth risking on an unverified assumption. **Decision: wait for Flutterwave**, which is being registered directly under Destiny Mission Global Assembly's own CAC documents — no naming mismatch, no borrowed account.

**Recommendation: Flutterwave Standard Checkout — a single hosted-payment-page redirect, no embedded card fields, no subscriptions, no webhook, at launch** — as originally scoped. Once the CAC registration-number format issue (§ discussed separately — use the `IT`-prefixed number) is resolved and KYC is submitted, this is a live-account approval wait outside our control, not a code problem.

**Currency:** Flutterwave's hosted checkout offers the donor a currency choice natively (NGN, USD, GBP, EUR to start — confirm the list) plus multiple rails per currency (card, bank transfer, mobile money, USSD, Apple/Google Pay where available), covering the Nigeria/Kenya/Uganda/Americas/Europe partner spread without us building any of that ourselves.

**If Flutterwave's KYC doesn't clear before launch day, the only fallback is direct bank transfer — not another borrowed account:**
- Publish the church's own bank account details on `/nation/partner` (account name must read "Destiny Mission Global Assembly" or its official trading name — no naming ambiguity, no third party involved).
- Donor transfers manually, then optionally submits a simple "I've given" confirmation form (name, tier/package, amount, rough reference) so it shows up as a `PENDING`/manually-reconciled row for follow-up — no payment API involved at all.
- Reconcile against the church's real bank statement by hand until Flutterwave is live, then swap this section out for the real checkout flow below. Zero code dependency, zero approval wait, zero naming risk — the tradeoff is manual reconciliation and no automated receipt email.

**What ships once Flutterwave is live (one-time gifts only, all tiers):**
1. On `/nation/partner`, the donor first picks a **package** — Package A (Gatekeeper Giving Ladder) or Package B (Founders' Circle) — as two separate cards, per §0; only then sees that package's tier picker + a **currency dropdown**. Amount pre-fills from a small static tier→currency table in code (not a live FX API — one less dependency); the donor can edit it.
2. `POST /api/nation/give/initialize` — creates a `PENDING` `DestinyNationContribution` row (recording package + tier), calls Flutterwave's Standard Checkout API (`/v3/payments`) with the chosen amount + currency, returns the hosted payment link, redirects the donor there.
3. Donor completes payment on Flutterwave's page in whatever method it offers for their currency.
4. Flutterwave redirects back to `/nation/give/callback?tx_ref=...&transaction_id=...`.
5. Callback route calls Flutterwave's `/transactions/:id/verify`, marks the row `SUCCESS`/`FAILED`, shows confirmation, sends a receipt email via the existing `src/lib/email.js`/Resend setup.
6. Two lead-capture cutoffs route to the "Register Interest / Pledge" form instead of checkout, keeping the highest-scrutiny, highest-value transactions off the critical path: Package A tiers ≥₦10M-equivalent (Gate Champion and above), and **all** Package B (Founders' Circle) tiers — endowment-level gifts are pledge/lead-capture only, never self-serve checkout, at every tier from Bronze up.

**Deliberately deferred — build after launch, not before:**
- **Webhook reconciliation** (`charge.completed`). Launch relies solely on verify-on-callback. Gap: a donor who pays but closes the tab before the redirect completes won't be marked `SUCCESS` in our DB even though Flutterwave took the money. Mitigation until the webhook ships: Flutterwave's own dashboard is the real source of truth for "did the money arrive" — treat our DB as a UX/receipt convenience, not the ledger, for the first week.
- **Recurring/subscription billing** for the "monthly or annual" tiers. Launch ships one-time gifts only; the tier copy can keep saying "give monthly" — for now that just means the donor manually returns and gives again.
- **Live FX rates** — static conversion table, admin-editable later.
- **Admin contributions dashboard** (§4) — shrinks to just the public partner-counter query at launch; a full table view is a fast-follow, not launch-blocking.

**Prisma model:**
```prisma
model DestinyNationContribution {
  id            String   @id @default(cuid())
  reference     String   @unique   // Flutterwave tx_ref, or a manual reference for bank-transfer-era rows
  package       GivingPackage       // LADDER | FOUNDERS_CIRCLE — §0, kept separate from tier
  tier          String              // e.g. "GATEKEEPER_FRIEND" (ladder) or "BRONZE" (Founders' Circle)
  amount        Int                 // whole units in the chosen currency — confirm Flutterwave's minor/major unit convention per currency before building
  currency      String              // "NGN" | "USD" | "GBP" | "EUR" ...
  status        ContributionStatus  @default(PENDING)
  donorName     String
  donorEmail    String
  donorPhone    String?
  donorCountry  String?
  donorOrg      String?
  isPledge      Boolean  @default(false)  // true for the >=10M ladder tiers AND all Founders' Circle tiers (lead-capture, no checkout)
  isManualEntry Boolean  @default(false)  // true for bank-transfer-era rows entered by hand during the pre-Flutterwave gap
  followUpNotes String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum GivingPackage {
  LADDER            // Package A — Gatekeeper Giving Ladder, project-tied
  FOUNDERS_CIRCLE    // Package B — endowment-level, separate program
}

enum ContributionStatus {
  PENDING
  SUCCESS
  FAILED
  PLEDGED     // lead-capture/large-gift path, before any money moves
}
```

**Env vars to add:** `FLUTTERWAVE_SECRET_KEY`, `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`, `NATION_HOST` (for the middleware rewrite), `DESTINY_NATION_NOTIFY_EMAIL` (where pledge/large-gift leads get emailed).

---

## 4. Admin surface

Reuse the existing role system — no new role needed. `GLOBAL_ADMIN`/`SUPER_ADMIN` get a new admin section:
- `src/app/admin/(protected)/nation/` — table of `DestinyNationContribution` rows, filterable by status/tier/isPledge, with a "mark contacted" action on pledge rows (writes `followUpNotes`), and CSV export.
- `src/app/api/admin/nation/` — CRUD-ish endpoints following the existing `admin/*` auth-check pattern.
- The "first 100 Founding Partners" counter on the public page is a simple `count()` of `SUCCESS`/`PLEDGED` rows — expose via a small public API route (`/api/nation/partner-count`) rather than making the whole page dynamic-render if you want it to stay mostly static/fast.

---

## 5. Cross-site linking

- Main site nav (wherever the primary header lives) gets a "Destiny Nation" item linking to `https://nation.destinymissionglobal.org` (external link, opens same tab).
- Branch pages (`src/app/(public)/[slug]/page.jsx`) get a promotional banner/section pointing to the same URL — reuse the existing `AssemblySection`/`CustomSection` pattern if branches should be able to toggle this banner on/off per assembly, or hardcode it as a global banner if it should always show. **Confirm which** — default recommendation: hardcode as a persistent global CTA, since this is a church-wide initiative, not opt-in per branch.

---

## Phase 1 — Data model + payment backend
- Scope: Prisma migration (`DestinyNationContribution` + enums); `src/lib/flutterwave.js` (create-payment + verify helpers only — no webhook, no subscriptions at launch); API routes: `initialize`, `verify`, `partner-count`. If Flutterwave's KYC hasn't cleared yet when this phase starts, build against test-mode keys (works regardless of live approval status) and gate the live redirect behind an env flag so it flips on the moment approval lands.
- Acceptance: can create a PENDING contribution, complete a Flutterwave test-mode payment end to end via verify-on-callback, receipt email sends via existing Resend setup.

## Phase 1a — Bank-transfer stopgap (only if launch day arrives before Flutterwave KYC clears)
- Scope: static bank-details block + a lightweight "I've given" confirmation form on `/nation/partner` that writes a `PENDING`, `isManualEntry: true` row (no payment API call). Skipped entirely if Flutterwave is already live by launch.
- Acceptance: a submitted confirmation creates a row visible in the admin table (§4) for manual reconciliation against the church's bank statement; this UI is trivially removable once Phase 1's real checkout replaces it.

## Phase 2 — Subdomain routing skeleton
- Scope: `middleware.js` host rewrite, `src/app/nation/layout.jsx` (own header/footer + tab-nav, no main-site chrome), empty stub pages for all five routes in §2 (`page.jsx`, `gates/internal/page.jsx`, `gates/influence/page.jsx`, `projects/page.jsx`, `partner/page.jsx`).
- Acceptance: visiting `localhost:3000` with `Host: nation.destinymissionglobal.org` (or a `?__nation=1` dev override, since local hosts can't easily fake subdomains) renders the nation layout, not the main site; tab-nav links between the five stub pages work.

## Phase 3 — Landing + sector page content
- Scope: `landing/`, `gates-internal/`, `gates-influence/`, and `projects/` components from §2, populated with the reconciled content from §0/source docs, responsive, matching the deck's purple/gold/cyan palette.
- Acceptance: `/nation` overview renders with working tab-nav; `/nation/gates/internal` shows all internal gates grouped by the 5 categories; `/nation/gates/influence` shows all 30 gates grouped by the 6 sectors; `/nation/projects` shows the gate→project→outcome cards; no layout breakage at mobile width.

## Phase 4 — Partner page + give flow
- Scope: `partner/` components from §2 (`GatekeeperStructure`, `CommissioningProcess`, `WhyPartner`, `FoundingPartnerCTA`), the package-then-tier picker + currency dropdown + form UI, checkout redirect, `/nation/give/callback` page, pledge-form path for Package A ≥₦10M-equivalent tiers and all Package B tiers, receipt/notification emails.
- Acceptance: a Flutterwave test-mode payment in at least two currencies completes end-to-end and shows success state; a pledge-tier submission (either package) emails the ministry contact and creates a `PLEDGED` row; partner counter increments after a successful payment.

## Phase 5 — Admin + cross-site linking
- Scope: `admin/nation` contributions table + mark-contacted action, main-site nav link, branch-page banner.
- Acceptance: `GLOBAL_ADMIN` can view/filter/export contributions; nav link and banner present on main site and branch pages; both point to the live subdomain URL.

---

## Open questions before I start building

1. **Blocking on launch timing:** Flutterwave is the sole provider (Paystack subaccount ruled out — §3, naming-suspicion risk). Its business account is registered directly under Destiny Mission Global Assembly's own CAC documents; KYC submission was blocked on the registration-number format (resolve by entering the `IT`-prefixed number, e.g. `IT190198`, matching the Incorporated Trustees certificate) and is otherwise in progress. Launch date depends on Flutterwave's approval turnaround, which neither of us controls — if it doesn't clear in time, Phase 1a's bank-transfer stopgap covers the gap.
2. Currency list to support at launch — NGN + USD/GBP/EUR as a starting guess, confirm or adjust.
3. Founders' Circle Silver/Gold/Diamond thresholds (₦100M+/₦250M+/₦350M+, §0) are a proposed even split between the confirmed Bronze ₦25M+ and Platinum ₦500M+ endpoints — confirm or adjust the middle three.
4. ₦10M-equivalent cutoff between self-serve checkout and lead-capture/pledge for Package A (§3) — confirm or adjust. (Package B/Founders' Circle is lead-capture-only at every tier, not in question.)
5. Should the "Internal Gates" page (`/nation/gates/internal`, church-internal org structure) be public at all, or stay internal-only/behind admin auth (§2)?
6. Branch-page banner: global/always-on, or per-assembly toggle via `AssemblySection` (§5)?
7. OK to launch Sunday reachable at `destinymissionglobal.org/nation` if `nation.destinymissionglobal.org` DNS hasn't propagated yet, flipping the subdomain on once it clears (§1)?
8. Legacy Projects page (`/nation/projects`) — confirmed read-only (no leadership-application CTA, since gatekeepers are assigned by senior leadership per the existing Commissioning process, not self-nominated). Do you want even a lightweight "register interest in this project" action, or should this page have zero interactive elements and leave giving as the site's only interactive feature?
