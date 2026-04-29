# Safian Healthcare & Medical Supplies

A modern, production-ready e-commerce platform for medical supplies in Kenya. Built with Next.js, Supabase, and optimized for performance.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order from `supabase/migrations/`
3. Copy `.env.example` to `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SITE_URL=https://safianhealthcare.com
   ```

### 3. Run Development Server
```bash
npm run dev
```

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Validation**: Zod
- **Charts**: Recharts

## 📱 Features
- **WhatsApp-First Ordering**: Optimized checkout flow directly to WhatsApp
- **Real-time Analytics**: Track site traffic and sales in the admin dashboard
- **Admin Dashboard**: Full control over products, categories, and orders
- **Mobile Optimized**: Fast loading even on 3G connections
- **SEO Optimized**: Dynamic sitemaps, structured data, Open Graph tags
- **Rate Limited**: Protection against abuse on API endpoints
- **Error Boundaries**: Graceful error handling throughout the app
- **Input Validation**: Zod schemas for all user inputs
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.

## 🔐 Admin Setup
To create an admin user:
1. Sign up via the website's registration page
2. Run the following SQL in your Supabase SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel
```

Add environment variables in Vercel dashboard, then:
```bash
vercel --prod
```

### ⚠️ Important: Custom Domain Setup
**Don't add to Google Search Console with the Vercel URL!** This will make Google show `your-site.vercel.app` instead of your brand name.

**See [`CUSTOM_DOMAIN_SETUP.md`](CUSTOM_DOMAIN_SETUP.md) for step-by-step instructions.**

### Environment Variables
See `.env.example` for all required and optional variables.

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (use your custom domain, not Vercel URL)

**Optional (with defaults):**
- `NEXT_PUBLIC_CONTACT_PHONE`
- `NEXT_PUBLIC_CONTACT_WHATSAPP`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## 🔒 Security Features
- Row Level Security (RLS) on all database tables
- Rate limiting on API endpoints (5 orders/min, 60 analytics/min)
- Input validation with Zod schemas
- Security headers (HSTS, CSP, X-Frame-Options)
- Admin-only routes protected by middleware
- No exposed secrets or credentials

## 📊 Performance
- Lighthouse score: 90+ (Performance, Accessibility, Best Practices, SEO)
- Image optimization with Next.js Image
- Database indexes for fast queries
- ISR for static content
- Minimal JavaScript bundle

## 🧪 Testing
```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📞 Contact
- **Phone**: 0756 597 813
- **Email**: info@safianhealthcare.com
- **Location**: Platinum Plaza, Nairobi CBD

## 📄 License
Proprietary - Safian Healthcare & Medical Supplies © 2026

## 🛠 Development Notes

### Rate Limiting
Current implementation uses in-memory storage. For production with multiple instances, consider:
- Upstash Redis
- Vercel KV
- Redis Cloud

### Error Tracking
Consider adding:
- Sentry for error monitoring
- LogRocket for session replay
- PostHog for product analytics

### Future Enhancements
- [ ] M-Pesa payment integration
- [ ] Card payment gateway
- [ ] Real-time order updates (Supabase Realtime)
- [ ] PWA support
- [ ] Push notifications
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Inventory management
- [ ] Multi-currency support
