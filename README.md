# Safian Healthcare & Medical Supplies

A modern, production-ready e-commerce platform for medical supplies in Kenya. Built with Next.js 16, Supabase, and optimized for 3G networks.

## Features

- 🛒 **WhatsApp-First Ordering** - Primary checkout via WhatsApp
- 📱 **Mobile Optimized** - Works great on 3G connections
- 🔐 **Secure Admin Panel** - Full product & order management
- 📦 **Order Tracking** - Real-time order status updates
- ⭐ **Customer Reviews** - Moderated review system
- 🎨 **Brand Colors** - Green (#6B9F3E), Orange (#F68B1F), Blue (#2B5C9E)
- 🚀 **Performance** - Optimized images, lazy loading, minimal JS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order (see `supabase/migrations/`)
3. Copy `.env.example` to `.env.local`
4. Add your Supabase credentials

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Create Admin User

Run migration `004_create_admin_user.sql` and follow instructions in `ADMIN_SETUP.md`

## Project Structure

```
safian-healthcare/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities & config
│   ├── store/           # Zustand stores
│   └── types/           # TypeScript types
├── supabase/
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── DEPLOYMENT.md        # Deployment guide
```

## Key Pages

- `/` - Homepage with featured products
- `/shop` - Product catalog with filters
- `/product/[slug]` - Product detail page
- `/checkout` - WhatsApp checkout
- `/track-order` - Public order tracking
- `/admin` - Admin dashboard
- `/admin/orders` - Order management
- `/admin/products` - Product management

## Environment Variables

See `.env.example` for all available variables. Required:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://safianhealthcare.com
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/safian-healthcare)

1. Click the button above
2. Add environment variables
3. Deploy!

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin user setup
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization tips
- [SETUP.md](./SETUP.md) - Initial setup guide

## Database Migrations

Run these in Supabase SQL Editor in order:

1. `001_initial_schema.sql` - Core tables
2. `002_seed_data.sql` - Sample data
3. `003_notifications.sql` - Notifications
4. `004_create_admin_user.sql` - Admin setup
5. `005_reviews_system.sql` - Reviews
6. `006_storage_setup.sql` - Storage
7. `007_performance_indexes.sql` - Indexes
8. `008_add_whatsapp_payment.sql` - WhatsApp payment
9. `009_fix_notification_trigger.sql` - Trigger fix

## Contact

- **Phone**: 0756 597 813
- **Email**: info@safianhealthcare.com
- **Location**: Platinum Plaza, Nairobi CBD

## License

Proprietary - Safian Healthcare & Medical Supplies © 2026
