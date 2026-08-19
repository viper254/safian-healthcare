# Safian PWA source of truth

## Customer experience

The current Next.js PWA at the repository root is the sole customer-interface source of truth. Native packages must present this same application rather than reimplementing or restyling it.

| Existing PWA area | Source boundary |
|---|---|
| Brand logo and wordmark | `src/components/brand/logo.tsx` |
| Shared customer navigation and search | `src/components/layout/header.tsx` |
| Customer home composition | `src/app/home/page.tsx` |
| Product catalogue and product pages | `src/app/shop`, `src/app/product` and `src/components/shop` |
| Cart and checkout | `src/app/cart`, `src/app/checkout` and `src/store/cart-store.ts` |
| Customer authentication and account | `src/app/login`, `src/app/register` and `src/app/account` |
| Orders and delivery tracking | `src/app/account/orders`, `src/app/track-order` and `src/app/order-success` |
| Contact and support | `src/app/contact` and `src/components/layout/whatsapp-fab.tsx` |

The real visual system uses the existing Safian orange, green, and blue palette, its logo image, Poppins/Inter typography, rounded components, and brand gradient. Native clients must retain those elements without substitutions.

## Live parity checks

The approved canonical release at `https://safian-healthcare.vercel.app` was checked directly. The `/home` route presents the live Safian logo, free-delivery banner, customer navigation, category links, search, account/cart actions, product links, quote/phone calls to action, and WhatsApp support. The `/shop` route presents the same header and live categories, filters, search, sorting, product cards, prices, stock messaging, cart additions, and product-detail links. Native shells load this exact origin rather than reproducing either screen.

## Shared backend

The existing Supabase authentication, database, storage, and API routes remain the only backend. The current PWA server remains authoritative for server-side pricing, delivery, order creation, inventory, payment configuration, and privileged actions. Native wrapper configuration must contain no service-role or M-Pesa secret.

## Separate admin boundary

The existing `/admin` and `/admin-login` PWA routes are the source of truth for administration. A future separate admin deployment must reuse the actual navigation, role guard, data access, product, order, category, customer, review, notification, and settings flows already under `src/app/admin` and `src/components/admin`. It must not begin with a new dashboard mockup.

## Non-negotiable parity rule

The Android APK, iPhone app, Linux DEB, and Windows EXE must display the same approved PWA release, including all customer routes, copy, branding, cart behavior, sessions, and backend calls. Any future PWA update should be reviewed once and then become available consistently across the wrappers.
