# Safian Healthcare & Supplies

A modern, responsive ecommerce storefront for **Safian Healthcare & Supplies** built with Next.js 14 (App Router), TypeScript, Tailwind CSS and Supabase. The site covers four product categories — **Medical Student Kits · Professional Tools · Facility Items · Patient Supplies** — and ships with a full admin dashboard, analytics, authentication and cart/checkout flows.

## Features

- **Animated landing page** — rotating hero slides, category showcase, featured products, testimonials, marquee strip and a gradient CTA.
- **Shop & product detail** — rich filters (category, brand, offers, stock), search, sort, and a **Grid / List view toggle**. Full product detail page with gallery, specs and add-to-cart.
- **Cart, checkout & order tracking** — Zustand cart persisted to localStorage; checkout supporting M-Pesa, card, cash on delivery and bank transfer; order confirmation with reference number; `/account/orders` for signed-in customers.
- **Authentication** — email/password sign-in & sign-up backed by Supabase Auth. Profiles are auto-created via trigger and tagged with a `customer` or `admin` role.
- **Admin dashboard (`/admin`)** — KPI cards, revenue & orders area chart, category share pie chart, site traffic bar chart (Recharts), top products, recent orders, product / category / customer / order tables and store settings.
- **Responsive everywhere** — mobile bottom nav, mobile drawer menu, sticky cart summary, WhatsApp floating button, safe-area-aware layouts.
- **Zero emojis** — all iconography uses [Lucide React](https://lucide.dev) SVG icons.

## Tech stack

| Layer         | Tool                                      |
| ------------- | ----------------------------------------- |
| Framework     | Next.js 14 (App Router) + TypeScript      |
| Styling       | Tailwind CSS + custom brand palette       |
| UI primitives | Radix UI + shadcn-style wrappers          |
| Animations    | Framer Motion                             |
| Icons         | Lucide React (no emojis anywhere)         |
| Charts        | Recharts                                  |
| State         | Zustand (cart) + React Server Components  |
| Backend       | Supabase (Postgres, Auth, Storage, RLS)   |
| Deployment    | Vercel (frontend) + Supabase (backend)    |

## Getting started locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env vars (optional — the app runs in demo mode without them)
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Visit <http://localhost:3000>. When Supabase env vars aren't set, the app displays a demo banner and uses in-memory mock data so the entire UI remains usable.

## Setting up Supabase

1. Create a new project at <https://supabase.com>.
2. In the **SQL Editor**, run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
3. In **Project settings → API**, copy the **Project URL** and **anon public key** into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Create at least one admin account:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
5. (Optional) Create a public Storage bucket called `product-images` for product photo uploads.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the project at <https://vercel.com/new>.
3. Add the environment variables from `.env.example` in **Settings → Environment Variables**.
4. Deploy. Every subsequent push creates a preview.

## Project structure

```
src/
├── app/                 # App Router pages (home, shop, product, cart, checkout, account, admin, api)
├── components/
│   ├── admin/           # Admin sidebar, topbar, KPI card, charts
│   ├── brand/           # Logo
│   ├── landing/         # Hero, categories showcase, featured products, why us, testimonials…
│   ├── layout/          # Header, footer, mobile bottom bar, WhatsApp FAB, demo banner
│   ├── shop/            # Product card, list item, shop grid, view toggle, add-to-cart bar
│   └── ui/              # Button, input, label, textarea, card, badge, separator
├── lib/                 # Constants, utils, data fetchers, mock data, Supabase clients, admin data
├── store/               # Zustand cart store (localStorage persisted)
├── types/               # Shared TypeScript types
└── middleware.ts        # Supabase session refresh
supabase/
└── migrations/          # Database schema + seed
```

## Brand

- **Primary** `#F68B1F` (orange)
- **Secondary** `#22B04A` (green)
- Logo lives at `public/logo.jpeg`

## License

Proprietary — © Safian Healthcare & Supplies.
