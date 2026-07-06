# 🌴 Aruba Home Services

**Every home-service pro on Aruba, one booking away.**

An on-demand marketplace ("Uber for home services") for the island of Aruba. Customers
book vetted local electricians, plumbers, AC techs, pool cleaners, landscapers, house
cleaners, pest controllers, handymen, appliance repairers and movers. There is **no
online payment** anywhere: after a job is done the provider sets the final price, an
invoice is generated (on-screen, PDF, email) with the business's **Aruba Bank** transfer
details and a unique payment reference, and an admin marks it paid when the transfer
arrives.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**, ready to
deploy on **Vercel**.

---

## 🚀 Preview it right now (no accounts, no keys)

You only need [Node.js](https://nodejs.org) (version 18 or newer) installed.

```bash
npm install
npm run dev
```

Open **http://localhost:3000** — that's it.

With no configuration the site runs in **demo mode**: it loads the 34 real Aruba
companies from `data/aruba-providers-seed.json`, plus sample bookings, invoices and
reviews, so every page and flow is clickable. A yellow banner reminds you that demo
data resets when you restart the server.

### Try the whole product in demo mode

Go to **Log in** and use the one-click demo accounts:

| Button | What you can do |
|---|---|
| **Demo customer** | Book a service end-to-end, cancel, leave reviews, see invoices with bank-transfer details, download invoice PDFs |
| **Demo provider** | See incoming requests for *Lucky Electricals*, accept/decline, mark a job complete, set the final price and generate the invoice |
| **Demo admin** | Approve/verify providers, view all bookings, mark invoices **paid** |

A nice full loop to demo: log in as **customer** → *Book a service* (e.g. Electrician,
pick Lucky Electricals) → log in as **provider** → accept the job → *Mark complete &
invoice* → enter a price → the invoice appears (download the PDF!) → log in as
**admin** → *Invoices* tab → *Mark paid* → back as customer, the invoice shows **Paid**.

The language switcher (🌐) toggles **English, Papiamento, Nederlands, Español**.
Prices are in Aruban florin (AWG) with a USD equivalent (pegged ~1 USD = 1.79 AWG).

---

## What's inside

- **Homepage** — "What do you need done today?" search, Aruba districts, category grid
  with typical price ranges, trust badges, top-rated pros.
- **Provider directory** (`/providers`) — every company in one place; filter by service,
  area, rating, hourly rate, verified-only; sort options.
- **Provider profiles** — bio, badges (verified / insured), services with price ranges,
  contact info, customer reviews, favorites.
- **Booking flow** (`/book`) — 5 steps: service → describe the job → ASAP or scheduled →
  matched providers → confirm. **No payment step**; an estimated price range is shown.
- **Customer dashboard** — active & past bookings, cancel, rebook, reviews, favorites,
  invoices with payment status.
- **Provider dashboard** (`/pro`) — incoming requests (accept/decline), schedule,
  mark complete + set final price → invoice generated & emailed; earnings totals.
- **Invoices** — on-screen + downloadable PDF + email, showing the Aruba Bank account
  name/number/IBAN/SWIFT and a unique payment reference. Status: pending → invoiced → paid.
- **Provider onboarding** (`/pro/onboarding`) — list your business; license/insurance
  upload; goes to the admin for verification before appearing in the directory.
- **Admin panel** (`/admin`) — verify/reject providers, all bookings, mark invoices paid.
- **Auth** — customer / provider / admin roles (email+password and Google via Supabase).
- **i18n** — English (complete), Papiamento, Dutch, Spanish.

### Project layout

```
app/                 Pages (App Router) + API routes (invoice PDF, OAuth)
components/          UI components (booking wizard, forms, cards…)
lib/                 Domain logic
  data/              ONE data interface, TWO backends: demo (in-memory) & Supabase
  demo/store.ts      Demo database seeded from data/aruba-providers-seed.json
  i18n/              Dictionaries (en/pap/nl/es) + helpers
  actions.ts         All server actions (booking, invoicing, admin…)
  pdf.ts             Invoice PDF generator
supabase/migrations/ SQL schema (tables, RLS, triggers)
scripts/import-seed.mjs  Loads the real 34 companies into Supabase
data/aruba-providers-seed.json  The real Aruba companies (source of truth)
```

---

## 🟢 Going live — step by step

Demo mode is for previewing. To take real bookings you connect a free **Supabase**
database (real accounts + data that persists) and deploy to **Vercel** (free hosting).
Budget ~30–45 minutes.

### Step 1 — Create the Supabase project (the database)

1. Go to [supabase.com](https://supabase.com), sign up, click **New project**.
   Pick any name (e.g. `aruba-home-services`), a strong database password, and the
   region closest to Aruba (US East).
2. When it's ready, open **SQL Editor** (left sidebar) → **New query**.
3. Open the file `supabase/migrations/0001_init.sql` from this project, copy **all**
   of it, paste it into the editor and click **Run**. You should see "Success".
4. Go to **Project Settings → API** and copy three values:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this one secret!)

### Step 2 — Configure this project

1. Copy `.env.example` to a new file called `.env.local`.
2. Fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=   (Project URL)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=   (anon public key)
   SUPABASE_SERVICE_ROLE_KEY=   (service_role key)
   ```
3. **Edit the bank details** (`INVOICE_BANK_*`) to your real Aruba Bank account —
   these are printed on every invoice.

### Step 3 — Load the real providers into the database

```bash
npm run import-seed
```

This imports the 10 service categories and all 34 companies from
`data/aruba-providers-seed.json`. Safe to run again after you add more companies to
the JSON. (Companies import as *unverified* — verify them from the admin panel once
you've confirmed their details.)

### Step 4 — Make yourself the admin

1. Run the site (`npm run dev`), click **Sign up**, and create your account.
2. In Supabase, open **Table Editor → profiles**, find your row, and change
   `role` from `customer` to `admin`. Log out and back in — you now have `/admin`.

### Step 5 — Emails (optional but recommended)

1. Create a free account at [resend.com](https://resend.com), add + verify your domain,
   and create an API key.
2. Put it in `.env.local` as `RESEND_API_KEY`, and set `EMAIL_FROM` to something like
   `Aruba Home Services <invoices@yourdomain.aw>`.
   Without a key the app still works — emails are just printed to the server logs.

### Step 6 — Google login (optional)

In Supabase: **Authentication → Providers → Google** → follow their guide to add a
Google OAuth client ID/secret. Email + password login works without this.

### Step 7 — Deploy to Vercel

1. Push this repository to GitHub (it probably already is).
2. Go to [vercel.com](https://vercel.com), sign up with GitHub, click **Add New →
   Project**, and import this repository. Vercel auto-detects Next.js.
3. In the project's **Settings → Environment Variables**, add **every** variable from
   your `.env.local`, and set `NEXT_PUBLIC_SITE_URL` to your live URL
   (e.g. `https://arubahomeservices.vercel.app`).
4. Click **Deploy**. Done — your marketplace is live.
5. In Supabase, go to **Authentication → URL Configuration** and set the Site URL to
   your live URL so login links redirect correctly.

### Growing the directory

Add more companies to `data/aruba-providers-seed.json` (the format is obvious from the
existing entries — findyello.com/aruba is a good source, as noted in the file) and run
`npm run import-seed` again. Or let companies sign themselves up via **List your
business** and verify them in the admin panel.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Run locally at http://localhost:3000 (demo mode without env vars) |
| `npm run build` | Production build (used by Vercel) |
| `npm start` | Serve the production build |
| `npm run import-seed` | Import categories + real providers into Supabase |

## The money flow (by design: no card processor)

1. Customer books — **nothing is charged**; they see an estimated price range.
2. Provider does the job and marks it **complete**, entering the final price in AWG.
3. An **invoice** is generated instantly: on-screen, PDF download, and email — showing
   the Aruba Bank **account name, account number, IBAN, SWIFT** and a unique
   **payment reference** (e.g. `AHS-1029-K7Q2`).
4. The customer transfers the money at their bank, including the reference.
5. You (admin) see the transfer arrive at Aruba Bank, match the reference, and click
   **Mark paid** in `/admin` → the customer's dashboard shows **Paid**.
