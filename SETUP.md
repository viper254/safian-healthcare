# Safian Healthcare - Setup Guide

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_RESET_PASSWORD=YourSecurePassword123
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run `run-all-migrations.sql`, then run `supabase/migrations/015_mpesa_transactions.sql` if the roll-up is from an older checkout. The new migration creates the server-managed M-Pesa transaction table and its customer/admin read policy.

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Database Migrations

All migrations are in `supabase/migrations/` folder. To apply them:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** → **New query**
4. Copy and paste the contents of `run-all-migrations.sql`
5. Click **Run**

### What the Migrations Do:

- **001-010**: Initial schema, categories, products, orders, reviews, analytics
- **011**: Updates payment method from "whatsapp" to "till" (M-Pesa Till Number: 5517358)
- **012**: Adds DELETE policies for admin to reset orders
- **015**: Adds `mpesa_transactions` for Daraja STK Push tracking and callback verification

## Admin Features

### Reset Orders (Danger Zone)

Location: **Admin → Settings → Danger Zone**

This feature allows admins to permanently delete all orders and order-related analytics.

**Security Requirements:**
1. Must be logged in as admin
2. Must enter the `ADMIN_RESET_PASSWORD` from `.env`
3. Must type "DELETE ALL ORDERS" exactly

**What Gets Deleted:**
- ✅ All orders
- ✅ All order items
- ✅ Order-related analytics (checkout_started, order_placed)

**What Stays Safe:**
- ✅ Products and product images
- ✅ Categories
- ✅ Customers and user accounts
- ✅ Reviews
- ✅ Other analytics (page views, product views, add-to-cart)

## Key Features

### Payment System
Automated checkout uses Safaricom Daraja STK Push. The customer submits an authenticated checkout, the server validates current product prices and stock, creates the order, and sends a payment prompt to the Kenyan phone number. Daraja calls `/api/payments/mpesa/callback` after the customer responds; the server verifies the stored CheckoutRequestID, amount, phone number, and receipt before setting `orders.payment_status` to `paid`. The order-success page polls `/api/payments/mpesa/status` for up to two minutes.

Add the following server-only values to `.env` or the hosting provider’s environment settings: `SUPABASE_SERVICE_ROLE_KEY`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENVIRONMENT=sandbox`, `MPESA_TRANSACTION_TYPE=CustomerPayBillOnline`, and a public HTTPS `MPESA_CALLBACK_URL`. In sandbox, create a Daraja app and use the credentials and test shortcode/passkey issued by the portal. In production, switch to `MPESA_ENVIRONMENT=production` and use the live credentials issued for the merchant’s shortcode. Never expose the consumer secret, passkey, or service-role key as `NEXT_PUBLIC_*` variables.

The existing manual Till/Paybill and WhatsApp path remains available from checkout as a fallback. Confirm the business’s actual Paybill/Till number before publishing manual-payment instructions, because the repository’s historical documentation contains conflicting legacy numbers.

### Product Management
- Multiple categories per product
- Image upload with paste support
- Stock management
- Featured products
- Offer pricing

### Order Management
- Order tracking
- Status updates (pending → confirmed → processing → dispatched → delivered)
- Payment status tracking
- Customer notifications

### Categories
1. Medical Students
2. Doctors and Professionals
3. Facilities, Hospitals and Clinics
4. General Public and Patients [HBC]
5. Diagnostic Essentials
6. Procedure & Practical Kits
7. Medical Wear & Protective Gear
8. Clinical & Academic Support Tools
9. Home Care & Patient Support Devices

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_RESET_PASSWORD`
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
ADMIN_RESET_PASSWORD=YourSecurePassword123
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_live_consumer_key
MPESA_CONSUMER_SECRET=your_live_consumer_secret
MPESA_SHORTCODE=your_live_shortcode
MPESA_PASSKEY=your_live_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
```

## Troubleshooting

### Orders Not Deleting
Make sure you've run migration 012 which adds the DELETE policies for admins.

### Images Not Showing in Product Edit
Images are fetched with `unoptimized` prop for Supabase storage URLs.

### Build Errors
Run `npm run build` to check for TypeScript errors before deploying.

### Supabase Timeout
The app has 10-second timeouts configured for Supabase calls to prevent hanging.

## Contact Information

- **Till Number**: 5517358
- **Business Name**: SAFIAN SUPPLIES
- **Phone**: +254 756 597 813
- **Email**: safianmedicalsupplies@gmail.com

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **State Management**: Zustand (cart)
- **Authentication**: Supabase Auth

## Project Structure

```
safian-healthcare/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   ├── store/           # Zustand stores
│   └── types/           # TypeScript types
├── supabase/
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── .env                 # Environment variables (not in git)
```

## Support

For issues or questions, check the documentation files:
- `FIX_RESET_ORDERS.md` - Detailed reset orders troubleshooting
- `RESET_ORDERS_SETUP.md` - Complete reset orders guide
- `README.md` - Project overview
