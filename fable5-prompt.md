# Fable 5 Prompt — Aruba Home Services (Launchable Product)

Build **Aruba Home Services** — a real, production-ready, on-demand marketplace for home
services on the island of Aruba. "Uber for home services": a customer opens the site,
picks a service, and instantly books a vetted local provider. One website that brings
**every** home-service company on Aruba into a single place.

## This is a REAL product, not a demo
Build it so it can actually launch and take real bookings from real customers with real
providers. That means real accounts, real data persistence, and a real payment step — not
just clickable mockups.

### Tech stack (production-grade)
- **Next.js (App Router) + TypeScript + Tailwind CSS**, deployable to Vercel.
- **Supabase** (Postgres + Auth + Storage) as the backend — real user accounts, real
  database tables, row-level security. Provide the SQL schema/migrations.
- **Stripe** for payments (Stripe Checkout or Payment Intents) — real, but keep keys in
  env vars and ship in test mode until go-live.
- Email/SMS notifications for booking confirmations (stub the provider, e.g. Resend/Twilio,
  behind env vars).
- Mobile-first, fast, accessible (WCAG AA).

### Roles & auth (real)
1. **Customer** — sign up / log in (email + Google), book services, manage bookings.
2. **Provider** — company or tradesperson account: onboard, list services, set rates &
   service area, accept/decline jobs, mark jobs complete, see earnings.
3. **Admin** — approve/verify providers, manage the directory, view all bookings.

### Services (data-driven categories)
Electricians · Plumbers · AC repair & installation · Pool cleaning · Landscaping ·
House cleaning · Pest control · Handyman · Appliance repair · Moving/hauling.
Make categories a DB table so new ones can be added without code changes.

### Core features
1. **Homepage** — hero with "What do you need done today?" search, location field
   (Aruba neighborhoods: Oranjestad, Noord, Palm Beach, Eagle Beach, San Nicolas,
   Santa Cruz, Paradera, Savaneta), category grid, trust badges.
2. **Provider directory** — the "every company on Aruba in one place" view. Filter by
   service, neighborhood, rating, price. Seed it with the REAL companies in
   `data/aruba-providers-seed.json` (import script to load them into the DB).
3. **Provider profile** — logo/photo, rating, jobs completed, verified & insured badges,
   services, rates, bio, reviews.
4. **Booking flow** — service → describe job → date/time or "ASAP" → matched providers
   → confirm → **pay/deposit via Stripe**. Show price range per service.
5. **Customer dashboard** — upcoming/past bookings, rebook, favorites, receipts.
6. **Provider dashboard** — incoming requests, accept/decline, schedule, mark complete,
   earnings summary.
7. **Provider onboarding / "List your business"** — company name, services, service area,
   rates, license/insurance upload (Supabase Storage), goes to admin for verification.
8. **Ratings & reviews** on completed jobs.
9. **Admin panel** — verify providers, moderate, view bookings.

### Localization
UI language toggle: **English, Papiamento, Dutch, Spanish**. Prices in **Aruban florin
(AWG)** with USD equivalent (peg ~1 USD = 1.79 AWG).

### Data
Load the real seed providers from `data/aruba-providers-seed.json`. Many have missing
phone numbers / verification — model fields for that and mark `verified: false` until an
admin confirms. Structure so the directory can grow to full island coverage.

### Deliverables
- Full Next.js app, all flows working end-to-end against Supabase + Stripe (test mode).
- SQL schema + seed/import script.
- `.env.example` listing every required key (Supabase, Stripe, email/SMS).
- README with setup + deploy steps.
- Polished enough to demo to real users, providers, and investors.
