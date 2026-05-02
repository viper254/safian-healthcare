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

Go to your Supabase Dashboard → SQL Editor and run `run-all-migrations.sql`

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
- M-Pesa Till Number: **5517358** (SAFIAN SUPPLIES)
- Payment instructions for Safaricom M-PESA and Airtel Money
- WhatsApp order confirmation

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
