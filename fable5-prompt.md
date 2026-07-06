# Fable 5 Prompt — Aruba Home Services (Launchable Product)

Build **Aruba Home Services** — a real, production-ready, on-demand marketplace for home
services on the island of Aruba. "Uber for home services": a customer opens the site,
picks a service, and instantly books a vetted local provider. One website that brings
**every** home-service company on Aruba into a single place.

## This is a REAL product, not a demo
Build it so it can actually launch and take real bookings from real customers with real
providers. That means real accounts and real data persistence — not just clickable mockups.

### Payment model — NO online payments, NO card processor
Do **not** integrate Stripe or any payment gateway. There is no checkout or card entry
anywhere in the app. The money flow is manual and offline:
1. Customer books a service (no payment at booking).
2. Provider does the job and marks it complete.
3. An **invoice** is generated (on-screen + downloadable PDF) and emailed to the customer.
4. The customer pays by **bank transfer to the business's Aruba Bank account** — show the
   account name, account number, and a unique payment reference on every invoice.
5. The admin marks the invoice **Paid** manually once the transfer arrives.
Model payment status as `pending → invoiced → paid`. That is the entire money flow — no
gateways, no webhooks, no card data.

### Tech stack (production-grade)
- **Next.js (App Router) + TypeScript + Tailwind CSS**, deployable to Vercel.
- **Supabase** (Postgres + Auth + Storage) as the backend — real user accounts, real
  database tables, row-level security. Provide the SQL schema/migrations.
- Invoice PDF generation (e.g. React-PDF or a server-side PDF lib) showing the Aruba Bank
  transfer details and payment reference.
- Email notifications for booking confirmations and invoices (stub the provider, e.g.
  Resend, behind env vars).
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
   → confirm booking. **No payment step.** Show an estimated price range per service so the
   customer knows roughly what to expect; the final amount comes on the invoice afterward.
5. **Customer dashboard** — upcoming/past bookings, rebook, favorites, and **invoices**
   (with Aruba Bank transfer details + paid/unpaid status).
6. **Provider dashboard** — incoming requests, accept/decline, schedule, mark complete,
   then set the final price to generate the invoice.
6b. **Invoices** — auto-generated when a job is marked complete: itemized amount in AWG,
   the business's Aruba Bank account + payment reference, downloadable PDF, emailed to the
   customer. Admin can toggle status pending → invoiced → paid.
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
- Full Next.js app, all flows working end-to-end against Supabase (no payment processor).
- SQL schema + seed/import script.
- `.env.example` listing every required key (Supabase, email; plus config values for the
  Aruba Bank account name / number / IBAN shown on invoices).
- README with setup + deploy steps.
- Polished enough to demo to real users, providers, and investors.
